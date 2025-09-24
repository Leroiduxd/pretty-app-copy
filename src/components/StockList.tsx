import { Card } from "@/components/ui/card";
import { useWebSocket, WebSocketData } from "@/hooks/useWebSocket";
import { useMemo, useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { StockSearchModal } from "./StockSearchModal";

interface StockListProps {
  selectedStock: string;
  onSelectStock: (symbol: string, pairId: string) => void;
}

export const StockList = ({ selectedStock, onSelectStock }: StockListProps) => {
  const { data: wsData, isConnected, error } = useWebSocket("wss://wss.brokex.trade:8443");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [stocks, setStocks] = useState<any[]>([]);
  const stocksRef = useRef<Map<string, any>>(new Map());

  // Format prices based on number of digits before decimal
  const formatPrice = (value: number) => {
    if (value === 0) return "0.00";
    const integerPart = Math.floor(Math.abs(value)).toString().length;
    if (integerPart === 1) return value.toFixed(5);
    if (integerPart === 2) return value.toFixed(3);
    return value.toFixed(2);
  };

  // Optimized stock updates - only update changed stocks
  useEffect(() => {
    if (!wsData || Object.keys(wsData).length === 0) {
      if (stocks.length > 0) {
        setStocks([]);
        stocksRef.current.clear();
      }
      return;
    }

    let hasChanges = false;
    const currentSymbols = new Set();

    // Process each stock from WebSocket data
    Object.entries(wsData).forEach(([pairKey, payload]) => {
      const item = payload?.instruments?.[0];
      if (!item) return;

      const symbol = item.tradingPair.toUpperCase();
      currentSymbols.add(symbol);

      const change = parseFloat(item["24h_change"]);
      const price = parseFloat(item.currentPrice);
      const high24h = parseFloat(item["24h_high"]);
      const low24h = parseFloat(item["24h_low"]);
      
      const distanceToHigh = Math.abs(price - high24h);
      const distanceToLow = Math.abs(price - low24h);
      const isPositive = distanceToHigh < distanceToLow;
      const signedChangePercent = isPositive ? Math.abs(change) : -Math.abs(change);

      const newStock = {
        symbol,
        name: payload.name || symbol,
        price,
        change: signedChangePercent,
        changePercent: signedChangePercent,
        high24h,
        low24h,
        timestamp: item.timestamp,
        id: payload.id,
        pairId: String(payload.id)
      };

      const existingStock = stocksRef.current.get(symbol);
      
      // Check if stock data has changed
      if (!existingStock || 
          existingStock.price !== price || 
          existingStock.changePercent !== signedChangePercent ||
          existingStock.timestamp !== item.timestamp) {
        stocksRef.current.set(symbol, newStock);
        hasChanges = true;
      }
    });

    // Only update state if there are actual changes (no removal, only additions/updates)
    if (hasChanges) {
      const sortedStocks = Array.from(stocksRef.current.values()).sort((a, b) => b.id - a.id);
      setStocks(sortedStocks);
    }
  }, [wsData]);

  if (error) {
    return (
      <div className="w-72 h-full bg-card border-r border-border p-4">
        <div className="text-red-500">WebSocket connection error</div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="w-72 h-full bg-card border-r border-border p-4">
        <div className="text-muted-foreground">Connecting...</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-72 h-full bg-card border-r border-border overflow-y-auto">
        <div className="sticky top-0 z-10 bg-card p-3 border-b border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">SYMBOL</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">LAST/CHANGE</span>
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="p-1 hover:bg-muted rounded transition-colors"
                title="Search assets"
              >
                <Search size={12} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      
      <div className="space-y-0.5 p-2">
        {stocks.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            No data available
          </div>
        ) : (
          stocks.map((stock, index) => (
            <div key={stock.symbol}>
              <Card
                className={`p-2.5 cursor-pointer transition-colors hover:bg-muted border-0 ${
                  selectedStock === stock.symbol ? 'bg-muted border border-border' : 'bg-transparent'
                }`}
                onClick={() => onSelectStock(stock.symbol, stock.pairId)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground text-sm">{stock.symbol}</div>
                    <div className="text-xs text-muted-foreground truncate">{stock.name}</div>
                    {/* ID retiré de l'UI selon demande */}
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-foreground text-sm">{formatPrice(stock.price)}</div>
                    <div className={`text-xs ${stock.changePercent >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </Card>
              {index < stocks.length - 1 && (
                <div className="h-px bg-border/50 mx-2" />
              )}
            </div>
          ))
        )}
      </div>
      </div>
      
      <StockSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        stocks={stocks}
        onSelectStock={onSelectStock}
        formatPrice={formatPrice}
      />
    </>
  );
};