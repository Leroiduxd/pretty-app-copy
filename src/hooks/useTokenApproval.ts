import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import { pharosTestnet } from '@/lib/wagmi';
import { toast } from 'sonner';

const TOKEN_ADDRESS = '0x78ac5e2d8a78a8b8e6d10c7b7274b03c10c91cef';
const SPENDER_ADDRESS = '0x9a88d07850723267db386c681646217af7e220d7';

// ERC20 ABI for allowance and approve
const erc20ABI = [
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const useTokenApproval = () => {
  const { address, isConnected } = useAccount();
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const { data: allowance, refetch } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: erc20ABI,
    functionName: 'allowance',
    args: address ? [address, SPENDER_ADDRESS] : undefined,
    chainId: pharosTestnet.id,
    query: {
      enabled: Boolean(address && isConnected),
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  const { writeContract } = useWriteContract();

  useEffect(() => {
    if (allowance) {
      // Check if allowance is greater than 10,000 USD (assuming 1:1 ratio)
      const minAllowance = parseUnits('10000', 6); // 10,000 tokens with 6 decimals
      setIsApproved(allowance >= minAllowance);
    }
  }, [allowance]);

  const approve = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsApproving(true);
    try {
      // Approve maximum amount
      const maxAmount = parseUnits('1000000000', 6); // Large amount for approval
      
      writeContract({
        address: TOKEN_ADDRESS,
        abi: erc20ABI,
        functionName: 'approve',
        args: [SPENDER_ADDRESS, maxAmount],
      } as any);
      
      toast.success("Approval transaction submitted!");
      
      // Refetch allowance after a delay
      setTimeout(() => {
        refetch();
      }, 3000);
      
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(error?.message || "Failed to approve token");
    } finally {
      setIsApproving(false);
    }
  };

  return {
    isApproved,
    isApproving,
    approve,
    refetch,
  };
};