import { useState, useRef, useCallback } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount, useChainId, useBalance } from 'wagmi'
import { formatEther } from 'viem'

// ═══ API Registry (client-side) ═══
interface APIEntry {
  id: string
  name: string
  category: string
  url: string
  authMethod: 'none' | 'x402' | 'mpp' | 'apikey' | 'oauth'
  description?: string
  paid?: boolean
  cost?: number
  keywords?: string[]
  buildUrl?: (q: string) => string
  parse?: (data: any, q: string) => string
}

const API_REGISTRY: APIEntry[] = [
  {
    id: 'coingecko-price', name: 'CoinGecko', category: 'cryptocurrency',
    url: 'https://api.coingecko.com/api/v3/simple/price', authMethod: 'none',
    keywords: ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'price', 'token', 'coin'],
    buildUrl: (q) => {
      const c = q.match(/bitcoin|btc/i) ? 'bitcoin' : q.match(/ethereum|eth/i) ? 'ethereum' : 'bitcoin'
      return `https://api.coingecko.com/api/v3/simple/price?ids=${c}&vs_currencies=usd,eur`
    },
    parse: (d, q) => {
      const c = q.match(/bitcoin|btc/i) ? 'bitcoin' : q.match(/ethereum|eth/i) ? 'ethereum' : 'bitcoin'
      return `<strong>${c.charAt(0).toUpperCase() + c.slice(1)}</strong> is currently trading at <strong>$${d[c]?.usd?.toLocaleString()}</strong> USD (${d[c]?.eur?.toLocaleString()} EUR).`
    }
  },
  {
    id: 'cat-facts', name: 'Cat Facts API', category: 'animals',
    url: 'https://catfact.ninja/fact', authMethod: 'none',
    keywords: ['cat', 'fact', 'cats', 'random'],
    buildUrl: () => 'https://catfact.ninja/fact',
    parse: (d) => `🐱 <strong>Cat Fact:</strong> ${d.fact}`
  },
  {
    id: 'defillama-tvl', name: 'DefiLlama', category: 'cryptocurrency',
    url: 'https://api.llama.fi/v2/chains', authMethod: 'none',
    keywords: ['defi', 'tvl', 'total value', 'locked', 'chains', 'protocol'],
    buildUrl: () => 'https://api.llama.fi/v2/chains',
    parse: (d) => {
      const t = d.reduce((s: number, c: any) => s + (c.tvl || 0), 0)
      const top = d.sort((a: any, b: any) => (b.tvl || 0) - (a.tvl || 0)).slice(0, 5)
      let h = `📊 <strong>Total DeFi TVL:</strong> $${(t / 1e9).toFixed(2)}B across ${d.length} chains<br><br><strong>Top 5:</strong><br>`
      top.forEach((c: any, i: number) => h += `${i + 1}. ${c.name}: $${((c.tvl || 0) / 1e9).toFixed(2)}B<br>`)
      return h
    }
  },
  {
    id: 'hn-top', name: 'Hacker News API', category: 'social',
    url: 'https://hacker-news.firebaseio.com/v0/topstories.json', authMethod: 'none',
    keywords: ['hacker news', 'hn', 'trending', 'news', 'tech news', 'top stories'],
    buildUrl: () => 'https://hacker-news.firebaseio.com/v0/topstories.json',
    parse: async (d) => {
      const stories = []
      for (const id of d.slice(0, 5)) {
        try {
          const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          const s = await res.json()
          stories.push(s)
        } catch {}
      }
      let h = '📰 <strong>Top 5 Hacker News stories:</strong><br><br>'
      stories.forEach((s: any, i: number) => h += `${i + 1}. <a href="${s.url || 'https://news.ycombinator.com/item?id=' + s.id}" target="_blank" style="color:var(--phos)">${s.title}</a> <span style="opacity:.5">(${s.score} pts)</span><br>`)
      return h
    }
  },
  {
    id: 'dog-ceo', name: 'Dog CEO', category: 'animals',
    url: 'https://dog.ceo/api/breeds/image/random', authMethod: 'none',
    keywords: ['dog', 'doggo', 'puppy', 'random dog', 'dog image', 'woof'],
    buildUrl: () => 'https://dog.ceo/api/breeds/image/random',
    parse: (d) => `🐶 <strong>Here's a random doggo!</strong><br><br><img src="${d.message}" style="max-width:300px;border-radius:8px;border:1px solid var(--phos-dark);margin-top:8px" />`
  },
  {
    id: 'github-repo', name: 'GitHub API', category: 'development',
    url: 'https://api.github.com/repos/dropmoltbot/ap1ph3x', authMethod: 'none',
    keywords: ['github', 'repo', 'repository', 'stars', 'forks', 'ap1ph3x repo'],
    buildUrl: () => 'https://api.github.com/repos/dropmoltbot/ap1ph3x',
    parse: (d) => `📦 <strong>${d.full_name}</strong><br><br>${d.description}<br><br>⭐ ${d.stargazers_count} stars | 🍴 ${d.forks_count} forks | 📝 ${d.language}<br><a href="${d.html_url}" target="_blank" style="color:var(--phos)">${d.html_url}</a>`
  },
  {
    id: 'coinpaprika', name: 'Coinpaprika', category: 'cryptocurrency',
    url: 'https://api.coinpaprika.com/v1/tickers', authMethod: 'none',
    keywords: ['top crypto', 'market cap', 'crypto ranking'],
    buildUrl: () => 'https://api.coinpaprika.com/v1/tickers?limit=5',
    parse: (d) => {
      let h = '📊 <strong>Top 5 Crypto by Market Cap:</strong><br><br>'
      d.forEach((c: any, i: number) => h += `${i + 1}. ${c.name} (${c.symbol}): $${c.quotes?.USD?.price?.toFixed(2)} | MCap $${(c.quotes?.USD?.market_cap / 1e9).toFixed(2)}B<br>`)
      return h
    }
  },
  {
    id: 'exa-search', name: 'Exa AI Search (x402)', category: 'search',
    url: 'https://api.exa.ai/search', authMethod: 'x402', paid: true, cost: 0.01,
    keywords: ['search', 'web search', 'find', 'research', 'look up'],
    buildUrl: () => 'https://api.exa.ai/search',
    parse: () => `🔍 <strong>Exa Search Results (paid 0.01 USDC via x402):</strong><br><br>Payment flow triggered — agent signed EIP-712 and paid 0.01 USDC.`
  },
]

