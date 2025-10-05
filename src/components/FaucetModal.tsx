import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Droplets, ExternalLink, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";

const CONTRACT_ADDRESS = "0xa7Bb3C282Ff1eFBc3F2D8fcd60AaAB3aeE3CBa49" as const;

const ABI = [
  {
    name: "claim",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    name: "hasClaimed", 
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }]
  }
] as const;

interface FaucetModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const FaucetModal = ({ open: controlledOpen, onOpenChange }: FaucetModalProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const { toast } = useToast();
  const { address, isConnected } = useAccount();
  
  const { data: hasClaimed, refetch: refetchClaimed } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'hasClaimed',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && isConnected),
    },
  });

  const { data: hash, writeContract, isPending } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirmed) {
      refetchClaimed();
      toast({
        title: "Claim Successful!",
        description: "Your tokens have been claimed successfully.",
      });
    }
  }, [isConfirmed, refetchClaimed, toast]);

  const handleClaim = () => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to claim tokens.",
        variant: "destructive",
      });
      return;
    }

    if (hasClaimed) {
      toast({
        title: "Already Claimed",
        description: "You have already claimed your tokens.",
        variant: "destructive",
      });
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'claim',
      args: [],
    } as any);
  };

  const getClaimStatus = () => {
    if (!isConnected) return { text: "Connect Wallet", disabled: true };
    if (hasClaimed) return { text: "Already Claimed", disabled: true };
    if (isPending || isConfirming) return { text: "Claiming...", disabled: true };
    return { text: "Claim Tokens", disabled: false };
  };

  const claimStatus = getClaimStatus();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Droplets className="h-4 w-4" />
            Faucet
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Token Faucet
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Claim your free test tokens from the Pharos Testnet faucet.
          </div>

          {isConnected && (
            <div className="p-3 rounded-md bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Wallet Address:</div>
              <div className="text-sm font-mono break-all">{address}</div>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="text-xs text-muted-foreground">Claim Status:</div>
                {hasClaimed ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="h-3 w-3" />
                    <span className="text-xs">Claimed</span>
                  </div>
                ) : (
                  <div className="text-xs text-orange-600">Not Claimed</div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleClaim}
              disabled={claimStatus.disabled}
              className="w-full"
            >
              <Droplets className="h-4 w-4 mr-2" />
              {claimStatus.text}
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.location.href = "/faucet"}
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Alternative Faucet
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Need help? Contact us through the bug report feature.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};