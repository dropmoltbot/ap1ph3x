/**
 * MPP Client — Machine Payments Protocol handler
 * 
 * Implements the MPP/Tempo payment flow:
 * 1. Agent sends request to API
 * 2. API returns 402 with WWW-Authenticate: Tempo challenge=...
 * 3. Agent parses the challenge parameters
 * 4. Agent signs EIP-712 typed data for Tempo
 * 5. Agent retries with Authorization header
 * 6. API verifies payment, returns data
 * 
 * No proprietary router. Works with any MPP-compatible endpoint.
 */

import { Wallet } from './wallet.js';

export interface MPPChallenge {
  nonce: string;
  amount: string;
  token: string;
  chainId: number;
  payTo: string;
  service?: string;
  expiresAt?: number;
}

export interface MPPPayment {
  signature: string;
  nonce: string;
  amount: string;
  token: string;
  chainId: number;
}

export interface MPPFetchOptions extends RequestInit {
  preferProtocol?: 'x402' | 'mpp';
}

export class MPPClient {
  private wallet: Wallet;

  constructor(wallet: Wallet) {
    this.wallet = wallet;
  }

  /**
   * Fetch a URL with automatic MPP payment handling
   */
  async fetch(url: string, options: MPPFetchOptions = {}): Promise<Response> {
    // Step 1: Initial request
    const response = await fetch(url, options);

    // If not 402, return as-is
    if (response.status !== 402) {
      return response;
    }

    // Step 2: Parse the WWW-Authenticate header for Tempo/MPP challenge
    const wwwAuth = response.headers.get('www-authenticate');
    if (!wwwAuth) {
      throw new Error('MPP: No WWW-Authenticate header in 402 response');
    }

    const challenge = this.parseMPPChallenge(wwwAuth);
    if (!challenge) {
      throw new Error('MPP: Failed to parse challenge from WWW-Authenticate');
    }

    // Step 3: Sign the payment
    const payment = await this.signMPPPayment(challenge);

    // Step 4: Build Authorization header
    const authHeader = `Tempo signature="${payment.signature}",nonce="${payment.nonce}",amount="${payment.amount}",token="${payment.token}",chain-id="${payment.chainId}"`;

    // Step 5: Retry with payment
    const retryOptions: RequestInit = {
      ...options,
      headers: {
        ...(options.headers as Record<string, string> || {}),
        'Authorization': authHeader,
      },
    };

    return fetch(url, retryOptions);
  }

  /**
   * Parse the WWW-Authenticate header for MPP/Tempo challenge parameters
   * Format: Tempo challenge=xxx,chain-id=4217,nonce=xxx,amount=xxx,token=xxx
   */
  private parseMPPChallenge(header: string): MPPChallenge | null {
    if (!header.toLowerCase().includes('tempo')) {
      return null;
    }

    const params: Record<string, string> = {};
    header.split(',').forEach(pair => {
      const [key, ...valueParts] = pair.split('=');
      const value = valueParts.join('=').replace(/"/g, '').trim();
      params[key.trim().toLowerCase()] = value;
    });

    return {
      nonce: params['nonce'] || randomHex(32),
      amount: params['amount'] || '0',
      token: params['token'] || '0x0000000000000000000000000000000000000000',
      chainId: parseInt(params['chain-id'] || params['chainid'] || '550'),
      payTo: params['payto'] || '',
      service: params['service'],
      expiresAt: params['expiresat'] ? parseInt(params['expiresat']) : undefined,
    };
  }

  /**
   * Sign an MPP/Tempo payment using EIP-712 typed data
   */
  private async signMPPPayment(challenge: MPPChallenge): Promise<MPPPayment> {
    const typedData = {
      domain: {
        name: 'Tempo',
        version: '1',
        chainId: challenge.chainId,
      },
      types: {
        Payment: [
          { name: 'nonce', type: 'string' },
          { name: 'amount', type: 'uint256' },
          { name: 'token', type: 'address' },
        ],
      },
      primaryType: 'Payment' as const,
      message: {
        nonce: challenge.nonce,
        amount: challenge.amount,
        token: challenge.token,
      },
    };

    const signature = await this.wallet.signTypedData(
      typedData.domain,
      typedData.types,
      typedData.message
    );

    return {
      signature,
      nonce: challenge.nonce,
      amount: challenge.amount,
      token: challenge.token,
      chainId: challenge.chainId,
    };
  }
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return '0x' + Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}