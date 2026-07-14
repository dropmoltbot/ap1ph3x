/**
 * Chain configurations — all public, all open-source
 */

export interface ChainConfig {
  name: string;
  chainId: number;
  rpcUrl: string;
  usdcAddress: string;
  nativeSymbol: string;
}

export const DEFAULT_CHAINS: Record<string, ChainConfig> = {
  base: {
    name: 'Base',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    nativeSymbol: 'ETH',
  },
  ethereum: {
    name: 'Ethereum',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    usdcAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    nativeSymbol: 'ETH',
  },
  tempo: {
    name: 'Tempo',
    chainId: 550,
    rpcUrl: 'https://rpc.tempo.xyz',
    usdcAddress: '0x0000000000000000000000000000000000000000', // placeholder — Tempo uses pathUSD
    nativeSymbol: 'TMP',
  },
  polygon: {
    name: 'Polygon',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    usdcAddress: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    nativeSymbol: 'MATIC',
  },
  monad: {
    name: 'Monad Testnet',
    chainId: 10143,
    rpcUrl: 'https://testnet-rpc.monad.xyz',
    usdcAddress: '0x0000000000000000000000000000000000000000', // TBD
    nativeSymbol: 'MON',
  },
  bsc: {
    name: 'BSC',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    usdcAddress: '0x8AC76A51cc950d9822D68b3fE4Ac40EFB17c7C9C',
    nativeSymbol: 'BNB',
  },
};