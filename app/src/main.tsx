import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import '@rainbow-me/rainbowkit/styles.css'
import './index.css'

import { RainbowKitProvider, getDefaultConfig, darkTheme } from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { base, mainnet } from 'viem/chains'

const config = getDefaultConfig({
  appName: 'ap1ph3x',
  projectId: '75df0c2e7e16e7e16c6e3e7e16e7e16e',
  chains: [base, mainnet],
  ssr: false,
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#00ff41',
          accentColorForeground: '#000a00',
          borderRadius: 'medium',
          fontStack: 'JetBrains Mono, monospace',
        })}>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)