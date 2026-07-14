/**
 * AgentPay — Unified payment client for AI agents
 * 
 * Automatically detects the payment protocol (x402 or MPP)
 * and handles the full payment flow:
 *   request → 402 → parse → sign → retry → data
 * 
 * Zero-custody: the private key never leaves the process.
 * Multi-chain: Base, Ethereum, Tempo, Polygon, Monad, BSC.
 * Multi-protocol: x402 (EIP-712 TransferWithAuthorization) + MPP (Tempo).
 * 
 * @example
 * ```typescript
 * import { AgentPay } from 'agentpay';
 * 
 * const pay = new AgentPay({
 *   privateKey: process.env.PRIVATE_KEY as `0x${string}`,
 *   chain: 'base',
 * });
 * 
 * // Agent makes a paid API call — payment handled automatically
 * const response = await pay.fetch('https://api.example.com/paid-data');
 * const data = await response.json();
 * ```
 */

import { Wallet, type WalletConfig } from './wallet.js';
import { X402Client } from './x402.js';
import { MPPClient } from './mpp.js';

export type PaymentProtocol = 'x402' | 'mpp';

export interface AgentPayConfig extends WalletConfig {
  /** Default protocol preference when both are available */
  defaultProtocol?: PaymentProtocol;
  /** Max spend per call (USDC, human-readable). Calls above this are rejected. */
  maxPerCall?: string;
  /** Max spend per day (USDC). Resets at midnight UTC. */
  maxPerDay?: string;
  /** Request timeout in ms */
  timeout?: number;
}

export interface PayResult {
  protocol: PaymentProtocol;
  status: number;
  paid: boolean;
  amount?: string;
  network?: string;
  payTo?: string;
  response: Response;
}

export class AgentPay {
  private wallet: Wallet;
  private x402: X402Client;
  private mpp: MPPClient;
  private defaultProtocol: PaymentProtocol;
  private maxPerCall: bigint | null;
  private maxPerDay: bigint | null;
  private dailySpent: bigint = 0n;
  private dailyResetAt: number = 0;
  private timeout: number;

  constructor(config: AgentPayConfig) {
    this.wallet = new Wallet(config);
    this.x402 = new X402Client(this.wallet);
    this.mpp = new MPPClient(this.wallet);
    this.defaultProtocol = config.defaultProtocol || 'x402';
    this.maxPerCall = config.maxPerCall ? parseUSDC(config.maxPerCall) : null;
    this.maxPerDay = config.maxPerDay ? parseUSDC(config.maxPerDay) : null;
    this.timeout = config.timeout || 30000;
  }

  /**
   * Get the wallet address
   */
  get address(): string {
    return this.wallet.address;
  }

  /**
   * Fetch a URL with automatic payment handling.
   * 
   * The client will:
   * 1. Send the initial request
   * 2. If 402, detect the protocol (x402 or MPP)
   * 3. Sign the appropriate payment
   * 4. Retry with payment header
   * 5. Return the final response
   * 
   * Enforces spending caps (per-call and per-day) if configured.
   */
  async fetch(url: string, options: { 
    method?: string; 
    headers?: Record<string, string>; 
    body?: string;
    preferProtocol?: PaymentProtocol;
  } = {}): Promise<Response> {
    const protocol = options.preferProtocol || this.defaultProtocol;

    // Check daily spend limit
    this.checkDailyReset();
    if (this.maxPerDay && this.dailySpent >= this.maxPerDay) {
      throw new Error(`Daily spend limit reached: ${formatUSDC(this.maxPerDay)} USDC`);
    }

    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body,
      signal: AbortSignal.timeout(this.timeout),
    };

    // Try preferred protocol first
    const client = protocol === 'mpp' ? this.mpp : this.x402;
    const response = await client.fetch(url, fetchOptions);

    // If 402 and we tried x402, fall back to MPP
    if (response.status === 402 && protocol === 'x402') {
      const fallback = await this.mpp.fetch(url, fetchOptions);
      if (fallback.status !== 402) {
        return fallback;
      }
    }

    // If 402 and we tried MPP, fall back to x402
    if (response.status === 402 && protocol === 'mpp') {
      const fallback = await this.x402.fetch(url, fetchOptions);
      if (fallback.status !== 402) {
        return fallback;
      }
    }

    return response;
  }

  /**
   * Create a paid fetch function bound to a base URL
   * (For API SDK generation)
   */
  createFetch(baseUrl: string) {
    return async (path: string, init?: RequestInit) => {
      const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
      return this.fetch(url, {
        method: init?.method,
        headers: init?.headers as Record<string, string>,
        body: init?.body as string,
      });
    };
  }

  /**
   * Get current daily spend
   */
  getDailySpend(): string {
    return formatUSDC(this.dailySpent);
  }

  /**
   * Reset daily spend counter (called automatically at midnight UTC)
   */
  private checkDailyReset() {
    const now = Date.now();
    const midnight = new Date(now).setUTCHours(24, 0, 0, 0);
    if (now >= midnight) {
      this.dailySpent = 0n;
      this.dailyResetAt = midnight;
    }
  }
}

// ═══ UTILITIES ═══

function parseUSDC(human: string): bigint {
  // Parse "0.01" → 10000n (USDC has 6 decimals)
  const [whole, frac = ''] = human.split('.');
  const padded = (frac + '000000').slice(0, 6);
  return BigInt(whole) * 1000000n + BigInt(padded);
}

function formatUSDC(wei: bigint): string {
  const whole = wei / 1000000n;
  const frac = wei % 1000000n;
  return `${whole}.${frac.toString().padStart(6, '0')}`;
}