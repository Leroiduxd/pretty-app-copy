import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';

// Define the custom Pharos Testnet chain
const pharosTestnet = defineChain({
  id: 688688,
  name: 'Pharos Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'PHRS',
    symbol: 'PHRS',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.dplabs-internal.com'],
    },
  },
  blockExplorers: {
    default: { name: 'Pharos Explorer', url: 'https://explorer.pharos.com' },
  },
  testnet: true,
});

export const config = getDefaultConfig({
  appName: 'Brokex Protocol',
  projectId: 'YOUR_PROJECT_ID', // Get from WalletConnect Cloud
  chains: [pharosTestnet, mainnet, polygon, sepolia],
  ssr: false,
});