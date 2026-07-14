/**
 * X402 Client — HTTP 402 Payment Required handler
 * 
 * Implements the x402 protocol: 
 * 1. Agent sends request to API
 * 2. API returns 402 with payment requirements
 * 3. Agent signs EIP-712 payment
 * 4. Agent retries with Authorization header
 * 5. API verifies payment, returns data
 * 
 * No proprietary router. Direct payment to merchant.
 * Works with ANY x402-compatible endpoint.
 */

import { Wallet, type SignedPayment } from './wallet.js';
import { DEFAULT_CHAINS } from './chains.js';

export interface X402Challenge {
  x402Version: number;
  accepts: X402PaymentOption[];
  error?: string;
  resource?: {
    url: string;
    description: string;
    mimeType: string;
  };
}

export interface X402PaymentOption {
  scheme: string;
  network: string;
  asset: string;
  amount: string;
  payTo: string;
  maxTimeoutSeconds: number;
  extra?: Record<string, unknown>;
}

export interface X402Payment {
  x402Version: number;
  scheme: string;
  network: string;
  payload: {
    signature: string;
    from: string;
    to: string;
    value: string;
    validAfter: string;
    validBefore: string;
    nonce: string;
  };
}

export interface X402FetchOptions extends RequestInit {
  preferProtocol?: 'x402' | 'mpp';
}

export class X402Client {
  private wallet: Wallet;

  constructor(wallet: Wallet) {
    this.wallet = wallet;
  }

  /**
   * Fetch a URL with automatic x402 payment handling
   * 
   * If the server returns 402, the client:
   * 1. Parses the payment challenge
   * 2. Signs an EIP-712 TransferWithAuthorization
   * 3. Retries the request with the payment header
   * 4. Returns the final response
   */
  async fetch(url: string, options: X402FetchOptions = {}): Promise<Response> {
    // Step 1: Initial request
    const response = await fetch(url, options);

    // If not 402, return as-is
    if (response.status !== 402) {
      return response;
    }

    // Step 2: Parse the 402 challenge
    const challenge = await this.parseChallenge(response);
    if (!challenge) {
      throw new Error('Failed to parse 402 challenge');
    }

    // Step 3: Find a compatible payment option
    const option = this.selectPaymentOption(challenge);
    if (!option) {
      throw new Error(`No compatible payment option. Available: ${challenge.accepts.map(a => a.network).join(', ')}`);
    }

    // Step 4: Sign the payment
    const signed = await this.wallet.signTransferWithAuthorization({
      to: option.payTo,
      value: option.amount,
      verifyingContract: option.asset,
      domainName: (option.extra as any)?.name,
      domainVersion: (option.extra as any)?.version,
    });

    // Step 5: Build payment payload
    const payment: X402Payment = {
      x402Version: challenge.x402Version || 1,
      scheme: option.scheme,
      network: option.network,
      payload: {
        signature: signed.signature,
        from: signed.from,
        to: signed.to,
        value: signed.value,
        validAfter: signed.validAfter,
        validBefore: signed.validBefore,
        nonce: signed.nonce,
      },
    };

    // Step 6: Retry with payment
    const paymentHeader = btoa(JSON.stringify(payment));
    const retryOptions: RequestInit = {
      ...options,
      headers: {
        ...(options.headers as Record<string, string> || {}),
        'X-PAYMENT': paymentHeader,
      },
    };

    const finalResponse = await fetch(url, retryOptions);

    // Extract payment metadata from response
    const paymentResponse = finalResponse.headers.get('X-PAYMENT-RESPONSE');
    if (paymentResponse) {
      try {
        const settleInfo = JSON.parse(atob(paymentResponse));
        // Payment settled — attach metadata to response
        (finalResponse as any).paymentSettled = settleInfo;
      } catch {}
    }

    return finalResponse;
  }

  /**
   * Parse the 402 response to extract the payment challenge
   */
  private async parseChallenge(response: Response): Promise<X402Challenge | null> {
    // x402 uses the WWW-Authenticate header or JSON body
    const wwwAuth = response.headers.get('www-authenticate');
    
    if (wwwAuth) {
      // Parse WWW-Authenticate: x402 challenge=base64...
      const match = wwwAuth.match(/x402\s+challenge\s*=\s*"([^"]+)"/i);
      if (match) {
        try {
          return JSON.parse(atob(match[1]));
        } catch {}
      }
    }

    // Try JSON body
    try {
      const body = await response.text();
      const json = JSON.parse(body);
      if (json.accepts || json.x402Version) {
        return json as X402Challenge;
      }
    } catch {}

    return null;
  }

  /**
   * Select the best payment option for our wallet's chain
   */
  private selectPaymentOption(challenge: X402Challenge): X402PaymentOption | null {
    const chainName = this.wallet.chain.name.toLowerCase();
    
    // Try exact chain match first
    let option = challenge.accepts.find(a => 
      a.network.toLowerCase() === chainName ||
      a.network.toLowerCase() === this.wallet.chain.chainId.toString()
    );

    // Try Base (most common x402 network)
    if (!option) {
      option = challenge.accepts.find(a => a.network.toLowerCase() === 'base');
    }

    // Accept any option
    if (!option) {
      option = challenge.accepts[0];
    }

    return option || null;
  }
}