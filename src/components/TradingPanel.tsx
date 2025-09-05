import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAccount, useWriteContract, useConfig } from 'wagmi';
import { parseUnits } from 'viem';
import { toast } from "sonner";

interface TradingPanelProps {
  symbol: string;
  price: number;
  assetId: number;
}

const CORE_CONTRACT_ADDRESS = '0x34f89ca5a1c6dc4eb67dfe0af5b621185df32854' as const;
const CORE_CONTRACT_ABI = [
  {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[
    {"internalType":"uint256","name":"idx","type":"uint256"},
    {"internalType":"bool","name":"isLong","type":"bool"},
    {"internalType":"uint256","name":"lev","type":"uint256"},
    {"internalType":"uint256","name":"orderPrice","type":"uint256"},
    {"internalType":"uint256","name":"sizeUsd","type":"uint256"},
    {"internalType":"uint256","name":"sl","type":"uint256"},
    {"internalType":"uint256","name":"tp","type":"uint256"}],
   "name":"placeOrder","outputs":[{"internalType":"uint256","name":"orderId","type":"uint256"}],
   "stateMutability":"nonpayable","type":"function"},
  {"inputs":[
    {"internalType":"uint256","name":"idx","type":"uint256"},
    {"internalType":"bytes","name":"proof","type":"bytes"},
    {"internalType":"bool","name":"isLong","type":"bool"},
    {"internalType":"uint256","name":"lev","type":"uint256"},
    {"internalType":"uint256","name":"sizeUsd","type":"uint256"},
    {"internalType":"uint256","name":"slPrice","type":"uint256"},
    {"internalType":"uint256","name":"tpPrice","type":"uint256"}],
   "name":"openPosition","outputs":[{"internalType":"uint256","name":"openId","type":"uint256"}],
   "stateMutability":"nonpayable","type":"function"}
] as const;

export const TradingPanel = ({ symbol, price, assetId }: TradingPanelProps) => {
  const [orderSize, setOrderSize] = useState("10");
  const [leverage, setLeverage] = useState("1");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [showStopLoss, setShowStopLoss] = useState(false);
  const [showTakeProfit, setShowTakeProfit] = useState(false);
  const [orderType, setOrderType] = useState("market");
  const [isLoading, setIsLoading] = useState(false);

  const { writeContract } = useWriteContract();
  const { isConnected } = useAccount();
  const config = useConfig();
  
  const percentageButtons = [25, 50, 75, 100];
  const leverageOptions = ["1", "5", "10", "25"];

  const fetchProof = async (idx: number): Promise<string> => {
    try {
      const response = await fetch(`https://proof.brokex.trade/proof?pairs=${idx}`);
      const data = await response.json();
      return data.proof;
    } catch (error) {
      console.error('Error fetching proof:', error);
      throw new Error('Failed to fetch proof');
    }
  };

  const handleTrade = async (isLong: boolean) => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }
    
    if (!orderSize || parseFloat(orderSize) <= 0) {
      toast.error("Please enter a valid order size");
      return;
    }

    setIsLoading(true);
    try {
      const sizeUsd = Math.floor(parseFloat(orderSize) * 1000000); // * 10^6
      const lev = parseInt(leverage);
      const slPrice = stopLoss ? parseUnits(stopLoss, 18) : 0n; // * 10^18
      const tpPrice = takeProfit ? parseUnits(takeProfit, 18) : 0n; // * 10^18

      if (orderType === "market") {
        // Open Market Position
        const proof = await fetchProof(assetId);
        
        writeContract({
          address: CORE_CONTRACT_ADDRESS,
          abi: CORE_CONTRACT_ABI,
          functionName: 'openPosition',
          args: [
            BigInt(assetId),
            proof as `0x${string}`,
            isLong,
            BigInt(lev),
            BigInt(sizeUsd),
            slPrice,
            tpPrice
          ],
        } as any);
        
        toast.success("Market position opened!");
      } else {
        // Place Limit Order
        if (!limitPrice || parseFloat(limitPrice) <= 0) {
          toast.error("Please enter a valid limit price");
          return;
        }
        
        const orderPrice = parseUnits(limitPrice, 18); // * 10^18
        
        writeContract({
          address: CORE_CONTRACT_ADDRESS,
          abi: CORE_CONTRACT_ABI,
          functionName: 'placeOrder',
          args: [
            BigInt(assetId),
            isLong,
            BigInt(lev),
            orderPrice,
            BigInt(sizeUsd),
            slPrice,
            tpPrice
          ],
        } as any);
        
        toast.success("Limit order placed!");
      }
    } catch (error: any) {
      console.error('Trading error:', error);
      toast.error(error?.message || "Failed to execute trade");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-96 p-4 bg-card border-l border-border overflow-y-auto">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">{symbol}</span>
          <span className="text-lg font-bold text-foreground">${price.toFixed(2)}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => handleTrade(true)}
            disabled={isLoading}
            className="bg-success hover:bg-success/90 text-success-foreground font-semibold h-12"
          >
            {isLoading ? "Loading..." : "BUY"}
          </Button>
          <Button 
            onClick={() => handleTrade(false)}
            disabled={isLoading}
            className="bg-danger hover:bg-danger/90 text-danger-foreground font-semibold h-12"
          >
            {isLoading ? "Loading..." : "SELL"}
          </Button>
        </div>
        
        <Tabs value={orderType} onValueChange={setOrderType} className="mb-4">
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
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
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
            <div className="grid grid-cols-5 gap-1">
              {leverageOptions.map((lev) => (
                <Button
                  key={lev}
                  variant={leverage === lev ? "default" : "outline"}
                  size="sm"
                  className={`text-xs h-8 ${
                    leverage === lev 
                      ? 'bg-primary text-primary-foreground' 
                      : 'border-border hover:bg-muted'
                  }`}
                  onClick={() => setLeverage(lev)}
                >
                  {lev}x
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-border hover:bg-muted h-8"
              >
                MAX
              </Button>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Margin Required</span>
              <span className="text-foreground font-medium">${(parseFloat(orderSize) / parseFloat(leverage)).toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Liquidation Price</span>
              <span className="text-danger font-medium">${(price * 0.85).toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Est. Commission</span>
              <span className="text-foreground font-medium">${(parseFloat(orderSize) * 0.001).toFixed(2)}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Buying Power</span>
              <span className="text-success font-medium">${(25847.32 * parseFloat(leverage)).toFixed(2)}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Take Profit</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setShowTakeProfit(!showTakeProfit)}
              >
                {showTakeProfit ? "-" : "+"}
              </Button>
            </div>
            {showTakeProfit && (
              <Input
                type="number"
                placeholder="Take profit price"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="bg-input border-border text-foreground text-sm h-8"
              />
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Stop Loss</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={() => setShowStopLoss(!showStopLoss)}
              >
                {showStopLoss ? "-" : "+"}
              </Button>
            </div>
            {showStopLoss && (
              <Input
                type="number"
                placeholder="Stop loss price"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="bg-input border-border text-foreground text-sm h-8"
              />
            )}
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            {orderType === "market" 
              ? "Order will be executed at market price" 
              : "Order will be placed as limit order"
            }
          </div>
        </div>
      </div>
    </div>
  );
};