import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';

const TOKEN_ADDRESS = '0x78ac5e2d8a78a8b8e6d10c7b7274b03c10c91cef';
const TOKEN_DECIMALS = 6;

// ERC20 ABI for balanceOf
const erc20ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const useTokenBalance = () => {
  const { address, isConnected } = useAccount();
  const [usdBalance, setUsdBalance] = useState<string>('0.00');

  const { data: balance, refetch } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: erc20ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && isConnected),
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  useEffect(() => {
    if (balance) {
      const formattedBalance = formatUnits(balance, TOKEN_DECIMALS);
      // For now, assuming 1:1 USD conversion, you can modify this with real price data
      setUsdBalance(parseFloat(formattedBalance).toFixed(2));
    }
  }, [balance]);

  return {
    tokenBalance: balance ? formatUnits(balance, TOKEN_DECIMALS) : '0',
    usdBalance,
    refetch,
  };
};