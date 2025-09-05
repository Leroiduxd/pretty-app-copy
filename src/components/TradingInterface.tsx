import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, TrendingUp, Plus } from "lucide-react";
import { useState } from "react";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { LightweightChart } from "./LightweightChart";
import { useChartData } from "@/hooks/useChartData";

interface TradingInterfaceProps {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  high24h?: number;
  low24h?: number;
  pairId?: string;
}

export const TradingInterface = ({ symbol, price, change, changePercent, high24h, low24h, pairId }: TradingInterfaceProps) => {
  const [orderSize, setOrderSize] = useState("10");
  const [leverage, setLeverage] = useState("1");
  const [leverageInput, setLeverageInput] = useState("1");
  const [chartType, setChartType] = useState("candlesticks");
  const [selectedIndicator, setSelectedIndicator] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [showStopLoss, setShowStopLoss] = useState(false);
  const [showTakeProfit, setShowTakeProfit] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1H");
  
  const { usdBalance } = useTokenBalance();
  const { formattedData: chartData, loading: chartLoading } = useChartData({ 
    pairId, 
    interval: 3600 // 1 hour
  });
  
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

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Chart Section */}
      <div className="flex-1 p-4">
        <Card className="h-full bg-card border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-foreground">{symbol}</h2>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground">${price.toFixed(2)}</span>
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
                <span>24H High: <span className="text-foreground font-medium">${high24hValue.toFixed(2)}</span></span>
                <span>24H Low: <span className="text-foreground font-medium">${low24hValue.toFixed(2)}</span></span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 relative overflow-hidden">
            {/* Real-time Chart */}
            {chartLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Chargement du graphique...</div>
              </div>
            ) : chartData.length > 0 ? (
              <LightweightChart 
                data={chartData} 
                width={undefined} 
                height={undefined} 
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-muted-foreground">Aucune donnée disponible pour ce graphique</div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Trading Panel */}
      <div className="w-80 p-3 bg-card border-l border-border overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{symbol}</span>
            <span className="text-lg font-bold text-foreground">${price.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs mb-4">
            <div>
              <span className="text-muted-foreground">Ask Price</span>
              <div className="text-foreground font-medium">${askPrice.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Bid Price</span>
              <div className="text-foreground font-medium">${bidPrice.toFixed(2)}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12">
              BUY
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold h-12">
              SELL
            </Button>
          </div>
          
          <Tabs defaultValue="market" className="mb-4">
            <TabsList className="grid grid-cols-2 w-full bg-muted">
              <TabsTrigger value="market" className="data-[state=active]:bg-background text-xs">Market</TabsTrigger>
              <TabsTrigger value="limit" className="data-[state=active]:bg-background text-xs">Limit</TabsTrigger>
            </TabsList>
            <TabsContent value="market" className="mt-2">
              <div className="text-xs text-muted-foreground">Execute immediately at market price</div>
            </TabsContent>
            <TabsContent value="limit" className="mt-2">
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Set custom price</div>
                <Input
                  type="number"
                  placeholder="Limit price"
                  className="bg-input border-border text-foreground text-sm h-8"
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Available Balance</span>
                <span className="text-foreground font-medium">${usdBalance} USDC</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Order Size (USDC)</span>
                <span className="text-foreground">Max: ${parseFloat(usdBalance).toFixed(0)}</span>
              </div>
              <Input
                type="number"
                value={orderSize}
                onChange={(e) => setOrderSize(e.target.value)}
                className="bg-input border-border text-foreground h-9"
              />
              
              <div className="grid grid-cols-4 gap-1 mt-2">
                {percentageButtons.map((percent) => (
                  <Button
                    key={percent}
                    variant="outline"
                    size="sm"
                    className="text-xs border-border hover:bg-muted h-7"
                    onClick={() => setOrderSize((parseFloat(usdBalance) * percent / 100).toString())}
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-xs text-muted-foreground mb-2">Leverage</div>
              <div className="space-y-2">
                 <Input
                   type="number"
                   value={leverageInput}
                   onChange={(e) => {
                     const value = Math.min(100, Math.max(1, parseInt(e.target.value) || 1));
                     setLeverageInput(value.toString());
                     setLeverage(value.toString());
                   }}
                   min="1"
                   max="100"
                   className="bg-input border-border text-foreground h-8 text-sm"
                   placeholder="Custom leverage"
                 />
                <div className="grid grid-cols-5 gap-1">
                  {leverageOptions.map((lev) => (
                    <Button
                      key={lev}
                      variant={leverage === lev ? "default" : "outline"}
                      size="sm"
                      className={`text-xs h-7 ${
                        leverage === lev 
                          ? 'bg-primary text-primary-foreground' 
                          : 'border-border hover:bg-muted'
                      }`}
                      onClick={() => {
                        setLeverage(lev);
                        setLeverageInput(lev);
                      }}
                    >
                      {lev}x
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-border hover:bg-muted h-7"
                    onClick={() => {
                      setLeverage("100");
                      setLeverageInput("100");
                    }}
                  >
                    MAX
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <div 
                  className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => {
                    setShowStopLoss(!showStopLoss);
                    if (showStopLoss) setStopLoss("");
                  }}
                >
                  <Plus className={`w-3 h-3 transition-transform ${showStopLoss ? 'rotate-45' : ''}`} />
                  <span>Stop Loss</span>
                </div>
                {showStopLoss && (
                  <Input
                    type="number"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="bg-input border-border text-foreground h-8 text-sm"
                    placeholder="Stop loss price"
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <div 
                  className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => {
                    setShowTakeProfit(!showTakeProfit);
                    if (showTakeProfit) setTakeProfit("");
                  }}
                >
                  <Plus className={`w-3 h-3 transition-transform ${showTakeProfit ? 'rotate-45' : ''}`} />
                  <span>Take Profit</span>
                </div>
                {showTakeProfit && (
                  <Input
                    type="number"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="bg-input border-border text-foreground h-8 text-sm"
                    placeholder="Take profit price"
                  />
                )}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Margin Required</span>
                <span className="text-foreground font-medium">${(parseFloat(orderSize) / parseFloat(leverage)).toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Liquidation Price</span>
                <span className="text-red-500 font-medium">${(price * 0.85).toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Est. Commission</span>
                <span className="text-foreground font-medium">${(parseFloat(orderSize) * 0.001).toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Buying Power</span>
                <span className="text-blue-500 font-medium">${(parseFloat(usdBalance) * parseFloat(leverage)).toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 text-sm"
            >
              EXECUTE ORDER
            </Button>
            
            <div className="text-xs text-muted-foreground text-center">
              Order will be executed at market price
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};