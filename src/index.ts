/**
 * Ap1ph3 — Open-source payment client for AI agents
 * 
 * Zero-custody, multi-protocol (x402 + MPP), multi-chain.
 * No proprietary SDK lock-in. No custodial wallets. No API keys.
 * 
 * @module ap1ph3
 */

export { Ap1ph3, type Ap1ph3Config, type PayResult, type PaymentProtocol } from './ap1ph3.js';
export { X402Client, type X402Challenge, type X402Payment } from './x402.js';
export { MPPClient, type MPPChallenge, type MPPPayment } from './mpp.js';
export { Wallet, type WalletConfig } from './wallet.js';
export { DEFAULT_CHAINS, type ChainConfig } from './chains.js';
export { version } from './version.js';

// API Registry
export {
  ALL_APIS,
  CATEGORIES,
  SEARCH_APIS,
  CRYPTO_APIS,
  AI_APIS,
  SOCIAL_APIS,
  DEV_APIS,
  LOCATION_APIS,
  getAPIsByCategory,
  getAPIsByAuth,
  getFreeAPIs,
  getX402APIs,
  getMPPAPIs,
  getSelfHostableAPIs,
  searchAPIs,
  type APIEndpoint,
  type APIAuthMethod,
  type APIProtocol,
} from './registry.js';