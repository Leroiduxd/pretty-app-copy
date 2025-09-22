import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Loader2 } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useAccount();

  const formatPnL = (pnlX6: number): string => {
    return `${pnlX6 >= 0 ? '+' : ''}${pnlX6.toFixed(2)}`;
  };

  const fetchCompetitionData = async () => {
    setLoading(true);
    try {
      // Fetch top 100 traders
      const topResponse = await fetch('https://competition.brokex.trade/api/top?limit=100');
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
          } else if (rankResponse.status === 404) {
            setMyRank(null);
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

  const getRankColor = (pnl: number) => {
    return pnl >= 0 ? "text-blue-500" : "text-red-500";
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
            <Trophy className="h-5 w-5 text-blue-500" />
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
                      <span className="w-8 text-center text-sm font-medium">#{myRank.rank}</span>
                      <span className="font-mono text-sm">{myRank.trader}</span>
                    </div>
                    <span className={`font-medium ${getRankColor(myRank.total_pnl_x6)}`}>
                      {formatPnL(myRank.total_pnl_x6)}
                    </span>
                  </div>
                </div>
              )}

              {/* Top 100 Section */}
              <div>
                <h3 className="font-semibold mb-3">Top 100 Traders</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {topTraders.map((trader) => (
                    <div
                      key={trader.trader}
                      className={`flex items-center justify-between p-3 rounded-md border ${
                        isConnected && trader.trader.toLowerCase() === address?.toLowerCase() 
                          ? 'bg-primary/10 border-primary/20' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 text-center text-sm font-medium">#{trader.rank}</span>
                        <span className="font-mono text-sm">{trader.trader}</span>
                      </div>
                      <span className={`font-medium ${getRankColor(trader.total_pnl_x6)}`}>
                        {formatPnL(trader.total_pnl_x6)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Not Connected Message */}
              {!isConnected && (
                <div className="text-center py-4 text-muted-foreground">
                  Connect your wallet to see your ranking
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};