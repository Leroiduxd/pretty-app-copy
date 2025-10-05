import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Check, Droplets, Mail, Wallet, Network } from "lucide-react";

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
  const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-2">
            <Droplets className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Brokex Faucet</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Claim your free trading credits on Pharos Testnet and join our newsletter for updates
          </p>
        </div>

        {/* Wallet Status Card */}
        {isConnected && (
          <Card className="p-6 border-border/50 bg-card/50 backdrop-blur">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wallet className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Wallet Address
                  </p>
                  <p className="font-mono text-sm truncate" title={address}>
                    {shortAddress}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Network className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Network
                  </p>
                  <p className="font-mono text-sm">
                    {chainId === PHAROS_CHAIN_ID ? (
                      <span className="text-green-600 dark:text-green-400">Pharos Testnet ({chainId})</span>
                    ) : chainId ? (
                      <span className="text-orange-600 dark:text-orange-400">Wrong Network ({chainId})</span>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Claim Section */}
        <Card className="p-8 border-border/50 bg-card/50 backdrop-blur">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <Droplets className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Claim Trading Credits</h2>
            </div>

            {!isConnected ? (
              <div className="text-center py-8 space-y-4">
                <p className="text-muted-foreground">
                  Connect your wallet to claim your free trading credits
                </p>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </div>
            ) : isWrongNetwork ? (
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  <Network className="w-4 h-4" />
                  <span className="font-medium">Wrong Network Detected</span>
                </div>
                <p className="text-muted-foreground">
                  Switch to Pharos Testnet to continue
                </p>
                <Button onClick={handleSwitchNetwork} size="lg" className="min-w-[200px]">
                  Switch to Pharos
                </Button>
              </div>
            ) : hasClaimed ? (
              <div className="text-center py-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">Already Claimed</span>
                </div>
                <p className="text-muted-foreground">
                  You've already received your trading credits
                </p>
                <Button asChild size="lg" className="min-w-[200px]">
                  <a href="https://app.brokex.trade" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Trading App
                  </a>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium text-sm">Ready to claim</span>
                  </div>
                  <Button
                    onClick={handleClaim}
                    disabled={isPending || isConfirming}
                    size="lg"
                  >
                    <Droplets className="w-4 h-4 mr-2" />
                    {isPending || isConfirming ? "Claiming..." : "Claim Now"}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Click the button above to receive your free trading credits
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Newsletter Section */}
        <Card className="p-8 border-border/50 bg-card/50 backdrop-blur">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/50">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Join Our Newsletter</h2>
            </div>
            
            <p className="text-muted-foreground">
              Get the latest product updates, trading insights, and launch announcements delivered to your inbox
            </p>

            <div className="flex gap-3">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                className="flex-1"
              />
              <Button onClick={handleSubscribe} disabled={isSubscribing} size="lg">
                {isSubscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              We respect your privacy. Unsubscribe anytime. No spam, ever.
            </p>
          </div>
        </Card>

        {/* Contract Info */}
        <Card className="p-4 border-border/50 bg-card/30 backdrop-blur">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Contract:</span>
              <code className="px-2 py-0.5 rounded bg-muted/50 font-mono">
                {CONTRACT_ADDRESS.slice(0, 6)}...{CONTRACT_ADDRESS.slice(-4)}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <span>Chain ID:</span>
              <code className="px-2 py-0.5 rounded bg-muted/50 font-mono">{PHAROS_CHAIN_ID}</code>
            </div>
            <a
              href="https://testnet.pharosscan.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
            >
              Pharos Explorer
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
}
