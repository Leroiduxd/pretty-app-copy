import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Clock, Brain } from "lucide-react";
import { useState, useEffect } from "react";

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: number;
  symbol: string;
}

interface AnalysisData {
  t: string;
  pair: string;
  spot: number;
  short: number;
  mid: number;
  long: number;
  bull: number;
  bear: number;
}

export const AIAnalysisModal = ({ isOpen, onClose, assetId, symbol }: AIAnalysisModalProps) => {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && assetId !== undefined) {
      fetchAnalysis();
    }
  }, [isOpen, assetId]);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://data.brokex.trade/api/scores?ids=${assetId}`);
      const result = await response.json();
      
      if (result.ok && result.assets && result.assets[assetId.toString()]) {
        setData(result.assets[assetId.toString()]);
      } else {
        setError("No analysis data available");
      }
    } catch (err) {
      setError("Failed to fetch analysis");
      console.error("Analysis fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreLabel = (score: number) => {
    if (score >= 50) return "Strong Buy";
    if (score >= 20) return "Buy";
    if (score >= 5) return "Weak Buy";
    if (score > -5) return "Neutral";
    if (score > -20) return "Weak Sell";
    if (score > -50) return "Sell";
    return "Strong Sell";
  };

  const getScoreColor = (score: number) => {
    if (score >= 20) return "text-blue-500";
    if (score >= 5) return "text-blue-400";
    if (score > -5) return "text-muted-foreground";
    if (score > -20) return "text-red-400";
    return "text-red-500";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 5) return <TrendingUp className="w-4 h-4" />;
    if (score > -5) return <Minus className="w-4 h-4" />;
    return <TrendingDown className="w-4 h-4" />;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Calculate intensity blocks for the AI bar
  const getIntensityBlocks = (score: number) => {
    const absScore = Math.abs(score);
    const isPositive = score >= 0;
    const fullBlocks = Math.floor(absScore / 10); // Nombre de blocs à 100%
    const remainder = absScore % 10; // Le reste pour le dernier bloc
    
    const blocks = [];
    
    // Add full intensity blocks
    for (let i = 0; i < fullBlocks && i < 10; i++) {
      blocks.push({ intensity: 'full', side: isPositive ? 'right' : 'left' });
    }
    
    // Add partial block if there's a remainder
    if (remainder > 0 && fullBlocks < 10) {
      if (remainder >= 5) {
        blocks.push({ intensity: 'medium', side: isPositive ? 'right' : 'left' });
      } else {
        blocks.push({ intensity: 'light', side: isPositive ? 'right' : 'left' });
      }
    }
    
    return blocks;
  };

  const getBlockColor = (intensity: string, side: string) => {
    const isBlue = side === 'right';
    
    if (intensity === 'full') {
      return isBlue ? 'bg-blue-600' : 'bg-red-600';
    } else if (intensity === 'medium') {
      return isBlue ? 'bg-blue-400' : 'bg-red-400';
    } else {
      return isBlue ? 'bg-blue-300' : 'bg-red-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            AI Analysis - {symbol}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="grid grid-cols-3 gap-2 mt-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={fetchAnalysis} variant="outline" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Retry Analysis
              </Button>
            </div>
          ) : data ? (
            <>
              {/* Score Analysis */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Trading Signals</h3>
                
                {/* Short Term */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Short Term</span>
                    <span className={`text-sm font-bold ${getScoreColor(data.short)}`}>
                      {data.short.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 justify-center">
                    {/* Left side (Red/Bearish) - 10 blocks */}
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }, (_, i) => {
                        const blocks = getIntensityBlocks(data.short);
                        const leftBlocks = blocks.filter(b => b.side === 'left');
                        const blockIndex = 9 - i; // Reverse order for left side
                        const block = leftBlocks[blockIndex];
                        
                        return (
                          <div
                            key={`left-${i}`}
                            className={`w-3 h-6 rounded-sm border border-muted-foreground/30 transition-colors ${
                              block ? getBlockColor(block.intensity, 'left') : 'bg-muted'
                            }`}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Center divider */}
                    <div className="w-0.5 h-6 bg-foreground mx-1" />
                    
                    {/* Right side (Blue/Bullish) - 10 blocks */}
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }, (_, i) => {
                        const blocks = getIntensityBlocks(data.short);
                        const rightBlocks = blocks.filter(b => b.side === 'right');
                        const block = rightBlocks[i];
                        
                        return (
                          <div
                            key={`right-${i}`}
                            className={`w-3 h-6 rounded-sm border border-muted-foreground/30 transition-colors ${
                              block ? getBlockColor(block.intensity, 'right') : 'bg-muted'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Mid Term */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Mid Term</span>
                    <span className={`text-sm font-bold ${getScoreColor(data.mid)}`}>
                      {data.mid.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 justify-center">
                    {/* Left side (Red/Bearish) - 10 blocks */}
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }, (_, i) => {
                        const blocks = getIntensityBlocks(data.mid);
                        const leftBlocks = blocks.filter(b => b.side === 'left');
                        const blockIndex = 9 - i; // Reverse order for left side
                        const block = leftBlocks[blockIndex];
                        
                        return (
                          <div
                            key={`left-${i}`}
                            className={`w-3 h-6 rounded-sm border border-muted-foreground/30 transition-colors ${
                              block ? getBlockColor(block.intensity, 'left') : 'bg-muted'
                            }`}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Center divider */}
                    <div className="w-0.5 h-6 bg-foreground mx-1" />
                    
                    {/* Right side (Blue/Bullish) - 10 blocks */}
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }, (_, i) => {
                        const blocks = getIntensityBlocks(data.mid);
                        const rightBlocks = blocks.filter(b => b.side === 'right');
                        const block = rightBlocks[i];
                        
                        return (
                          <div
                            key={`right-${i}`}
                            className={`w-3 h-6 rounded-sm border border-muted-foreground/30 transition-colors ${
                              block ? getBlockColor(block.intensity, 'right') : 'bg-muted'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Long Term */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Long Term</span>
                    <span className={`text-sm font-bold ${getScoreColor(data.long)}`}>
                      {data.long.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 justify-center">
                    {/* Left side (Red/Bearish) - 10 blocks */}
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }, (_, i) => {
                        const blocks = getIntensityBlocks(data.long);
                        const leftBlocks = blocks.filter(b => b.side === 'left');
                        const blockIndex = 9 - i; // Reverse order for left side
                        const block = leftBlocks[blockIndex];
                        
                        return (
                          <div
                            key={`left-${i}`}
                            className={`w-3 h-6 rounded-sm border border-muted-foreground/30 transition-colors ${
                              block ? getBlockColor(block.intensity, 'left') : 'bg-muted'
                            }`}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Center divider */}
                    <div className="w-0.5 h-6 bg-foreground mx-1" />
                    
                    {/* Right side (Blue/Bullish) - 10 blocks */}
                    <div className="flex gap-1">
                      {Array.from({ length: 10 }, (_, i) => {
                        const blocks = getIntensityBlocks(data.long);
                        const rightBlocks = blocks.filter(b => b.side === 'right');
                        const block = rightBlocks[i];
                        
                        return (
                          <div
                            key={`right-${i}`}
                            className={`w-3 h-6 rounded-sm border border-muted-foreground/30 transition-colors ${
                              block ? getBlockColor(block.intensity, 'right') : 'bg-muted'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Indicators */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Technical Indicators</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-card border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-medium">Bullish</span>
                    </div>
                    <p className="text-lg font-bold text-blue-500">{data.bull}</p>
                    <p className="text-xs text-muted-foreground">indicators</p>
                  </div>
                  
                  <div className="p-3 bg-card border rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-medium">Bearish</span>
                    </div>
                    <p className="text-lg font-bold text-red-500">{data.bear}</p>
                    <p className="text-xs text-muted-foreground">indicators</p>
                  </div>
                </div>
              </div>

              {/* Last Updated */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2 border-t">
                <Clock className="w-3 h-3" />
                <span>Updated: {formatDate(data.t)}</span>
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};