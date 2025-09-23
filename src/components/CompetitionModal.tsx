import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Loader2, X } from "lucide-react";
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
      // Fetch top 500 traders
      const topResponse = await fetch('https://competition.brokex.trade/api/top?limit=500');
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
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading competition data...
          </div>
        ) : (
          <>
            {/* Header with close button */}
            <div className="px-4 py-3 bg-card sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Top 500 Leaderboard</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* User's rank - always visible and sticky */}
            {isConnected && myRank ? (
              <div className="bg-primary/5 border-primary/20 p-4 sticky top-12 z-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 text-center">
                      <span className={`text-sm font-semibold ${
                        myRank.rank <= 3 ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                        #{myRank.rank}
                      </span>
                    </div>
                    <div className="font-mono text-sm">{myRank.trader}</div>
                  </div>
                  <div className={`text-sm font-semibold ${getRankColor(myRank.total_pnl_x6)}`}>
                    {formatPnL(myRank.total_pnl_x6)}
                  </div>
                </div>
              </div>
            ) : !isConnected ? (
              <div className="bg-muted/20 p-4 sticky top-12 z-5 text-center text-muted-foreground">
                Please connect your wallet to see your rank
              </div>
            ) : null}

            {/* Leaderboard Section */}
            <div className="bg-card">
              <div className="max-h-96 overflow-y-auto">
                {/* Top 100 traders */}
                {topTraders.map((trader, index) => (
                  <div
                    key={trader.trader}
                    className={`flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-muted/30 transition-colors ${
                      isConnected && trader.trader.toLowerCase() === address?.toLowerCase() 
                        ? 'bg-primary/5 border-primary/20' 
                        : ''
                    } ${index === topTraders.length - 1 ? 'pb-6' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 text-center">
                        <span className={`text-sm font-semibold ${
                          trader.rank <= 3 ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          #{trader.rank}
                        </span>
                      </div>
                      <div className="font-mono text-sm">{trader.trader}</div>
                    </div>
                    <div className={`text-sm font-semibold ${getRankColor(trader.total_pnl_x6)}`}>
                      {formatPnL(trader.total_pnl_x6)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};