import { StockList } from "@/components/StockList";
import { TradingInterface } from "@/components/TradingInterface";
import { Header } from "@/components/Header";
import { PositionsPanel } from "@/components/PositionsPanel";
import { useState, useEffect } from "react";
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { useWebSocket } from "@/hooks/useWebSocket";

const Index = () => {
  const [selectedStock, setSelectedStock] = useState("AAPL_USD");
  const [selectedPairId, setSelectedPairId] = useState<string>("0");
  const [showPositions, setShowPositions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { data: wsData } = useWebSocket("wss://wss.brokex.trade:8443");
  
  // Get current stock data from WebSocket
  const currentStock = Object.entries(wsData || {}).find(([pairKey, payload]) => {
    const item = payload?.instruments?.[0];
    return item?.tradingPair.toUpperCase() === selectedStock;
  });

  const currentStockData = currentStock 
    ? {
        symbol: currentStock[1]?.instruments?.[0]?.tradingPair.toUpperCase() || selectedStock,
        price: parseFloat(currentStock[1]?.instruments?.[0]?.currentPrice || "0"),
        change: parseFloat(currentStock[1]?.instruments?.[0]?.["24h_change"] || "0"),
        changePercent: parseFloat(currentStock[1]?.instruments?.[0]?.["24h_change"] || "0"),
        high24h: parseFloat(currentStock[1]?.instruments?.[0]?.["24h_high"] || "0"),
        low24h: parseFloat(currentStock[1]?.instruments?.[0]?.["24h_low"] || "0"),
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

  const handleStockSelect = (symbol: string, pairId: string) => {
    setSelectedStock(symbol);
    setSelectedPairId(pairId);
  };

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
