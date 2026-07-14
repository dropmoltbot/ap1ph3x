/**
 * API Registry — Curated catalog of public, open-source, and free API endpoints
 * compatible with ap1ph3x's x402/MPP payment flow.
 * 
 * These endpoints are organized by category and include:
 * - Free APIs (no payment needed)
 * - Paid APIs (x402 or MPP compatible)
 * - Open-source APIs (self-hostable)
 * 
 * Each entry includes the protocol, auth method, and whether it's
 * payment-compatible.
 */

export type APIAuthMethod = 'none' | 'x402' | 'mpp' | 'apikey' | 'oauth' | 'opensource';
export type APIProtocol = 'REST' | 'GraphQL' | 'WebSocket' | 'gRPC';

export interface APIEndpoint {
  id: string;
  name: string;
  category: string;
  url: string;
  protocol: APIProtocol;
  authMethod: APIAuthMethod;
  description: string;
  pricing?: string;
  docs?: string;
  github?: string;
  selfHostable?: boolean;
  tags?: string[];
}

// ═══════════════════════════════════════════════════════════════
// SEARCH & DATA
// ═══════════════════════════════════════════════════════════════

export const SEARCH_APIS: APIEndpoint[] = [
  {
    id: 'exa-search',
    name: 'Exa AI Search',
    category: 'search',
    url: 'https://api.exa.ai/search',
    protocol: 'REST',
    authMethod: 'x402',
    description: 'Neural web search for AI agents. Real-time results with semantic ranking.',
    pricing: '$0.007-0.015/call',
    docs: 'https://docs.exa.ai',
    tags: ['search', 'web', 'ai', 'neural'],
  },
  {
    id: 'duckduckgo',
    name: 'DuckDuckGo Instant Answer',
    category: 'search',
    url: 'https://api.duckduckgo.com/',
    protocol: 'REST',
    authMethod: 'none',
    description: 'Free instant answer API. No key, no payment, no tracking.',
    pricing: 'Free',
    docs: 'https://duckduckgo.com/api',
    tags: ['search', 'free', 'privacy'],
  },
  {
    id: 'searx',
    name: 'SearXNG',
    category: 'search',
    url: 'https://searx.be/search',
    protocol: 'REST',
    authMethod: 'opensource',
    description: 'Privacy-respecting metasearch engine. Self-hostable.',
    pricing: 'Free',
    github: 'https://github.com/searxng/searxng',
    selfHostable: true,
    tags: ['search', 'privacy', 'self-host'],
  },
  {
    id: 'wikipedia',
    name: 'Wikipedia API',
    category: 'search',
    url: 'https://en.wikipedia.org/w/api.php',
    protocol: 'REST',
    authMethod: 'none',
    description: 'Free Wikipedia article search and retrieval.',
    pricing: 'Free',
    docs: 'https://www.mediawiki.org/wiki/API:Main_page',
    tags: ['search', 'knowledge', 'free'],
  },
  {
    id: 'openalex',
    name: 'OpenAlex',
    category: 'search',
    url: 'https://api.openalex.org',
    protocol: 'REST',
    authMethod: 'none',
    description: 'Open catalog of scholarly works, authors, institutions. 250M+ works.',
    pricing: 'Free',
    docs: 'https://docs.openalex.org',
    github: 'https://github.com/ourresearch/openalex-api',
    tags: ['search', 'academic', 'research', 'free'],
  },
];

// ═══════════════════════════════════════════════════════════════
// CRYPTO & FINANCE
// ═══════════════════════════════════════════════════════════════

