import { StockList } from "@/components/StockList";
import { TradingInterface } from "@/components/TradingInterface";
import { Header } from "@/components/Header";
import { PositionsPanel } from "@/components/PositionsPanel";
import { TradingChart } from "@/components/TradingChart";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useState, useEffect } from "react";

// Sample stock data
const stocksData = [
  { symbol: "AAPL_USD", name: "APPLE INC.", price: 238.19, change: 3.87, changePercent: 1.62 },
  { symbol: "AMZN_USD", name: "AMAZON", price: 225.83, change: 2.72, changePercent: 1.20 },
  { symbol: "COIN_USD", name: "COINBASE", price: 302.51, change: 30.67, changePercent: 2.27 },
  { symbol: "GOOGL_USD", name: "ALPHABET INC.", price: 231.75, change: -0.60, changePercent: -2.86 },
  { symbol: "GME_USD", name: "GAMESTOP CORP.", price: 22.95, change: -0.30, changePercent: -4.32 },
  { symbol: "INTC_USD", name: "INTEL CORPORATION", price: 23.99, change: -0.39, changePercent: -1.62 },
  { symbol: "KO_USD", name: "COCA-COLA CO", price: 69.00, change: 1.65, changePercent: 2.39 },
  { symbol: "MCD_USD", name: "MCDONALD'S CORP", price: 315.90, change: 3.62, changePercent: 1.22 },
  { symbol: "MSFT_USD", name: "MICROSOFT CORP", price: 503.68, change: 5.13, changePercent: 1.02 },
  { symbol: "IBM_USD", name: "IBM", price: 244.15, change: 6.00, changePercent: 2.08 },
  { symbol: "META_USD", name: "META PLATFORMS INC.", price: 737.07, change: 55.53, changePercent: 8.75 },
  { symbol: "NVDA_USD", name: "NVIDIA CORP", price: 170.71, change: 33.47, changePercent: 2.03 },
  { symbol: "TSLA_USD", name: "TESLA INC", price: 333.92, change: 14.08, changePercent: 4.39 },
  { symbol: "AUD_USD", name: "AUD", price: 0.6544, change: -0.0012, changePercent: -0.18 },
];

const Index = () => {
  const [selectedStock, setSelectedStock] = useState("AAPL_USD");
  const [selectedPairId, setSelectedPairId] = useState<number>(6004);
  const [showPositions, setShowPositions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const { data: wsData, isConnected } = useWebSocket('wss://wss.brokex.trade:8443');
  
  // Convert WebSocket data to stocks format and merge with static data
  const stocksFromWS = Object.keys(wsData).map(key => {
    const asset = wsData[key];
    const instrument = asset.instruments[0];
    const currentPrice = Number(instrument.currentPrice);
    const change = Number(instrument["24h_change"]);
    return {
      symbol: instrument.tradingPair,
      name: asset.name,
      price: currentPrice,
      change: change,
      changePercent: currentPrice > 0 ? (change / (currentPrice - change)) * 100 : 0,
      id: asset.id,
      high24h: Number(instrument["24h_high"]),
      low24h: Number(instrument["24h_low"]),
    };
  });
  
  // Use WebSocket data if available, otherwise fall back to static data
  const stocks = stocksFromWS.length > 0 ? stocksFromWS : stocksData;
  const currentStock = stocks.find(stock => stock.symbol === selectedStock) || stocks[0];

  const handleSelectStock = (symbol: string) => {
    setSelectedStock(symbol);
    const selectedAsset = stocks.find(stock => stock.symbol === symbol);
    if (selectedAsset && 'id' in selectedAsset) {
      setSelectedPairId(selectedAsset.id as number);
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Header 
        onTogglePositions={() => setShowPositions(!showPositions)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <StockList 
          stocks={stocks}
          selectedStock={selectedStock}
          onSelectStock={handleSelectStock}
        />
        <div className="flex flex-col flex-1">
          <TradingChart 
            pairId={selectedPairId}
            theme={isDarkMode ? 'dark' : 'light'}
          />
          <TradingInterface
            symbol={currentStock.symbol}
            price={currentStock.price}
            change={currentStock.change}
            changePercent={currentStock.changePercent}
            high24h={'high24h' in currentStock ? currentStock.high24h as number : 245.81}
            low24h={'low24h' in currentStock ? currentStock.low24h as number : 229.85}
            pairId={selectedPairId}
          />
        </div>
      </div>

      <PositionsPanel 
        isOpen={showPositions}
        onClose={() => setShowPositions(false)}
      />
    </div>
  );
};

export default Index;
