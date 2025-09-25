import { StockList } from "@/components/StockList";
import { TradingInterface } from "@/components/TradingInterface";
import { Header } from "@/components/Header";
import { PositionsPanel } from "@/components/PositionsPanel";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useState, useEffect } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { useWebSocket } from "@/hooks/useWebSocket";

const Index = () => {
  const [selectedStock, setSelectedStock] = useState("AAPL_USD");
  const [selectedPairId, setSelectedPairId] = useState<string>("0");
  const [showPositions, setShowPositions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [storedStockData, setStoredStockData] = useState<any>(null);
  const { data: wsData, isConnected } = useWebSocket("wss://wss.brokex.trade:8443");
  
  // Get current stock data from WebSocket
  const currentStock = Object.entries(wsData || {}).find(([pairKey, payload]) => {
    const item = payload?.instruments?.[0];
    return item?.tradingPair.toUpperCase() === selectedStock;
  });

  const currentStockData = currentStock 
    ? (() => {
        const price = parseFloat(currentStock[1]?.instruments?.[0]?.currentPrice || "0");
        const rawChange = parseFloat(currentStock[1]?.instruments?.[0]?.["24h_change"] || "0");
        const high24h = parseFloat(currentStock[1]?.instruments?.[0]?.["24h_high"] || "0");
        const low24h = parseFloat(currentStock[1]?.instruments?.[0]?.["24h_low"] || "0");
        
        // Calculate if price is closer to high or low to determine sign
        const distanceToHigh = Math.abs(price - high24h);
        const distanceToLow = Math.abs(price - low24h);
        const isPositive = distanceToHigh < distanceToLow;
        const signedChange = isPositive ? Math.abs(rawChange) : -Math.abs(rawChange);
        
        return {
          symbol: currentStock[1]?.instruments?.[0]?.tradingPair.toUpperCase() || selectedStock,
          price: price,
          change: signedChange,
          changePercent: signedChange,
          high24h: high24h,
          low24h: low24h,
        };
      })()
    : storedStockData 
      ? {
          symbol: storedStockData.symbol,
          price: storedStockData.price,
          change: storedStockData.change,
          changePercent: storedStockData.changePercent,
          high24h: storedStockData.high24h,
          low24h: storedStockData.low24h,
        }
      : {
          symbol: selectedStock,
          price: 0,
          change: 0,
          changePercent: 0,
          high24h: 0,
          low24h: 0,
        };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Update page title with selected stock and price
  useEffect(() => {
    if (currentStockData.symbol && currentStockData.price > 0) {
      document.title = `${currentStockData.symbol} ${currentStockData.price.toFixed(2)}`;
    } else {
      document.title = "Brokex Protocol";
    }
  }, [currentStockData.symbol, currentStockData.price]);

  useEffect(() => {
    // Auto-select first available stock when WebSocket data loads
    if (wsData && Object.keys(wsData).length > 0 && selectedStock === "AAPL_USD") {
      const firstPayload: any = Object.values(wsData)[0];
      const firstItem = firstPayload?.instruments?.[0];
      if (firstItem && firstPayload?.id != null) {
        setSelectedStock(firstItem.tradingPair.toUpperCase());
        setSelectedPairId(String(firstPayload.id));
      }
    }
  }, [wsData, selectedStock]);

  useEffect(() => {
    // Hide loading screen only when stocks list is ready with data
    if (isConnected && wsData && Object.keys(wsData).length > 0) {
      // Check if we have actual stock data with valid instruments
      const hasValidStocks = Object.values(wsData).some(payload => 
        payload?.instruments?.[0]?.tradingPair && 
        payload?.instruments?.[0]?.currentPrice
      );
      
      if (hasValidStocks) {
        const timer = setTimeout(() => {
          setIsLoading(false);
        }, 800); // Minimum loading time for better UX
        
        return () => clearTimeout(timer);
      }
    }
  }, [isConnected, wsData]);

  const handleStockSelect = (symbol: string, pairId: string) => {
    setSelectedStock(symbol);
    setSelectedPairId(pairId);
  };

  const handleStockDataChange = (stockData: any) => {
    if (stockData.symbol === selectedStock) {
      setStoredStockData(stockData);
    }
  };

  
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <RainbowKitProvider theme={isDarkMode ? darkTheme() : lightTheme()}>
      <div className="h-screen bg-background flex flex-col overflow-hidden">
        <Header 
          onTogglePositions={() => setShowPositions(!showPositions)}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />
        
        <div className="flex flex-1 overflow-hidden">
          <StockList 
            selectedStock={selectedStock}
            onSelectStock={handleStockSelect}
            onStockDataChange={handleStockDataChange}
          />
          <TradingInterface 
            symbol={currentStockData.symbol}
            price={currentStockData.price}
            change={currentStockData.change}
            changePercent={currentStockData.changePercent}
            high24h={currentStockData.high24h}
            low24h={currentStockData.low24h}
            pairId={selectedPairId}
          />
        </div>

        <PositionsPanel 
          isOpen={showPositions}
          onClose={() => setShowPositions(false)}
        />
      </div>
    </RainbowKitProvider>
  );
};

export default Index;