export const CRYPTO_APIS: APIEndpoint[] = [
  {
    id: 'coingecko',
    name: 'CoinGecko',
    category: 'crypto',
    url: 'https://api.coingecko.com/api/v3',
    protocol: 'REST',
    authMethod: 'apikey',
    description: 'Crypto prices, market data, trending coins. Free tier: 30 calls/min.',
    pricing: 'Free tier / $129/mo Pro',
    docs: 'https://www.coingecko.com/api/documentation',
    tags: ['crypto', 'price', 'market', 'free'],
  },
  {
    id: 'coinmarketcap-x402',
    name: 'CoinMarketCap (x402)',
    category: 'crypto',
    url: 'https://pro-api.coinmarketcap.com/x402/v3/cryptocurrency/quotes/latest',
    protocol: 'REST',
    authMethod: 'x402',
    description: 'Real-time crypto quotes via x402 payment protocol. Per-call pricing.',
    pricing: '$0.01/call',
    tags: ['crypto', 'price', 'x402', 'paid'],
  },
  {
    id: 'defillama',
    name: 'DefiLlama',
    category: 'crypto',
    url: 'https://api.llama.fi',
    protocol: 'REST',
    authMethod: 'none',
    description: 'DeFi TVL data across all chains. Completely free, no key.',
    pricing: 'Free',
    docs: 'https://defillama.com/docs/api',
    tags: ['crypto', 'defi', 'tvl', 'free'],
  },
  {
    id: 'etherscan',
    name: 'Etherscan',
    category: 'crypto',
    url: 'https://api.etherscan.io/api',
    protocol: 'REST',
    authMethod: 'apikey',
    description: 'Ethereum blockchain data, transactions, contracts. Free: 5 calls/sec.',
    pricing: 'Free tier',
    docs: 'https://docs.etherscan.io',
    tags: ['crypto', 'ethereum', 'blockchain', 'free'],
  },
  {
    id: 'covalent',
    name: 'Covalent',
    category: 'crypto',
    url: 'https://api.covalenthq.com/v1',
    protocol: 'REST',
    authMethod: 'apikey',
    description: 'Unified blockchain data API across 100+ chains.',
    pricing: 'Free tier',
    docs: 'https://docs.covalenthq.com',
    tags: ['crypto', 'multi-chain', 'blockchain'],
  },
  {
    id: 'rpc-eth',
    name: 'Ethereum RPC (Llama)',
    category: 'crypto',
    url: 'https://eth.llamarpc.com',
    protocol: 'REST',
    authMethod: 'none',
    description: 'Free Ethereum JSON-RPC endpoint. No key needed.',
    pricing: 'Free',
    tags: ['crypto', 'rpc', 'ethereum', 'free'],
  },
  {
    id: 'rpc-base',
    name: 'Base RPC',
    category: 'crypto',
    url: 'https://mainnet.base.org',
    protocol: 'REST',
    authMethod: 'none',
    description: 'Free Base L2 JSON-RPC endpoint.',
    pricing: 'Free',
    tags: ['crypto', 'rpc', 'base', 'free'],
  },
  {
    id: 'rpc-monad',
    name: 'Monad Testnet RPC',
    category: 'crypto',
    url: 'https://testnet-rpc.monad.xyz',
    protocol: 'REST',
    authMethod: 'none',
    description: 'Monad testnet RPC. Chain ID 10143.',
    pricing: 'Free',
    tags: ['crypto', 'rpc', 'monad', 'free'],
  },
];

// ═══════════════════════════════════════════════════════════════
// AI & ML
// ═══════════════════════════════════════════════════════════════

export const AI_APIS: APIEndpoint[] = [
  {
    id: 'huggingface',
    name: 'Hugging Face Inference',
    category: 'ai',
    url: 'https://api-inference.huggingface.co/models',
    protocol: 'REST',
    authMethod: 'apikey',
    description: 'Free inference for 100K+ models. Text, image, audio, tabular.',
    pricing: 'Free tier',
    docs: 'https://huggingface.co/docs/api-inference',
    github: 'https://github.com/huggingface',
    tags: ['ai', 'ml', 'inference', 'free'],
  },
  {
    id: 'ollama',
    name: 'Ollama',
    category: 'ai',
    url: 'http://localhost:11434/api',
    protocol: 'REST',
    authMethod: 'none',
    description: 'Run LLMs locally. Open-source. No API, no cloud, full privacy.',
    pricing: 'Free (self-hosted)',
    github: 'https://github.com/ollama/ollama',
    selfHostable: true,
    tags: ['ai', 'llm', 'local', 'privacy', 'self-host'],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    category: 'ai',
    url: 'https://openrouter.ai/api/v1',
    protocol: 'REST',
    authMethod: 'apikey',
    description: 'Unified API for 200+ LLMs. Pay per use. Includes free models.',
    pricing: 'Per-token (varies)',
    docs: 'https://openrouter.ai/docs',
    tags: ['ai', 'llm', 'multi-model'],
  },
  {
    id: 'localai',
    name: 'LocalAI',
    category: 'ai',
    url: 'http://localhost:8080/v1',
    protocol: 'REST',
    authMethod: 'none',
    description: 'Self-hosted OpenAI-compatible API. Text, image, audio generation.',
    pricing: 'Free (self-hosted)',
    github: 'https://github.com/mudler/LocalAI',
    selfHostable: true,
    tags: ['ai', 'llm', 'local', 'self-host', 'privacy'],
  },
];

