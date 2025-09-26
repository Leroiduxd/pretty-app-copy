import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Clock } from "lucide-react";
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
              <p className="text-red-500">{error}</p>
            </div>
          ) : data ? (
            <>
              {/* Current Price */}
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold">${data.spot.toLocaleString()}</p>
              </div>

              {/* Score Analysis */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Trading Signals</h3>
                
                <div className="grid grid-cols-3 gap-2">
                  {/* Short Term */}
                  <div className="p-3 bg-card border rounded-lg text-center">
                    <div className={`flex items-center justify-center gap-1 mb-1 ${getScoreColor(data.short)}`}>
                      {getScoreIcon(data.short)}
                      <span className="text-xs font-medium">Short</span>
                    </div>
                    <p className={`text-xs font-bold ${getScoreColor(data.short)}`}>
                      {getScoreLabel(data.short)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.short.toFixed(1)}
                    </p>
                  </div>

                  {/* Mid Term */}
                  <div className="p-3 bg-card border rounded-lg text-center">
                    <div className={`flex items-center justify-center gap-1 mb-1 ${getScoreColor(data.mid)}`}>
                      {getScoreIcon(data.mid)}
                      <span className="text-xs font-medium">Mid</span>
                    </div>
                    <p className={`text-xs font-bold ${getScoreColor(data.mid)}`}>
                      {getScoreLabel(data.mid)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.mid.toFixed(1)}
                    </p>
                  </div>

                  {/* Long Term */}
                  <div className="p-3 bg-card border rounded-lg text-center">
                    <div className={`flex items-center justify-center gap-1 mb-1 ${getScoreColor(data.long)}`}>
                      {getScoreIcon(data.long)}
                      <span className="text-xs font-medium">Long</span>
                    </div>
                    <p className={`text-xs font-bold ${getScoreColor(data.long)}`}>
                      {getScoreLabel(data.long)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {data.long.toFixed(1)}
                    </p>
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