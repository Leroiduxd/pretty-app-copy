import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useWebSocket, WebSocketData } from "@/hooks/useWebSocket";
import { useMemo, useState, useEffect, useRef } from "react";
import { Search, PanelLeftClose } from "lucide-react";
import { StockSearchModal } from "./StockSearchModal";

type MarketCategory = 'crypto' | 'forex' | 'commodities' | 'stocks' | 'indices';

interface StockListProps {
  selectedStock: string;
  onSelectStock: (symbol: string, pairId: string) => void;
  onStockDataChange?: (stockData: any) => void;
  stocks?: any[];
  onToggleStockList?: () => void;
}

export const StockList = ({ selectedStock, onSelectStock, onStockDataChange, stocks: externalStocks, onToggleStockList }: StockListProps) => {
  const { data: wsData, isConnected, error } = useWebSocket("wss://wss.brokex.trade:8443");
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [stocks, setStocks] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<MarketCategory>>(new Set());
  const stocksRef = useRef<Map<string, any>>(new Map());
  
  // Function to determine market category based on ID
  const getMarketCategory = (id: number): MarketCategory => {
    if (id >= 0 && id <= 999) return 'crypto';
    if (id >= 5000 && id <= 5099) return 'forex';
    if (id >= 5500 && id <= 5599) return 'commodities';
    if (id >= 6000 && id <= 6099) return 'stocks';
    if (id >= 6100 && id <= 6199) return 'indices';
    return 'crypto'; // default
  };
  
  // Toggle category selection
  const toggleCategory = (category: MarketCategory) => {
    setSelectedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };
  
  // Filter stocks based on selected categories
  const filteredStocks = useMemo(() => {
    if (selectedCategories.size === 0) return stocks;
    return stocks.filter(stock => selectedCategories.has(getMarketCategory(stock.id)));
  }, [stocks, selectedCategories]);
  
  // Function to get stock name by symbol or return fallback
  const getStockName = (symbol: string, pairId: string) => {
    const stock = stocksRef.current.get(symbol);
    return stock?.name || `ASSET_${pairId}`;
  };

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
      
      // Notify parent of current selected stock data with fallback name
      const selectedStockData = stocksRef.current.get(selectedStock);
      if (selectedStockData && onStockDataChange) {
        onStockDataChange({
          ...selectedStockData,
          name: getStockName(selectedStock, selectedStockData.pairId)
        });
      }
    }
  }, [wsData, selectedStock]);

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
            <div className="flex items-center gap-1.5">
              {onToggleStockList && (
                <button
                  onClick={onToggleStockList}
                  className="p-1 hover:bg-muted rounded transition-colors"
                  title="Hide asset list"
                >
                  <PanelLeftClose size={12} className="text-muted-foreground" />
                </button>
              )}
              <span className="text-muted-foreground">SYMBOL</span>
            </div>
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
        
        {/* Market Category Filters */}
        <div className="sticky top-[53px] z-10 bg-card p-2 border-b border-border">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            <Button
              variant={selectedCategories.has('crypto') ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleCategory('crypto')}
              className="h-6 text-xs px-2 whitespace-nowrap"
            >
              Crypto
            </Button>
            <Button
              variant={selectedCategories.has('forex') ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleCategory('forex')}
              className="h-6 text-xs px-2 whitespace-nowrap"
            >
              Forex
            </Button>
            <Button
              variant={selectedCategories.has('commodities') ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleCategory('commodities')}
              className="h-6 text-xs px-2 whitespace-nowrap"
            >
              Commodities
            </Button>
            <Button
              variant={selectedCategories.has('stocks') ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleCategory('stocks')}
              className="h-6 text-xs px-2 whitespace-nowrap"
            >
              Stocks
            </Button>
            <Button
              variant={selectedCategories.has('indices') ? 'default' : 'outline'}
              size="sm"
              onClick={() => toggleCategory('indices')}
              className="h-6 text-xs px-2 whitespace-nowrap"
            >
              Indices
            </Button>
          </div>
        </div>
      
      <div className="space-y-0.5 p-2">
        {filteredStocks.length === 0 && stocks.length === 0 ? (
          // Show loading skeleton buttons when no data
          Array.from({ length: 20 }).map((_, index) => (
            <div key={`skeleton-${index}`}>
              <Card className="p-2.5 border-0 bg-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-16 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-4 w-12 mb-1" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                </div>
              </Card>
              {index < 19 && (
                <div className="h-px bg-border/50 mx-2" />
              )}
            </div>
          ))
        ) : filteredStocks.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            No assets in selected categories
          </div>
        ) : (
          filteredStocks.map((stock, index) => (
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
                    <div className="text-xs text-muted-foreground truncate">{getStockName(stock.symbol, stock.pairId)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-foreground text-sm">{formatPrice(stock.price)}</div>
                    <div className={`text-xs ${stock.changePercent >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </Card>
              {index < filteredStocks.length - 1 && (
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