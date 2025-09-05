import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, TrendingUp } from "lucide-react";
import { useState } from "react";

interface TradingInterfaceProps {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export const TradingInterface = ({ symbol, price, change, changePercent }: TradingInterfaceProps) => {
  const [orderSize, setOrderSize] = useState("10");
  const [leverage, setLeverage] = useState("1");
  const [leverageInput, setLeverageInput] = useState("1");
  const [chartType, setChartType] = useState("candlesticks");
  const [selectedIndicator, setSelectedIndicator] = useState("");
  const [askPrice] = useState(price * 1.001);
  const [bidPrice] = useState(price * 0.999);
  const [high24h] = useState(price * 1.032);
  const [low24h] = useState(price * 0.965);
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  
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
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>24H High: <span className="text-foreground font-medium">${high24h.toFixed(2)}</span></span>
                  <span>24H Low: <span className="text-foreground font-medium">${low24h.toFixed(2)}</span></span>
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
                  <SelectContent className="bg-popover border-border">
                    {technicalIndicators.map((indicator) => (
                      <SelectItem key={indicator} value={indicator}>
                        {indicator}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
              <span className="cursor-pointer hover:text-foreground">1M</span>
              <span className="cursor-pointer hover:text-foreground">5M</span>
              <span className="cursor-pointer hover:text-foreground">15M</span>
              <span className="cursor-pointer hover:text-foreground">1H</span>
              <span className="cursor-pointer hover:text-foreground">4H</span>
              <span className="cursor-pointer hover:text-foreground">1D</span>
            </div>
          </div>
          
          <div className="flex-1 p-4 relative overflow-hidden">
            {/* Chart Grid Background */}
            <div className="absolute inset-4 opacity-20">
              <svg className="w-full h-full">
                {/* Horizontal grid lines */}
                {[...Array(8)].map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1="0"
                    y1={`${(i * 100) / 7}%`}
                    x2="100%"
                    y2={`${(i * 100) / 7}%`}
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                  />
                ))}
                {/* Vertical grid lines */}
                {[...Array(12)].map((_, i) => (
                  <line
                    key={`v-${i}`}
                    x1={`${(i * 100) / 11}%`}
                    y1="0"
                    x2={`${(i * 100) / 11}%`}
                    y2="100%"
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                  />
                ))}
              </svg>
            </div>
            
            {/* Simulated Candlestick Chart */}
            <div className="relative h-full flex items-end justify-center">
              <div className="flex items-end gap-1 h-full">
                {[...Array(50)].map((_, i) => {
                  const isGreen = Math.random() > 0.5;
                  const height = 20 + Math.random() * 60;
                  
                  if (chartType === "lines") {
                    return (
                      <div
                        key={i}
                        className="w-1 bg-blue-500 opacity-80"
                        style={{ height: `${height}%` }}
                      />
                    );
                  }
                  
                  return (
                    <div
                      key={i}
                      className={`w-2 ${isGreen ? 'bg-blue-500' : 'bg-red-500'} opacity-80`}
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </div>
            
            {/* Price labels on right */}
            <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-xs text-muted-foreground py-4">
              {[240, 239, 238, 237, 236, 235, 234, 233].map((price) => (
                <span key={price}>{price}.00</span>
              ))}
            </div>
            
            {/* Time labels on bottom */}
            <div className="absolute bottom-0 left-4 right-16 flex justify-between text-xs text-muted-foreground">
              <span>16:03</span>
              <span>18:04</span>
              <span>15:33</span>
              <span>18:00</span>
              <span>20:01</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Trading Panel */}
      <div className="w-96 p-4 bg-card border-l border-border overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{symbol}</span>
            <span className="text-lg font-bold text-foreground">${price.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12">
              BUY
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold h-12">
              SELL
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Ask Price</span>
              <div className="text-foreground font-medium">${askPrice.toFixed(2)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Bid Price</span>
              <div className="text-foreground font-medium">${bidPrice.toFixed(2)}</div>
            </div>
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
                <span className="text-foreground font-medium">$25,847.32 USDC</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-muted-foreground">Order Size (USDC)</span>
                <span className="text-foreground">Max: $25,847</span>
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
                    onClick={() => setOrderSize((price * percent / 100).toString())}
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
                    setLeverageInput(e.target.value);
                    setLeverage(e.target.value);
                  }}
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
                <div className="text-xs text-muted-foreground">Stop Loss</div>
                <Input
                  type="number"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="bg-input border-border text-foreground h-8 text-sm"
                  placeholder="Stop loss price"
                />
              </div>
              
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Take Profit</div>
                <Input
                  type="number"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="bg-input border-border text-foreground h-8 text-sm"
                  placeholder="Take profit price"
                />
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
                <span className="text-blue-500 font-medium">${(25847.32 * parseFloat(leverage)).toFixed(2)}</span>
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