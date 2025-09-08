import { Card } from "@/components/ui/card";
import { useWebSocket, WebSocketData } from "@/hooks/useWebSocket";
import { useMemo } from "react";

interface StockListProps {
  selectedStock: string;
  onSelectStock: (symbol: string, pairId: string) => void;
}

export const StockList = ({ selectedStock, onSelectStock }: StockListProps) => {
  const { data: wsData, isConnected, error } = useWebSocket("wss://wss.brokex.trade:8443");

  // Format prices based on number of digits before decimal
  const formatPrice = (value: number) => {
    if (value === 0) return "0.00";
    const integerPart = Math.floor(Math.abs(value)).toString().length;
    if (integerPart === 1) return value.toFixed(5);
    if (integerPart === 2) return value.toFixed(3);
    return value.toFixed(2);
  };

  const stocks = useMemo(() => {
    if (!wsData || Object.keys(wsData).length === 0) return [];

    return Object.entries(wsData).map(([pairKey, payload]) => {
      const item = payload?.instruments?.[0];
      if (!item) return null;

      const change = parseFloat(item["24h_change"]);
      const price = parseFloat(item.currentPrice);

        return {
          symbol: item.tradingPair.toUpperCase(),
          name: payload.name || item.tradingPair.toUpperCase(),
          price: price,
          change: change,
          changePercent: change,
          high24h: parseFloat(item["24h_high"]),
          low24h: parseFloat(item["24h_low"]),
          timestamp: item.timestamp,
          id: payload.id,
          pairId: String(payload.id) // Utiliser l'ID pour l'API chart
        };
    }).filter(Boolean);
  }, [wsData]);

  if (error) {
    return (
      <div className="w-72 h-full bg-card border-r border-border p-4">
        <div className="text-red-500">Erreur de connexion WebSocket</div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="w-72 h-full bg-card border-r border-border p-4">
        <div className="text-muted-foreground">Connexion en cours...</div>
      </div>
    );
  }

  return (
    <div className="w-72 h-full bg-card border-r border-border overflow-y-auto">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">SYMBOL</span>
          <span className="text-muted-foreground">LAST/CHANGE</span>
        </div>
      </div>
      
      <div className="space-y-0.5 p-2">
        {stocks.length === 0 ? (
          <div className="text-muted-foreground text-center py-8">
            Aucune donnée disponible
          </div>
        ) : (
          stocks.map((stock) => (
            <div
              key={stock.symbol}
              className={`group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-200 ease-out ${
                selectedStock === stock.symbol 
                  ? 'bg-primary/10 border border-primary/30 shadow-sm' 
                  : 'bg-card/50 hover:bg-card border border-border/50 hover:border-border hover:shadow-sm'
              }`}
              onClick={() => onSelectStock(stock.symbol, stock.pairId)}
            >
              <div className="relative p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-foreground text-sm tracking-wide">{stock.symbol}</div>
                      {selectedStock === stock.symbol && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground/80 truncate mt-0.5 font-medium">{stock.name}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold text-foreground text-sm tabular-nums">{formatPrice(stock.price)}</div>
                    <div className={`text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded-md ${
                      stock.changePercent >= 0 
                        ? 'text-success bg-success/10' 
                        : 'text-danger bg-danger/10'
                    }`}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
                
                {/* Subtle hover effect line */}
                <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-pro-accent transition-all duration-200 ${
                  selectedStock === stock.symbol ? 'w-full opacity-100' : 'w-0 group-hover:w-full opacity-70'
                }`} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};