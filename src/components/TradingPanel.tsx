import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface TradingPanelProps {
  symbol: string;
  price: number;
}

export const TradingPanel = ({ symbol, price }: TradingPanelProps) => {
  const [orderSize, setOrderSize] = useState("10");
  const [leverage, setLeverage] = useState("1");
  
  const percentageButtons = [25, 50, 75, 100];
  const leverageOptions = ["1", "5", "10", "25"];

  return (
    <div className="w-80 p-3">
      <Card className="bg-card border-border shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{symbol}</span>
            <span className="text-lg font-bold text-foreground">{price.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
              Buy
            </Button>
            <Button variant="outline" className="border-border text-foreground hover:bg-muted">
              Sell
            </Button>
          </div>
          
          <Tabs defaultValue="market" className="mb-4">
            <TabsList className="grid grid-cols-2 w-full bg-muted">
              <TabsTrigger value="market" className="data-[state=active]:bg-background text-xs">Market</TabsTrigger>
              <TabsTrigger value="limit" className="data-[state=active]:bg-background text-xs">Limit</TabsTrigger>
            </TabsList>
            <TabsContent value="market" className="mt-0">
              <div className="text-xs text-muted-foreground mb-2">Execute at market price</div>
            </TabsContent>
            <TabsContent value="limit" className="mt-0">
              <div className="text-xs text-muted-foreground mb-2">Set custom price</div>
              <Input
                type="number"
                placeholder="Limit price"
                className="bg-input border-border text-foreground text-sm h-8"
              />
            </TabsContent>
          </Tabs>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Available</span>
                <span className="text-foreground">6816861512.45 USDC</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Order Size:</span>
                <span className="text-foreground">USDC</span>
              </div>
              <Input
                type="number"
                value={orderSize}
                onChange={(e) => setOrderSize(e.target.value)}
                className="bg-input border-border text-foreground"
              />
              
              <div className="grid grid-cols-4 gap-1 mt-2">
                {percentageButtons.map((percent) => (
                  <Button
                    key={percent}
                    variant="outline"
                    size="sm"
                    className="text-xs border-border hover:bg-muted"
                    onClick={() => setOrderSize((price * percent / 100).toString())}
                  >
                    {percent}%
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground mb-2">Leverage :</div>
              <div className="grid grid-cols-5 gap-1">
                {leverageOptions.map((lev) => (
                  <Button
                    key={lev}
                    variant={leverage === lev ? "default" : "outline"}
                    size="sm"
                    className={`text-xs ${
                      leverage === lev 
                        ? 'bg-primary text-primary-foreground' 
                        : 'border-border hover:bg-muted'
                    }`}
                    onClick={() => setLeverage(lev)}
                  >
                    x{lev}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-border hover:bg-muted"
                >
                  1
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Take Profit</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                  +
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Stop Loss</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                  +
                </Button>
              </div>
            </div>
            
            <div className="pt-2 border-t border-border">
              <div className="text-sm text-muted-foreground">
                Open Position at {price.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};