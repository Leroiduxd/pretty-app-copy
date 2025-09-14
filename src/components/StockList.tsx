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
            No data available
          </div>
        ) : (
          stocks.map((stock) => (
            <Card
              key={stock.symbol}
              className={`p-2.5 cursor-pointer transition-colors hover:bg-muted border-0 ${
                selectedStock === stock.symbol ? 'bg-primary/10 border border-primary/20' : 'bg-transparent'
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
          ))
        )}
      </div>
    </div>
  );
};