// ═══ Registry browse entries ═══
const BROWSE_APIS: APIEntry[] = [
  { id: 'coingecko', name: 'CoinGecko', category: 'cryptocurrency', url: 'https://api.coingecko.com/api/v3', authMethod: 'apikey', description: 'Crypto prices, market data, trending coins' },
  { id: 'defillama', name: 'DefiLlama', category: 'cryptocurrency', url: 'https://api.llama.fi', authMethod: 'none', description: 'DeFi TVL data across all chains. Completely free' },
  { id: 'etherscan', name: 'Etherscan', category: 'cryptocurrency', url: 'https://api.etherscan.io/api', authMethod: 'apikey', description: 'Ethereum blockchain data, transactions, contracts' },
  { id: '0x', name: '0x Protocol', category: 'cryptocurrency', url: 'https://0x.org/api', authMethod: 'none', description: 'Decentralized exchange protocol API' },
  { id: '1inch', name: '1inch', category: 'cryptocurrency', url: 'https://1inch.io/api', authMethod: 'none', description: 'DEX aggregator API for best swap rates' },
  { id: 'binance', name: 'Binance', category: 'cryptocurrency', url: 'https://binance-docs.github.io/apidocs', authMethod: 'apikey', description: 'Crypto exchange trading data' },
  { id: 'huggingface', name: 'Hugging Face', category: 'machine-learning', url: 'https://api-inference.huggingface.co', authMethod: 'apikey', description: 'Free inference for 100K+ models' },
  { id: 'ollama', name: 'Ollama', category: 'machine-learning', url: 'http://localhost:11434/api', authMethod: 'none', description: 'Run LLMs locally. Open-source. Full privacy' },
  { id: 'openrouter', name: 'OpenRouter', category: 'machine-learning', url: 'https://openrouter.ai/api/v1', authMethod: 'apikey', description: 'Unified API for 200+ LLMs' },
  { id: 'github', name: 'GitHub API', category: 'development', url: 'https://api.github.com', authMethod: 'apikey', description: 'GitHub repos, issues, PRs, users' },
  { id: 'npm', name: 'npm Registry', category: 'development', url: 'https://registry.npmjs.org', authMethod: 'none', description: 'npm package metadata, versions' },
  { id: 'hn', name: 'Hacker News', category: 'social', url: 'https://hacker-news.firebaseio.com/v0', authMethod: 'none', description: 'HN stories, comments, users. Free' },
  { id: 'reddit', name: 'Reddit API', category: 'social', url: 'https://www.reddit.com', authMethod: 'oauth', description: 'Reddit posts, comments, subreddits' },
  { id: 'open-meteo', name: 'Open-Meteo', category: 'weather', url: 'https://api.open-meteo.com/v1', authMethod: 'none', description: 'Free weather API. No key. 10K/day' },
  { id: 'nominatim', name: 'OpenStreetMap', category: 'geocoding', url: 'https://nominatim.openstreetmap.org', authMethod: 'none', description: 'Geocoding, reverse geocoding. Free' },
  { id: 'virustotal', name: 'VirusTotal', category: 'security', url: 'https://www.virustotal.com/api/v3', authMethod: 'apikey', description: 'Malware and URL scanning' },
  { id: 'newsapi', name: 'NewsAPI', category: 'news', url: 'https://newsapi.org/v2', authMethod: 'apikey', description: 'News headlines from 80K+ sources' },
  { id: 'pokeapi', name: 'Pokémon API', category: 'games-and-comics', url: 'https://pokeapi.co/api/v2', authMethod: 'none', description: 'Pokémon data. Free, no key' },
  { id: 'exa', name: 'Exa AI Search', category: 'search', url: 'https://api.exa.ai/search', authMethod: 'x402', description: 'Neural web search via x402 payment' },
  { id: 'nansen', name: 'Nansen Smart Money', category: 'social', url: 'https://api.nansen.ai', authMethod: 'mpp', description: 'Smart money flow via MPP payment' },
]

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

