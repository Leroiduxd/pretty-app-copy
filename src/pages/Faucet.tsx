import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Check, AlertCircle } from "lucide-react";

const CONTRACT_ADDRESS = "0xa7Bb3C282Ff1eFBc3F2D8fcd60AaAB3aeE3CBa49" as const;
const PHAROS_CHAIN_ID = 688688;

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

export default function Faucet() {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();
  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  const { data: hasClaimed, refetch: refetchClaimed } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'hasClaimed',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && isConnected && chainId === PHAROS_CHAIN_ID),
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
        description: "Your trading credit has been sent.",
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

    if (chainId !== PHAROS_CHAIN_ID) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Pharos Testnet.",
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
      window.open("https://app.brokex.trade", "_blank");
      return;
    }

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: ABI,
      functionName: 'claim',
      args: [],
    } as any);
  };

  const handleSwitchNetwork = () => {
    if (switchChain) {
      switchChain({ chainId: PHAROS_CHAIN_ID });
    }
  };

  const handleSubscribe = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert([{ email: email.trim() }]);

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already Subscribed",
            description: "This email is already registered.",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Subscribed!",
          description: "Welcome! You'll hear from us soon.",
        });
        setEmail("");
      }
    } catch (e: any) {
      toast({
        title: "Subscription Failed",
        description: e?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const isWrongNetwork = isConnected && chainId !== PHAROS_CHAIN_ID;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl p-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_0_6px_hsl(var(--primary)/0.1)]" />
            <h1 className="text-3xl font-bold">Brokex Credits & Newsletter</h1>
          </div>
          <p className="text-muted-foreground">
            Claim your trading credit on Pharos and optionally join our newsletter.
          </p>
        </div>

        {/* Wallet & Network Info */}
        <Card className="p-4 bg-background/50 border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Wallet
              </div>
              <div className="font-semibold break-all">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)} (${address})` : "Not connected"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Network
              </div>
              <div className="font-semibold">
                {chainId ? `${chainId}${chainId === PHAROS_CHAIN_ID ? " (Pharos)" : ""}` : "—"}
              </div>
            </div>
          </div>
        </Card>

        {/* Claim Section */}
        <Card className="p-6 bg-background/50 border-border/50 space-y-4">
          {!isConnected ? (
            <div className="flex justify-center">
              <ConnectButton />
            </div>
          ) : isWrongNetwork ? (
            <div className="space-y-4">
              <Button onClick={handleSwitchNetwork} className="w-full">
                Switch to Pharos Testnet
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                You need to be on Pharos Testnet to claim.
              </p>
            </div>
          ) : hasClaimed ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 border border-green-500/30">
                <Check className="h-4 w-4" />
                <span>Already claimed</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You've already received your trading credit.
              </p>
              <Button asChild className="w-full">
                <a href="https://app.brokex.trade" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Go to app.brokex.trade
                </a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/30">
                  <span>Ready to claim</span>
                </div>
                <Button
                  onClick={handleClaim}
                  disabled={isPending || isConfirming}
                  size="lg"
                >
                  {isPending || isConfirming ? "Claiming..." : "Claim Now"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                If you already claimed, you'll be redirected to Brokex.
              </p>
            </div>
          )}
        </Card>

        {/* Newsletter Section */}
        <Card className="p-6 bg-background/50 border-border/50 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Newsletter
            </div>
            <p className="text-sm text-muted-foreground">
              Get product updates and launch news in your inbox.
            </p>
          </div>
          <div className="flex gap-3">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSubscribe} disabled={isSubscribing}>
              {isSubscribing ? "Subscribing..." : "Subscribe"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </Card>

        {/* Footer Info */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>
            Contract: <code className="bg-muted px-1 py-0.5 rounded">0xa7Bb3C282Ff1eFBc3F2D8fcd60AaAB3aeE3CBa49</code>
          </p>
          <p>
            Chain ID: <code className="bg-muted px-1 py-0.5 rounded">688688</code> ·{" "}
            <a
              href="https://testnet.pharosscan.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Pharos Explorer
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