// ═══════════════════════════════════════════════════════════════
// SOCIAL & CONTENT
// ═══════════════════════════════════════════════════════════════

export const SOCIAL_APIS: APIEndpoint[] = [
  {
    id: 'nansen-mpp',
    name: 'Nansen Smart Money (MPP)',
    category: 'social',
    url: 'https://api.nansen.ai/api/v1/smart-money/netflow',
    protocol: 'REST',
    authMethod: 'mpp',
    description: 'Smart money flow analysis via MPP payment protocol.',
    pricing: '$0.05/call',
    tags: ['crypto', 'analytics', 'mpp', 'paid'],
  },
  {
    id: 'hn-api',
    name: 'Hacker News API',
    category: 'social',
    url: 'https://hacker-news.firebaseio.com/v0',
    protocol: 'REST',
    authMethod: 'none',
    description: 'Hacker News stories, comments, users. Free, no key.',
    pricing: 'Free',
    docs: 'https://github.com/HackerNews/API',
    tags: ['social', 'news', 'free'],
  },
  {
    id: 'reddit-api',
    name: 'Reddit API',
    category: 'social',
    url: 'https://www.reddit.com',
    protocol: 'REST',
    authMethod: 'oauth',
    description: 'Reddit posts, comments, subreddits. OAuth2 for write access.',
    pricing: 'Free',
    docs: 'https://www.reddit.com/dev/api',
    tags: ['social', 'forum', 'free'],
  },
  {
    id: 'mastodon',
    name: 'Mastodon API',
    category: 'social',
    url: 'https://mastodon.social/api/v1',
    protocol: 'REST',
    authMethod: 'oauth',
    description: 'Federated social network. Open-source, self-hostable.',
    pricing: 'Free',
    github: 'https://github.com/mastodon/mastodon',
    selfHostable: true,
    tags: ['social', 'federated', 'self-host', 'privacy'],
  },
  {
    id: 'rss-bridge',
    name: 'RSS-Bridge',
    category: 'social',
    url: 'https://rss-bridge.org/bridge01/',
    protocol: 'REST',
    authMethod: 'opensource',
    description: 'Generate RSS feeds from any site. Self-hostable.',
    pricing: 'Free',
    github: 'https://github.com/RSS-Bridge/rss-bridge',
    selfHostable: true,
    tags: ['rss', 'feed', 'self-host'],
  },
];

// ═══════════════════════════════════════════════════════════════
// DEVELOPER TOOLS
// ═══════════════════════════════════════════════════════════════

export const DEV_APIS: APIEndpoint[] = [
  {
    id: 'github-api',
    name: 'GitHub API',
    category: 'developer',
    url: 'https://api.github.com',
    protocol: 'REST',
    authMethod: 'apikey',
    description: 'GitHub repos, issues, PRs, users. 60 calls/hr free (5000 with token).',
    pricing: 'Free tier',
    docs: 'https://docs.github.com/en/rest',
    tags: ['dev', 'git', 'code', 'free'],
  },
  {
    id: 'gitlab-api',
    name: 'GitLab API',
    category: 'developer',
    url: 'https://gitlab.com/api/v4',
    protocol: 'REST',
    authMethod: 'apikey',
    description: 'GitLab repos, CI/CD, issues. Self-hostable.',
    pricing: 'Free tier',
    github: 'https://gitlab.com/gitlab-org/gitlab',
    selfHostable: true,
    tags: ['dev', 'git', 'ci-cd', 'self-host'],
  },
  {
    id: 'npm-registry',
    name: 'npm Registry',
    category: 'developer',
    url: 'https://registry.npmjs.org',
    protocol: 'REST',
    authMethod: 'none',
    description: 'npm package metadata, versions, dependencies. No key needed.',
    pricing: 'Free',
    tags: ['dev', 'npm', 'packages', 'free'],
  },
  {
    id: 'pypi',
    name: 'PyPI API',
    category: 'developer',
    url: 'https://pypi.org/pypi',
    protocol: 'REST',
    authMethod: 'none',
    description: 'Python package index. Package metadata, versions.',
    pricing: 'Free',
    tags: ['dev', 'python', 'packages', 'free'],
  },
  {
    id: 'dns-json',
    name: 'Google DNS over HTTPS',
    category: 'developer',
    url: 'https://dns.google/resolve',
    protocol: 'REST',
    authMethod: 'none',
    description: 'DNS resolution over HTTPS. Free, no key.',
    pricing: 'Free',
    tags: ['dev', 'dns', 'network', 'free'],
  },
  {
    id: 'httpbin',
    name: 'httpbin',
    category: 'developer',
    url: 'https://httpbin.org',
    protocol: 'REST',
    authMethod: 'none',
    description: 'HTTP request/response testing. Free, no key.',
    pricing: 'Free',
    github: 'https://github.com/postmanlabs/httpbin',
    selfHostable: true,
    tags: ['dev', 'testing', 'http', 'free'],
  },
];

