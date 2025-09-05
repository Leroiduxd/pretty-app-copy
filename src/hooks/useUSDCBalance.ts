import { useReadContract } from 'wagmi';
import { USDC_CONTRACT } from '@/lib/wagmi';
import { erc20Abi } from 'viem';

export const useUSDCBalance = (address?: `0x${string}`) => {
  const { data: balance, isLoading } = useReadContract({
    address: USDC_CONTRACT as `0x${string}`,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  const formattedBalance = balance ? Number(balance) / 1e6 : 0; // USDC has 6 decimals

  return {
    balance: formattedBalance,
    isLoading,
    rawBalance: balance,
  };
};