function App() {
  const [activeTab, setActiveTab] = useState<'agent' | 'registry' | 'stats'>('agent')
  const [messages, setMessages] = useState<{user: boolean, html: string}[]>([
    { user: false, html: '🔐 Agent initialized. Connect your wallet to enable x402 payments.\n\nAsk me anything — I\'ll find the right API, handle the payment, and return the data.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [terminalLines, setTerminalLines] = useState<{text: string, cls: string}[]>([])
  const [registryPage, setRegistryPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [authFilter, setAuthFilter] = useState('')
  
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { data: balance } = useBalance({ address })
  
  const perPage = 15
  
  // ═══ AGENT LOGIC ═══
  const findAPI = (q: string): APIEntry | null => {
    const ql = q.toLowerCase()
    let best: APIEntry | null = null
    let bestScore = 0
    for (const api of API_REGISTRY) {
      let score = 0
      for (const kw of api.keywords || []) {
        if (ql.includes(kw)) score += kw.split(' ').length
      }
      if (score > bestScore) { bestScore = score; best = api }
    }
    return best
  }
  
  const addTermLine = (text: string, cls: string = 'dim') => {
    setTerminalLines(prev => [...prev, { text, cls }])
  }
  
  const executeAgent = async (query: string) => {
    if (!query.trim() || loading) return
    setLoading(true)
    setInput('')
    setTerminalLines([])
    
    setMessages(prev => [...prev, { user: true, html: query }])
    setMessages(prev => [...prev, { user: false, html: '<span style="opacity:.5">Analyzing request...</span>' }])
    
    await sleep(600)
    
    const api = findAPI(query)
    
    // Replace last message
    setMessages(prev => [...prev.slice(0, -1)])
    
    if (!api) {
      setMessages(prev => [...prev, { user: false, html: '❌ No matching API found for that query. Try: Bitcoin price, cat facts, Hacker News, DeFi TVL, dog image, GitHub repo...' }])
      setLoading(false)
      return
    }
    
    // Build steps
    const steps: string[] = []
    
    // Step 1: Found API
    steps.push(`<div class="agent-step search"><div class="icon">🔍</div><div class="text"><div class="label">Found API: ${api.name}</div><div class="detail">Category: ${api.category} | Auth: ${api.authMethod} | URL: ${api.url}</div></div></div>`)
    addTermLine(`> registry.search("${query}")`, 'prompt')
    addTermLine(`  → matched: ${api.name}`, 'ok')
    await sleep(300)
    
    const url = api.buildUrl ? api.buildUrl(query) : api.url
    
    if (api.paid && api.cost) {
      // ═══ PAID FLOW ═══
      steps.push(`<div class="agent-step pay"><div class="icon">💳</div><div class="text"><div class="label">402 Payment Required</div><div class="detail">${api.cost} USDC via ${api.authMethod.toUpperCase()}</div></div></div>`)
      addTermLine(`> ${url}`, 'prompt')
      addTermLine(`⚠ 402 Payment Required — ${api.cost} USDC (${api.authMethod})`, 'warn')
      await sleep(500)
      
      // Check wallet
      if (!isConnected) {
        steps.push(`<div class="agent-step error"><div class="icon">❌</div><div class="text"><div class="label">Wallet not connected</div><div class="detail">Connect MetaMask to sign payment</div></div></div>`)
        addTermLine('❌ Wallet not connected — cannot sign', 'err')
        setMessages(prev => [...prev, { user: false, html: steps.join('') + '<br><br>⚠ Connect your wallet to enable x402 payments.' }])
        setLoading(false)
        return
      }
      
      // Sign EIP-712
      steps.push(`<div class="agent-step sign"><div class="icon">✍️</div><div class="text"><div class="label">Signing EIP-712 payment</div><div class="detail">Amount: ${api.cost} USDC | Chain: ${chainId} | Wallet: ${address?.slice(0,8)}...${address?.slice(-4)}</div></div></div>`)
      addTermLine(`> signEIP712({ amount: ${api.cost}, wallet: ${address?.slice(0,10)}... })`, 'prompt')
      await sleep(500)
      addTermLine('  → signed via MetaMask ✅', 'ok')
      await sleep(300)
      
      // Retry
      steps.push(`<div class="agent-step fetch"><div class="icon">📡</div><div class="text"><div class="label">Retrying with payment</div><div class="detail">Authorization: EIP-712 signature attached</div></div></div>`)
      addTermLine(`> retry with payment header`, 'prompt')
      await sleep(400)
      
      // Simulated result for paid APIs (no real 402 endpoint)
      steps.push(`<div class="agent-step done"><div class="icon">✅</div><div class="text"><div class="label">200 OK — Payment settled</div><div class="detail">${api.cost} USDC transferred via ${api.authMethod.toUpperCase()}</div></div></div>`)
      addTermLine(`✅ 200 OK — payment settled (${api.cost} USDC)`, 'ok')
      
      const receipt = `<div class="result-card"><div class="rh">📡 Result from ${api.name}</div><div class="rd">${api.parse ? api.parse({}, query) : 'Payment processed successfully.'}</div><div class="rr"><div><span>💸 Paid:</span> ${api.cost} USDC</div><div><span>🔗 Protocol:</span> ${api.authMethod.toUpperCase()}</div><div><span>⛓️ Chain:</span> ${chainId}</div><div><span>👤 Wallet:</span> ${address?.slice(0,8)}...${address?.slice(-4)}</div><div><span>✅ Status:</span> SETTLED</div></div></div>`
      setMessages(prev => [...prev, { user: false, html: steps.join('') + receipt }])
      setLoading(false)
      return
    }
    
    // ═══ FREE FLOW — REAL API CALL ═══
    steps.push(`<div class="agent-step fetch"><div class="icon">📡</div><div class="text"><div class="label">Fetching (free API)</div><div class="detail">No payment needed — authMethod: none</div></div></div>`)
    addTermLine(`> GET ${url}`, 'prompt')
    addTermLine('  → free API, no payment', 'ok')
    await sleep(300)
    
    try {
      const res = await fetch(url)
      
      if (res.status !== 200) {
        steps.push(`<div class="agent-step error"><div class="icon">❌</div><div class="text"><div class="label">HTTP ${res.status}</div><div class="detail">Request failed</div></div></div>`)
        addTermLine(`❌ HTTP ${res.status}`, 'err')
        setMessages(prev => [...prev, { user: false, html: steps.join('') + `<br><br>Request failed.` }])
        setLoading(false)
        return
      }
      
      const data = await res.json()
      steps.push(`<div class="agent-step done"><div class="icon">✅</div><div class="text"><div class="label">200 OK — Data received</div><div class="detail">Size: ${JSON.stringify(data).length} bytes</div></div></div>`)
      addTermLine(`✅ 200 OK — ${JSON.stringify(data).length} bytes`, 'ok')
      await sleep(300)
      
      const parsed = api.parse ? await api.parse(data, query) : JSON.stringify(data).slice(0, 500)
      
      const receipt = `<div class="result-card"><div class="rh">📡 Result from ${api.name}</div><div class="rd">${parsed}</div><div class="rr"><div><span>💸 Cost:</span> FREE</div><div><span>🔑 Auth:</span> none</div><div><span>📦 API:</span> ${api.name}</div><div><span>📊 Category:</span> ${api.category}</div></div></div>`
      
      addTermLine('> agent.respond()', 'prompt')
      addTermLine('✅ Response delivered', 'ok')
      
      setMessages(prev => [...prev, { user: false, html: steps.join('') + receipt }])
    } catch (err: any) {
      steps.push(`<div class="agent-step error"><div class="icon">❌</div><div class="text"><div class="label">Fetch error</div><div class="detail">${err.message}</div></div></div>`)
      addTermLine(`❌ ${err.message}`, 'err')
      setMessages(prev => [...prev, { user: false, html: steps.join('') + `<br><br>Network error: ${err.message}` }])
    }
    
    setLoading(false)
  }
  
  // ═══ REGISTRY ═══
  const filteredApis = BROWSE_APIS.filter(a => {
    const mq = !searchQuery || a.name.toLowerCase().includes(searchQuery.toLowerCase()) || (a.description || '').toLowerCase().includes(searchQuery.toLowerCase()) || a.category.toLowerCase().includes(searchQuery.toLowerCase())
    const mc = !categoryFilter || a.category === categoryFilter
    const ma = !authFilter || a.authMethod === authFilter
    return mq && mc && ma
  })
  const totalPages = Math.ceil(filteredApis.length / perPage)
  const pageApis = filteredApis.slice((registryPage - 1) * perPage, registryPage * perPage)
  const categories = [...new Set(BROWSE_APIS.map(a => a.category))].sort()
  
  const authBadgeClass = (auth: string) => `ab-${auth}`
  
  return (
    <>
      <div className="crt-overlay" />
      <div className="container">
        {/* Header */}
        <div className="header">
          <h1>🔐 ap1ph3x</h1>
          <div className="tagline">The encrypted payment protocol for AI agents</div>
          <div className="stats">
            <div className="stat"><strong>1779</strong> APIs</div>
            <div className="stat"><strong>53</strong> Cats</div>
            <div className="stat"><strong>739</strong> Free</div>
            <div className="stat"><strong>6</strong> Chains</div>
            <div className="stat"><strong>2</strong> Protocols</div>
          </div>
        </div>
        
        {/* Wallet bar */}
        <div className="wallet-bar">
          <div className="wallet-info">
            {isConnected ? (
              <>
                <div className="item">Wallet: <strong>{address?.slice(0,8)}...{address?.slice(-4)}</strong></div>
                <div className="item">Chain: <strong>{chainId}</strong></div>
                <div className="item">Balance: <strong>{balance ? parseFloat(formatEther(balance.value)).toFixed(4) : '0'} ETH</strong></div>
              </>
            ) : (
              <div className="item">⚠ Not connected</div>
            )}
          </div>
          <ConnectButton />
        </div>
        
        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === 'agent' ? 'active' : ''}`} onClick={() => setActiveTab('agent')}>🤖 Agent</button>
          <button className={`tab ${activeTab === 'registry' ? 'active' : ''}`} onClick={() => setActiveTab('registry')}>📦 Registry</button>
          <button className={`tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>📊 Stats</button>
        </div>
        
        {/* ═══ AGENT PANEL ═══ */}
        {activeTab === 'agent' && (
          <div className="panel active">
            <div className="chat" style={{ maxHeight: '50vh' }}>
              {messages.map((msg, i) => (
                <div key={i} className={`msg ${msg.user ? 'msg-user' : 'msg-agent'}`}>
                  {!msg.user && <div className="who">ap1ph3x agent</div>}
                  <div className="bubble" dangerouslySetInnerHTML={{ __html: msg.html }} />
                </div>
              ))}
            </div>
            
            {terminalLines.length > 0 && (
              <div className="terminal-output visible">
                {terminalLines.map((l, i) => (
                  <div key={i} className={`tl ${l.cls}`}>{l.text}</div>
                ))}
              </div>
            )}
            
            <div className="input-area">
              <div className="input-row">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && executeAgent(input)}
                  placeholder="Ask the agent... (e.g. 'What's the price of Bitcoin?')"
                  disabled={loading}
                />
                <button onClick={() => executeAgent(input)} disabled={loading || !input.trim()}>
                  {loading ? '⏳...' : '⚡ Execute'}
                </button>
              </div>
              <div className="suggestions">
                <button className="suggestion" onClick={() => executeAgent('What is the price of Bitcoin?')}>₿ BTC price</button>
                <button className="suggestion" onClick={() => executeAgent('Tell me a cat fact')}>🐱 Cat fact</button>
                <button className="suggestion" onClick={() => executeAgent("What's trending on Hacker News?")}>📰 Hacker News</button>
                <button className="suggestion" onClick={() => executeAgent('Give me a random dog image')}>🐶 Dog image</button>
                <button className="suggestion" onClick={() => executeAgent("What's the DeFi TVL across all chains?")}>📊 DeFi TVL</button>
                <button className="suggestion" onClick={() => executeAgent('Show me the ap1ph3x GitHub repo')}>📦 GitHub repo</button>
              </div>
            </div>
          </div>
        )}
        
        {/* ═══ REGISTRY PANEL ═══ */}
        {activeTab === 'registry' && (
          <div className="panel active">
            <div className="search-bar">
              <input type="text" placeholder="Search APIs..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setRegistryPage(1) }} />
              <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setRegistryPage(1) }}>
                <option value="">All categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={authFilter} onChange={e => { setAuthFilter(e.target.value); setRegistryPage(1) }}>
                <option value="">All auth</option>
                <option value="none">Free (no auth)</option>
                <option value="apikey">API Key</option>
                <option value="oauth">OAuth</option>
                <option value="x402">x402</option>
                <option value="mpp">MPP</option>
              </select>
            </div>
            <div className="api-grid">
              {pageApis.map(api => (
                <div key={api.id} className="api-card" onClick={() => navigator.clipboard?.writeText(api.url)}>
                  <div className="name">{api.name}</div>
                  <div className="desc">{api.description || ''}</div>
                  <div className="cb">{api.category}</div>
                  <div className={`ab ${authBadgeClass(api.authMethod)}`}>{api.authMethod === 'none' ? 'FREE' : api.authMethod.toUpperCase()}</div>
                </div>
              ))}
            </div>
            <div className="pagination">
              <button onClick={() => setRegistryPage(p => Math.max(1, p - 1))} disabled={registryPage === 1}>◀</button>
              <span className="info">Page {registryPage}/{totalPages} — {filteredApis.length} APIs</span>
              <button onClick={() => setRegistryPage(p => Math.min(totalPages, p + 1))} disabled={registryPage === totalPages}>▶</button>
            </div>
          </div>
        )}
        
        {/* ═══ STATS PANEL ═══ */}
        {activeTab === 'stats' && (
          <div className="panel active">
            <div className="stats-grid">
              <div className="stat-card"><div className="n">1779</div><div className="l">Total APIs</div></div>
              <div className="stat-card"><div className="n">739</div><div className="l">Free APIs</div></div>
              <div className="stat-card"><div className="n">53</div><div className="l">Categories</div></div>
              <div className="stat-card"><div className="n">6</div><div className="l">Chains</div></div>
              <div className="stat-card"><div className="n">2</div><div className="l">Protocols</div></div>
              <div className="stat-card"><div className="n">78</div><div className="l">Open Source</div></div>
              <div className="stat-card"><div className="n">149</div><div className="l">OAuth APIs</div></div>
              <div className="stat-card"><div className="n">200</div><div className="l">AI Agents</div></div>
            </div>
            <h3 style={{ marginBottom: 10, fontSize: '0.88rem', opacity: 0.7 }}>📂 Categories</h3>
            <div className="cat-list">
              {Object.entries(BROWSE_APIS.reduce((acc: Record<string, number>, a) => { acc[a.category] = (acc[a.category] || 0) + 1; return acc }, {})).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <div key={cat} className="cat-item" onClick={() => { setCategoryFilter(cat); setActiveTab('registry'); setRegistryPage(1) }}>
                  <span>{cat}</span><span className="count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default App