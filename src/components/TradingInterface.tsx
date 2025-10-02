import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, TrendingUp, Plus, Maximize2 } from "lucide-react";
import { useState, useRef } from "react";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { LightweightChart } from "./LightweightChart";
import { useChartData } from "@/hooks/useChartData";
import { TradingPanel } from "./TradingPanel";
import { FloatingTradingPanel } from "./FloatingTradingPanel";
import { usePositions } from "@/hooks/usePositions";

interface TradingInterfaceProps {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high24h?: number;
  low24h?: number;
  pairId?: string;
  availableStocks?: any[];
  onSelectStock?: (symbol: string, pairId: string) => void;
}

export const TradingInterface = ({ symbol, price, change, changePercent, high24h, low24h, pairId, availableStocks = [], onSelectStock }: TradingInterfaceProps) => {
  const [orderSize, setOrderSize] = useState("10");
  const [leverage, setLeverage] = useState("1");
  const [leverageInput, setLeverageInput] = useState("1");
  const [chartType, setChartType] = useState("candlesticks");
  const [selectedIndicator, setSelectedIndicator] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [showStopLoss, setShowStopLoss] = useState(false);
  const [showTakeProfit, setShowTakeProfit] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("5M");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chartKey, setChartKey] = useState(0);
  
  const { usdBalance } = useTokenBalance();
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const { openPositions } = usePositions();
  
  // Filter positions for current asset
  const currentAssetPositions = openPositions.filter(
    pos => pos.assetIndex === parseInt(pairId || "0")
  ).map(pos => ({
    id: pos.id.toString(),
    openPrice: pos.openPrice,
    isLong: pos.isLong,
    size: pos.sizeUsd,
    pnl: pos.pnl,
  }));
  
  // Mapping timeframes to intervals in seconds
  const getTimeframeInterval = (timeframe: string) => {
    switch (timeframe) {
      case "1M": return 60;
      case "5M": return 300;
      case "15M": return 900;
      case "1H": return 3600;
      case "4H": return 14400;
      case "1D": return 86400;
      default: return 3600;
    }
  };
  
  const { formattedData: chartData, loading: chartLoading } = useChartData({ 
    pairId, 
    interval: getTimeframeInterval(selectedTimeframe)
  });
  
  // Format prices based on number of digits before decimal
  const formatPrice = (value: number) => {
    if (value === 0) return "0.00";
    const integerPart = Math.floor(Math.abs(value)).toString().length;
    if (integerPart === 1) return value.toFixed(5);
    if (integerPart === 2) return value.toFixed(3);
    return value.toFixed(2);
  };

  // Use WebSocket prices with 0 spread
  const askPrice = price;
  const bidPrice = price;
  // Use WebSocket high/low data
  const high24hValue = high24h || price * 1.032;
  const low24hValue = low24h || price * 0.965;
  
  const percentageButtons = [25, 50, 75, 100];
  const leverageOptions = ["1", "5", "10", "25"];
  
  const technicalIndicators = [
    "Average Price",
    "Correlation", 
    "Median Price",
    "Momentum",
    "Simple Moving Average",
    "Percent Change",
    "Product",
    "Ratio",
    "Spread",
    "Sum",
    "Weighted Close"
  ];

  const handleFullscreen = async () => {
    if (!fullscreenRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await fullscreenRef.current.requestFullscreen();
        setIsFullscreen(true);
        setChartKey(prev => prev + 1); // Force chart reload
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        setChartKey(prev => prev + 1); // Force chart reload
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const handleExitFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
      setChartKey(prev => prev + 1); // Force chart reload
    } catch (error) {
      console.error('Exit fullscreen error:', error);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden" ref={fullscreenRef}>
      {/* Chart Section */}
      <div className="flex-1 p-4">
        <Card className="h-full bg-card border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-foreground">{symbol}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">${formatPrice(price)}</span>
                  <span className={`text-sm ${change >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                    {change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={chartType === "candlesticks" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("candlesticks")}
                  className="h-8 px-2"
                >
                  <BarChart className="w-4 h-4" />
                </Button>
                <Button
                  variant={chartType === "lines" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType("lines")}
                  className="h-8 px-2"
                >
                  <TrendingUp className="w-4 h-4" />
                </Button>
                
                <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
                  <SelectTrigger className="w-40 h-8 bg-card border-border">
                    <SelectValue placeholder="Technical Indicators" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border" align="end">
                    {technicalIndicators.map((indicator) => (
                      <SelectItem key={indicator} value={indicator}>
                        {indicator}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFullscreen}
                  className="h-8 px-2"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-4 text-sm">
                {["1M", "5M", "15M", "1H", "4H", "1D"].map((timeframe) => (
                  <span
                    key={timeframe}
                    className={`cursor-pointer px-2 py-1 rounded ${
                      selectedTimeframe === timeframe
                        ? 'bg-blue-600 text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setSelectedTimeframe(timeframe)}
                  >
                    {timeframe}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>24H High: <span className="text-foreground font-medium">${formatPrice(high24hValue)}</span></span>
                <span>24H Low: <span className="text-foreground font-medium">${formatPrice(low24hValue)}</span></span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative overflow-hidden">
            {/* Real-time Chart */}
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Loading chart...</div>
              </div>
            ) : chartData.length > 0 ? (
              <LightweightChart 
                key={`chart-${chartKey}`}
                data={chartData} 
                width={undefined} 
                height={undefined}
                chartType={chartType}
                positions={currentAssetPositions}
                currentPrice={price}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">No chart data available</div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {!isFullscreen && (
        <TradingPanel 
          symbol={symbol}
          price={price}
          assetId={parseInt(pairId || "0")}
        />
      )}

      {isFullscreen && (
        <FloatingTradingPanel
          symbol={symbol}
          price={price}
          assetId={parseInt(pairId || "0")}
          onExitFullscreen={handleExitFullscreen}
          leverage={leverage}
          onLeverageChange={setLeverage}
          availableStocks={availableStocks}
          onSelectStock={onSelectStock}
        />
      )}
    </div>
  );
};