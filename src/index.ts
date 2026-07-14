/**
 * AgentPay — Open-source payment client for AI agents
 * 
 * Zero-custody, multi-protocol (x402 + MPP), multi-chain.
 * No proprietary SDK lock-in. No custodial wallets. No API keys.
 * 
 * @module agentpay
 */

export { AgentPay, type AgentPayConfig, type PayResult, type PaymentProtocol } from './agentpay.js';
export { X402Client, type X402Challenge, type X402Payment } from './x402.js';
export { MPPClient, type MPPChallenge, type MPPPayment } from './mpp.js';
export { Wallet, type WalletConfig } from './wallet.js';
export { DEFAULT_CHAINS, type ChainConfig } from './chains.js';
export { version } from './version.js';