// ═══════════════════════════════════════════════════════════════
// WEATHER & LOCATION
// ═══════════════════════════════════════════════════════════════

export const LOCATION_APIS: APIEndpoint[] = [
  {
    id: 'open-meteo',
    name: 'Open-Meteo',
    category: 'weather',
    url: 'https://api.open-meteo.com/v1',
    protocol: 'REST',
    authMethod: 'none',
    description: 'Free weather API. No key needed. 10K calls/day free.',
    pricing: 'Free',
    docs: 'https://open-meteo.com/en/docs',
    github: 'https://github.com/open-meteo/open-meteo',
    selfHostable: true,
    tags: ['weather', 'free', 'no-key'],
  },
  {
    id: 'nominatim',
    name: 'OpenStreetMap Nominatim',
    category: 'location',
    url: 'https://nominatim.openstreetmap.org',
    protocol: 'REST',
    authMethod: 'none',
    description: 'Geocoding, reverse geocoding. Free, open-source.',
    pricing: 'Free (rate-limited)',
    github: 'https://github.com/osm-search/Nominatim',
    selfHostable: true,
    tags: ['location', 'geocoding', 'free', 'open-source'],
  },
  {
    id: 'osrm',
    name: 'OSRM',
    category: 'location',
    url: 'https://router.project-osrm.org',
    protocol: 'REST',
    authMethod: 'none',
    description: 'Routing API. Shortest path, nearest, table. Self-hostable.',
    pricing: 'Free',
    github: 'https://github.com/Project-OSRM/osrm-backend',
    selfHostable: true,
    tags: ['location', 'routing', 'free', 'self-host'],
  },
];

// ═══════════════════════════════════════════════════════════════
// ALL CATEGORIES — Unified registry
// ═══════════════════════════════════════════════════════════════

export const ALL_APIS: APIEndpoint[] = [
  ...SEARCH_APIS,
  ...CRYPTO_APIS,
  ...AI_APIS,
  ...SOCIAL_APIS,
  ...DEV_APIS,
  ...LOCATION_APIS,
];

export const CATEGORIES = {
  search: SEARCH_APIS,
  crypto: CRYPTO_APIS,
  ai: AI_APIS,
  social: SOCIAL_APIS,
  developer: DEV_APIS,
  weather: LOCATION_APIS,
} as const;

/**
 * Find APIs by category
 */
export function getAPIsByCategory(category: string): APIEndpoint[] {
  const cat = category.toLowerCase() as keyof typeof CATEGORIES;
  return CATEGORIES[cat] || [];
}

/**
 * Find APIs by auth method
 */
export function getAPIsByAuth(authMethod: APIAuthMethod): APIEndpoint[] {
  return ALL_APIS.filter(api => api.authMethod === authMethod);
}

/**
 * Find free APIs (no payment, no key)
 */
export function getFreeAPIs(): APIEndpoint[] {
  return ALL_APIS.filter(api => api.authMethod === 'none');
}

/**
 * Find x402-compatible APIs (paid per call)
 */
export function getX402APIs(): APIEndpoint[] {
  return ALL_APIS.filter(api => api.authMethod === 'x402');
}

/**
 * Find MPP-compatible APIs
 */
export function getMPPAPIs(): APIEndpoint[] {
  return ALL_APIS.filter(api => api.authMethod === 'mpp');
}

/**
 * Find self-hostable APIs (privacy-first)
 */
export function getSelfHostableAPIs(): APIEndpoint[] {
  return ALL_APIS.filter(api => api.selfHostable === true);
}

/**
 * Search APIs by tag
 */
export function searchAPIs(query: string): APIEndpoint[] {
  const q = query.toLowerCase();
  return ALL_APIS.filter(api =>
    api.name.toLowerCase().includes(q) ||
    api.description.toLowerCase().includes(q) ||
    api.tags?.some(t => t.includes(q))
  );
}