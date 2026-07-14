# ⚡ AgentPay

**Open-source payment client for AI agents. Multi-protocol. Multi-chain. Zero custody.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-≥18-green.svg)](https://nodejs.org)
[![npm](https://img.shields.io/badge/npm-@dropmoltbot%2Fagentpay-red.svg)](https://www.npmjs.com/package/@dropmoltbot/agentpay)
[![Protocol](https://img.shields.io/badge/Protocol-x402%20%2B%20MPP-purple.svg)](https://github.com/dropmoltbot/agentpay)
[![Chains](https://img.shields.io/badge/Chains-Base%20%7C%20ETH%20%7C%20Tempo%20%7C%20Polygon%20%7C%20Monad%20%7C%20BSC-orange.svg)](https://github.com/dropmoltbot/agentpay)

> **Agents don't need API keys. They need a wallet.**

---

## Why?

Every AI agent eventually hits a paywall. The current options are broken:

| Problem | AgentPay |
|---------|----------|
| API keys leak, expire, need rotation | ❌ No keys. Pay per-call. |
| Custodial wallets hold your funds | ❌ Self-custody. Key never leaves process. |
| Single-protocol lock-in | ✅ x402 + MPP, auto-detect |
| Single-chain dependency | ✅ Base, Ethereum, Tempo, Polygon, Monad, BSC |
| Proprietary router/middleware | ❌ Direct agent→merchant payment |
| No spend caps | ✅ Per-call + per-day limits |
| Closed source | ✅ MIT licensed, fully open |

---

## Install

```bash
npm install @dropmoltbot/agentpay
```

**Optional peer dependency** (for EIP-712 signing):

```bash
npm install viem
```

---

## Quick Start

```typescript
import { AgentPay } from '@dropmoltbot/agentpay';

const pay = new AgentPay({
  privateKey: process.env.PRIVATE_KEY as `0x${string}`,
  chain: 'base',
  maxPerCall: '1.00',    // Max 1 USDC per call
  maxPerDay: '10.00',    // Max 10 USDC per day
});

// Agent makes a paid API call — payment is automatic
const response = await pay.fetch('https://api.example.com/paid-data');
const data = await response.json();
```

### CLI

```bash
# Install globally
npm install -g @dropmoltbot/agentpay

# Set your private key
export PRIVATE_KEY=0x...

# Make a paid API call
agentpay fetch https://api.example.com/data

# POST with body
agentpay fetch https://api.example.com/search --method POST --body '{"q":"test"}'

# Use MPP protocol
agentpay fetch https://api.example.com/data --protocol mpp

# Show wallet info
agentpay wallet

# Run self-test
agentpay test
```

---

## How It Works

```
┌─────────────┐
│ Agent        │─── GET /data ──────────────▶│ API Endpoint │
│ (AgentPay)   │◀── 402 Payment Required ───│              │
│              │                              │              │
│  1. Parse 402│                              │              │
│  2. Detect   │                              │              │
│     protocol │                              │              │
│  3. Sign     │─── GET /data ──────────────▶│              │
│     EIP-712  │    X-PAYMENT: <signed>       │              │
│              │    Authorization: Tempo ...   │              │
│              │◀── 200 OK + data ────────────│              │
│              │    X-PAYMENT-RESPONSE: ...   │              │
└─────────────┘                              └──────────────┘
```

### Protocol Detection

AgentPay automatically detects the payment protocol from the 402 response:

| Protocol | Detection | Signing |
|----------|-----------|---------|
| **x402** | `WWW-Authenticate: x402` or JSON body with `accepts[]` | EIP-712 `TransferWithAuthorization` |
| **MPP** | `WWW-Authenticate: Tempo challenge=...` | EIP-712 `Payment` typed data |

If the preferred protocol fails, AgentPay falls back to the other automatically.

---

## API

### `AgentPay`

```typescript
const pay = new AgentPay({
  privateKey: '0x...',           // EVM private key
  chain: 'base',                  // Chain (base|ethereum|tempo|polygon|monad|bsc)
  defaultProtocol: 'x402',       // Default: x402 (fallback: mpp)
  maxPerCall: '1.00',            // Optional: max USDC per call
  maxPerDay: '10.00',             // Optional: max USDC per day
  timeout: 30000,                 // Optional: request timeout ms
});

// Make a paid fetch
const response = await pay.fetch(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ query: 'test' }),
  preferProtocol: 'x402',  // or 'mpp'
});

// Create a bound fetch for an API base URL
const apiFetch = pay.createFetch('https://api.example.com');
const res = await apiFetch('/v1/search?q=eth');
```

### `Wallet`

```typescript
import { Wallet } from '@dropmoltbot/agentpay';

const wallet = new Wallet({
  privateKey: '0x...',
  chain: 'base',
});

// Sign x402 TransferWithAuthorization
const signed = await wallet.signTransferWithAuthorization({
  to: '0xpayee...',
  value: '10000',  // 0.01 USDC in atomic units
});

// Sign custom EIP-712
const sig = await wallet.signTypedData(domain, types, message);

// Sign raw message
const sig = await wallet.signMessage('hello');
```

### `X402Client` / `MPPClient`

Use the protocol clients directly for fine-grained control:

```typescript
import { Wallet, X402Client, MPPClient } from '@dropmoltbot/agentpay';

const wallet = new Wallet({ privateKey: '0x...', chain: 'base' });
const x402 = new X402Client(wallet);
const mpp = new MPPClient(wallet);

// Direct x402 fetch
const res1 = await x402.fetch('https://api.example.com/data');

// Direct MPP fetch
const res2 = await mpp.fetch('https://api.example.com/data');
```

---

## Supported Chains

| Chain | Chain ID | USDC | Status |
|-------|----------|------|--------|
| **Base** | 8453 | ✅ Native | ✅ Primary |
| **Ethereum** | 1 | ✅ Native | ✅ Supported |
| **Tempo** | 550 | ✅ pathUSD | ✅ MPP |
| **Polygon** | 137 | ✅ Native | ✅ Supported |
| **Monad** | 10143 | TBD | ⚠️ Testnet |
| **BSC** | 56 | ✅ Native | ✅ Supported |

### Custom Chains

```typescript
import { AgentPay } from '@dropmoltbot/agentpay';

const pay = new AgentPay({
  privateKey: '0x...',
  chainConfig: {
    name: 'MyChain',
    chainId: 12345,
    rpcUrl: 'https://rpc.mychain.io',
    usdcAddress: '0x...',
    nativeSymbol: 'MYT',
  },
});
```

---

## Spend Caps

AgentPay enforces spending limits to prevent runaway agent costs:

```typescript
const pay = new AgentPay({
  privateKey: '0x...',
  maxPerCall: '0.50',  // Reject calls above 0.50 USDC
  maxPerDay: '5.00',   // Stop after 5.00 USDC/day total
});

// Check current spend
console.log(pay.getDailySpend()); // "2.340000"
```

---

## Privacy

- **No tracking**: AgentPay doesn't phone home. No analytics. No telemetry.
- **No custody**: Your private key stays in your process. We never see it.
- **No router**: Payments go directly from agent to merchant. No intermediary.
- **No API keys**: Every payment is a one-time signed transaction. Nothing stored.
- **Open source**: MIT licensed. Audit the code. Fork it. Own it.

---

## Comparison

| Feature | AgentPay | SELAT | Raw x402 | API Keys |
|---------|----------|-------|----------|----------|
| Open source | ✅ MIT | ❌ Proprietary | ✅ | N/A |
| Multi-protocol | ✅ x402 + MPP | ✅ x402 + MPP | ❌ x402 only | N/A |
| Multi-chain | ✅ 6 chains | ❌ Arc only | ✅ per-chain | N/A |
| Self-custody | ✅ | ✅ | ✅ | N/A |
| No router lock-in | ✅ | ❌ SELAT Router | ✅ | N/A |
| Spend caps | ✅ Built-in | ✅ | ❌ | N/A |
| CLI tool | ✅ | ❌ | ❌ | N/A |
| npm package | ✅ | ✅ | ❌ | N/A |
| Zero dependencies | ✅ Core only | ❌ Many | ❌ | N/A |

---

## Build From Source

```bash
git clone https://github.com/dropmoltbot/agentpay.git
cd agentpay
npm install
npm run build
```

---

## License

MIT — see [LICENSE](LICENSE)

---

## Author

**Dropxtor** — [@0xDropxtor](https://x.com/0xDropxtor) · [GitHub](https://github.com/dropxtor)

Built with Hermes Agent by Nous Research.

---

<div align="center">

**Agents are the new economic actors. AgentPay is how they pay — without giving up their keys.**

</div>