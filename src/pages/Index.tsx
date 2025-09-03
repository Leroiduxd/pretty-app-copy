import { StockList } from "@/components/StockList";
import { TradingChart } from "@/components/TradingChart";
import { TradingPanel } from "@/components/TradingPanel";
import { useState } from "react";

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
  
  const currentStock = stocksData.find(stock => stock.symbol === selectedStock) || stocksData[0];

  return (
    <div className="min-h-screen bg-background flex">
      <StockList 
        stocks={stocksData}
        selectedStock={selectedStock}
        onSelectStock={setSelectedStock}
      />
      <TradingChart 
        symbol={currentStock.symbol}
        price={currentStock.price}
        change={currentStock.change}
        changePercent={currentStock.changePercent}
      />
      <TradingPanel 
        symbol={currentStock.symbol}
        price={currentStock.price}
      />
    </div>
  );
};

export default Index;
