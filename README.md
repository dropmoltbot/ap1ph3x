# 🔐 ap1ph3x

**API + Cipher + Hex. The encrypted payment protocol for AI agents.**

Open-source x402 + MPP client for AI agents. Multi-chain. Zero custody. 1793+ public API registry across 53 categories included.

```
npm install ap1ph3x
```

![ap1ph3x](assets/ap1ph3x-logo.svg)

---

## Why ap1ph3x?

| Normal Payment SDKs | ap1ph3x |
|---|---|
| Proprietary lock-in | MIT, open-source forever |
| Single chain | 6 chains (Base, ETH, Tempo, Polygon, Monad, BSC) |
| Custodial risk | Zero custody — key never leaves your process |
| Single protocol | x402 **AND** MPP auto-detection |
| Manual API discovery | 1793+ API registry built-in |
| No free API support | 17 free APIs (no key, no payment needed) |

## Quick Start

```typescript
import { Ap1ph3x } from 'ap1ph3x';

const pay = new Ap1ph3x({
  privateKey: process.env.PRIVATE_KEY as `0x${string}`,
  chain: 'base',
  maxPerCall: 0.01,  // USDC
  maxPerDay: 10.00,  // USDC
});

// fetch a paid API endpoint — ap1ph3x handles the 402 flow automatically
const data = await pay.fetch('https://api.exa.ai/search', {
  method: 'POST',
  body: { query: 'machine payments' },
});

console.log(data);  // ✅ response body + payment receipt
```

## CLI

```bash
npx ap1ph3x fetch https://api.exa.ai/search --method POST --body '{"query":"test"}'
npx ap1ph3x wallet   # show wallet info
npx ap1ph3x test     # self-test
```

## API Registry

ap1ph3x ships with a curated registry of 1779+ public APIs across 53 categories:

```typescript
import { getFreeAPIs, getX402APIs, getSelfHostableAPIs } from 'ap1ph3x';

getFreeAPIs();         // 739 free APIs APIs (no key, no payment)
getX402APIs();         // x402-compatible paid APIs-compatible paid APIs
getSelfHostableAPIs(); // self-hostable (privacy-first)-hostable (privacy-first)
```

### Categories (53 total, 1779+ APIs)

| Category | Count | Examples |
|---|---|---|
| AI Agents | 200 | Adala, AgentForge, AgentGPT, AgentPilot |
| Development | 133 | GitHub, GitLab, npm, PyPI, DNS, httpbin |
| Games & Comics | 97 | Steam, Riot Games, Pokémon, Hearthstone |
| Government | 97 | US Census, EU Open Data, FBI, FDA |
| Geocoding | 92 | OpenStreetMap, Google Maps, Mapbox |
| Transportation | 74 | FAA, NYC Subway, Transit, BTS |
| Cryptocurrency | 69 | CoinGecko, DefiLlama, Etherscan, Binance |
| Finance | 53 | Alpha Vantage, FRED, IMF, World Bank |
| Open Data | 45 | Wikipedia, Data.gov, OpenCorporates |
| Video | 45 | YouTube, Vimeo, Dailymotion, TED |
| Social | 43 | Reddit, Mastodon, Telegram, Discord |
| Security | 42 | VirusTotal, HaveIBeenPwned, SecurityTrails |
| Machine Learning | 30 | HuggingFace, OpenAI, Vertex AI, Clarifai |
| Weather | 33 | Open-Meteo, NOAA, OpenWeatherMap |
| Music | 34 | Spotify, Last.fm, MusicBrainz, Deezer |
| + 38 more categories | — | Blockchain, Health, News, Science, Email... |

## Architecture

```
┌─────────────────────────────────────────┐
│            ap1ph3x                     │
│  ┌─────────────────────────────────┐    │
│  │         Ap1ph3x (main)         │    │
│  │   ┌──────────┐ ┌──────────────┐  │    │
│  │   │ X402     │ │  MPP         │  │    │
│  │   │ Client   │ │  Client      │  │    │
│  │   └────┬─────┘ └──────┬───────┘  │    │
│  │        └──────┬───────┘          │    │
│  │          ┌────▼─────┐            │    │
│  │          │  Wallet  │            │    │
│  │          │ (viem)   │            │    │
│  │          └──────────┘            │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │     API Registry (1779+)      │    │
│  │  search|crypto|ai|social|dev|... │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## Supported Chains

| Chain | Chain ID | USDC | Native |
|---|---|---|---|
| Base | 8453 | ✅ | ETH |
| Ethereum | 1 | ✅ | ETH |
| Tempo | 5042 | ✅ | ETH |
| Polygon | 137 | ✅ | MATIC |
| Monad (testnet) | 10143 | ❌ | MON |
| BSC | 56 | ✅ | BNB |

## License

MIT — Dropxtor (@0xDropxtor)

## Links

- **GitHub**: [github.com/dropmoltbot/ap1ph3x](https://github.com/dropmoltbot/ap1ph3x)
- **npm**: `npm install ap1ph3x`

```
  ┌──┐ ┌──┐ ┌──┐
  │AP│ │1P│ │H3│
  │  │ │  │ │ X│
  └──┘ └──┘ └──┘
  API + CIPHER + HEX
```

🔐 Built by [Dropxtor](https://github.com/dropmoltbot) · MIT License · 2026