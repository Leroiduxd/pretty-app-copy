import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { defineChain } from 'viem';

const pharosTestnet = defineChain({
  id: 688688,
  name: 'Pharos Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://testnet.dplabs-internal.com/'] },
  },
  blockExplorers: {
    default: {
      name: 'Pharos Explorer',
      url: 'https://explorer.pharos.testnet',
    },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'Trading App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [pharosTestnet],
  ssr: false,
});

export const USDC_CONTRACT = '0x78ac5e2d8a78a8b8e6d10c7b7274b03c10c91cef';