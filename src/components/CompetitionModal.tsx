import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Target, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";

interface RankEntry {
  rank: number;
  trader: string;
  total_pnl_x6: number;
}

interface TopResponse {
  top: RankEntry[];
}

interface RankResponse {
  me: RankEntry;
}

interface AroundResponse {
  window: RankEntry[];
}

interface CompetitionModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const CompetitionModal = ({ open: controlledOpen, onOpenChange }: CompetitionModalProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [topTraders, setTopTraders] = useState<RankEntry[]>([]);
  const [myRank, setMyRank] = useState<RankEntry | null>(null);
  const [aroundMe, setAroundMe] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();

  const formatPnL = (pnlX6: number): string => {
    const pnl = pnlX6 / 1000000; // Convert from x10^-6 units
    return `${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}`;
  };

  const formatAddress = (addr: string): string => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const fetchCompetitionData = async () => {
    setLoading(true);
    try {
      // Fetch top 20 traders
      const topResponse = await fetch('https://competition.brokex.trade/api/top?limit=20');
      if (topResponse.ok) {
        const topData: TopResponse = await topResponse.json();
        setTopTraders(topData.top);
      }

      // Fetch my rank if connected
      if (isConnected && address) {
        try {
          const rankResponse = await fetch(`https://competition.brokex.trade/api/rank/${address}`);
          if (rankResponse.ok) {
            const rankData: RankResponse = await rankResponse.json();
            setMyRank(rankData.me);

            // Fetch window around me
            const aroundResponse = await fetch(`https://competition.brokex.trade/api/around/${address}?before=5&after=5`);
            if (aroundResponse.ok) {
              const aroundData: AroundResponse = await aroundResponse.json();
              setAroundMe(aroundData.window);
            }
          } else if (rankResponse.status === 404) {
            setMyRank(null);
            setAroundMe([]);
          }
        } catch (error) {
          console.error('Error fetching user rank:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching competition data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCompetitionData();
    }
  }, [open, address, isConnected]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
    return <span className="w-4 h-4 flex items-center justify-center text-xs font-bold">#{rank}</span>;
  };

  const getRankColor = (pnl: number) => {
    return pnl >= 0 ? "text-green-500" : "text-red-500";
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Competition
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Trading Competition
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading competition data...
            </div>
          ) : (
            <>
              {/* My Rank Section */}
              {isConnected && myRank && (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    My Ranking
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getRankIcon(myRank.rank)}
                      <span className="font-mono text-sm">{formatAddress(myRank.trader)}</span>
                    </div>
                    <Badge variant={myRank.total_pnl_x6 >= 0 ? "default" : "destructive"}>
                      {formatPnL(myRank.total_pnl_x6)}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Top 20 Section */}
              <div>
                <h3 className="font-semibold mb-3">🏆 Top 20 Traders</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {topTraders.map((trader) => (
                    <div
                      key={trader.trader}
                      className={`flex items-center justify-between p-2 rounded-md border ${
                        isConnected && trader.trader.toLowerCase() === address?.toLowerCase() 
                          ? 'bg-primary/10 border-primary/20' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getRankIcon(trader.rank)}
                        <span className="font-mono text-sm">{formatAddress(trader.trader)}</span>
                      </div>
                      <span className={`font-medium ${getRankColor(trader.total_pnl_x6)}`}>
                        {formatPnL(trader.total_pnl_x6)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Around Me Section */}
              {isConnected && aroundMe.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">📍 Around My Position</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {aroundMe.map((trader) => (
                      <div
                        key={trader.trader}
                        className={`flex items-center justify-between p-2 rounded-md border ${
                          trader.trader.toLowerCase() === address?.toLowerCase() 
                            ? 'bg-primary/10 border-primary/20' 
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 text-center text-sm font-medium">#{trader.rank}</span>
                          <span className="font-mono text-sm">{formatAddress(trader.trader)}</span>
                        </div>
                        <span className={`font-medium ${getRankColor(trader.total_pnl_x6)}`}>
                          {formatPnL(trader.total_pnl_x6)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Not Connected Message */}
              {!isConnected && (
                <div className="text-center py-4 text-muted-foreground">
                  Connect your wallet to see your ranking and position
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};