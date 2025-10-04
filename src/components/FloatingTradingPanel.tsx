import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { X, Maximize2, GripVertical, ChevronDown, Minimize2 } from "lucide-react";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useAccount, useWriteContract, useSwitchChain } from 'wagmi';
import { pharosTestnet } from '@/lib/wagmi';
import { parseUnits } from 'viem';
import { toast } from "sonner";
import { useTokenApproval } from "@/hooks/useTokenApproval";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FloatingTradingPanelProps {
  symbol: string;
  price: number;
  assetId: number;
  onExitFullscreen: () => void;
  leverage: string;
  onLeverageChange: (leverage: string) => void;
  availableStocks?: any[];
  onSelectStock?: (symbol: string, pairId: string) => void;
}

const CORE_CONTRACT_ADDRESS = '0x34f89ca5a1c6dc4eb67dfe0af5b621185df32854' as const;
const CORE_CONTRACT_ABI = [
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

export const FloatingTradingPanel = ({ symbol, price, assetId, onExitFullscreen, leverage: externalLeverage, onLeverageChange, availableStocks = [], onSelectStock }: FloatingTradingPanelProps) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [orderSize, setOrderSize] = useState("10");
  const [limitPrice, setLimitPrice] = useState("");
  const [showPositions, setShowPositions] = useState(false);
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [orderSide, setOrderSide] = useState<"long" | "short">("long");
  const [isLoading, setIsLoading] = useState(false);
  const [showStopLoss, setShowStopLoss] = useState(false);
  const [showTakeProfit, setShowTakeProfit] = useState(false);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const { usdBalance } = useTokenBalance();
  const { writeContract } = useWriteContract();
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const { isApproved, isApproving, approve } = useTokenApproval();

  useEffect(() => {
    if (price) {
      setLimitPrice(price.toFixed(2));
    }
  }, [price]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

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

  const executeTrade = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (chainId !== pharosTestnet.id) {
      try {
        await switchChain({ chainId: pharosTestnet.id });
      } catch (error) {
        toast.error("Please switch to Pharos Testnet");
        return;
      }
    }
    
    if (!orderSize || parseFloat(orderSize) <= 0) {
      toast.error("Please enter a valid order size");
      return;
    }

    setIsLoading(true);
    try {
      const sizeUsd = Math.floor(parseFloat(orderSize) * 1000000);
      const lev = parseInt(externalLeverage);
      const slPrice = stopLoss ? parseUnits(stopLoss, 18) : 0n;
      const tpPrice = takeProfit ? parseUnits(takeProfit, 18) : 0n;
      const isLong = orderSide === "long";

      if (orderType === "market") {
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
        if (!limitPrice || parseFloat(limitPrice) <= 0) {
          toast.error("Please enter a valid limit price");
          return;
        }
        
        const orderPrice = parseUnits(limitPrice, 18);
        
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

  const leverageOptions = ["1", "5", "10", "25", "50", "100"];

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
      }}
      className={`bg-background border-2 border-border rounded-lg shadow-2xl ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${isMinimized ? 'w-auto' : 'w-80'}`}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-border bg-muted/50">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
          <DropdownMenu>
            <DropdownMenuTrigger className="no-drag flex items-center gap-1 text-sm font-semibold hover:text-primary">
              {symbol} <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border z-[10000] max-h-60 overflow-y-auto no-drag">
              {availableStocks.length > 0 ? (
                availableStocks.map((stock: any) => (
                  <DropdownMenuItem 
                    key={stock.symbol}
                    onClick={() => {
                      onSelectStock?.(stock.symbol, stock.pairId);
                    }}
                    className="no-drag"
                  >
                    {stock.symbol}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled className="no-drag">Loading assets...</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger className="no-drag flex items-center gap-1 text-sm font-semibold hover:text-primary">
              {externalLeverage}x <ChevronDown className="w-3 h-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border z-[10000] no-drag">
              {leverageOptions.map((lev) => (
                <DropdownMenuItem 
                  key={lev} 
                  onClick={() => {
                    onLeverageChange(lev);
                  }}
                  className="no-drag"
                >
                  {lev}x
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="icon"
            className="no-drag h-6 w-6"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="w-3 h-3" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="no-drag h-6 w-6"
            onClick={onExitFullscreen}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="p-3 space-y-3 no-drag">
          {/* Market/Limit Toggle + Positions Button */}
          <div className="flex gap-2 items-center">
            <div className="flex-1 flex bg-muted rounded-md p-0.5">
              <button
                onClick={() => setOrderType("market")}
                className={`flex-1 h-7 text-xs rounded transition-colors ${
                  orderType === "market" 
                    ? "bg-primary text-primary-foreground font-medium" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Market
              </button>
              <button
                onClick={() => setOrderType("limit")}
                className={`flex-1 h-7 text-xs rounded transition-colors ${
                  orderType === "limit" 
                    ? "bg-primary text-primary-foreground font-medium" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Limit
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPositions(!showPositions)}
              className="h-7 text-xs whitespace-nowrap"
            >
              Positions
            </Button>
          </div>

          {/* Limit Price Input */}
          {orderType === "limit" && (
            <div className="relative">
              <Input
                type="number"
                placeholder="Limit price"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="h-8 text-sm pr-12"
              />
              <div className="absolute right-0 top-0 h-8 flex border-l border-border">
                <button
                  type="button"
                  className="w-6 h-full hover:bg-muted transition-colors flex items-center justify-center text-xs border-r border-border"
                  onClick={() => {
                    const current = limitPrice ? parseFloat(limitPrice) : price;
                    const decimals = current.toString().split('.')[1]?.length || 2;
                    const increment = decimals >= 5 ? 0.001 : decimals >= 3 ? 0.1 : 1;
                    setLimitPrice((current - increment).toFixed(decimals));
                  }}
                >
                  -
                </button>
                <button
                  type="button"
                  className="w-6 h-full hover:bg-muted transition-colors flex items-center justify-center text-xs"
                  onClick={() => {
                    const current = limitPrice ? parseFloat(limitPrice) : price;
                    const decimals = current.toString().split('.')[1]?.length || 2;
                    const increment = decimals >= 5 ? 0.001 : decimals >= 3 ? 0.1 : 1;
                    setLimitPrice((current + increment).toFixed(decimals));
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Long/Short Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={() => setOrderSide("long")}
              variant={orderSide === "long" ? "default" : "outline"}
              className={`h-10 text-xs font-semibold ${
                orderSide === "long" 
                  ? "bg-success hover:bg-success/90 text-success-foreground" 
                  : "border-success text-success hover:bg-success/10"
              }`}
            >
              LONG
            </Button>
            <Button 
              onClick={() => setOrderSide("short")}
              variant={orderSide === "short" ? "default" : "outline"}
              className={`h-10 text-xs font-semibold ${
                orderSide === "short" 
                  ? "bg-danger hover:bg-danger/90 text-danger-foreground" 
                  : "border-danger text-danger hover:bg-danger/10"
              }`}
            >
              SHORT
            </Button>
          </div>

          {/* Order Size */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Size (USDC)</span>
              <span className="text-muted-foreground">Balance: ${usdBalance}</span>
            </div>
            <div className="relative">
              <Input
                type="number"
                value={orderSize}
                onChange={(e) => setOrderSize(e.target.value)}
                className="h-8 text-sm pr-12"
              />
              <div className="absolute right-0 top-0 h-8 flex border-l border-border">
                <button
                  type="button"
                  className="w-6 h-full hover:bg-muted transition-colors flex items-center justify-center text-xs border-r border-border"
                  onClick={() => setOrderSize((prev) => Math.max(0, parseFloat(prev || "0") - 1).toString())}
                >
                  -
                </button>
                <button
                  type="button"
                  className="w-6 h-full hover:bg-muted transition-colors flex items-center justify-center text-xs"
                  onClick={() => setOrderSize((prev) => (parseFloat(prev || "0") + 1).toString())}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* SL/TP Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (showStopLoss) {
                  setStopLoss("");
                  setShowStopLoss(false);
                } else {
                  setShowStopLoss(true);
                }
              }}
              className="text-xs h-7 flex-1"
            >
              {showStopLoss ? "Remove SL" : "Add SL"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (showTakeProfit) {
                  setTakeProfit("");
                  setShowTakeProfit(false);
                } else {
                  setShowTakeProfit(true);
                }
              }}
              className="text-xs h-7 flex-1"
            >
              {showTakeProfit ? "Remove TP" : "Add TP"}
            </Button>
          </div>

          {/* SL Input */}
          {showStopLoss && (
            <div className="relative">
              <Input
                type="number"
                placeholder="Stop loss price"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="h-8 text-sm pr-12"
              />
              <div className="absolute right-0 top-0 h-8 flex border-l border-border">
                <button
                  type="button"
                  className="w-6 h-full hover:bg-muted transition-colors flex items-center justify-center text-xs border-r border-border"
                  onClick={() => {
                    const current = stopLoss ? parseFloat(stopLoss) : price;
                    const decimals = current.toString().split('.')[1]?.length || 2;
                    const increment = decimals >= 5 ? 0.001 : decimals >= 3 ? 0.1 : 1;
                    setStopLoss(Math.max(0, current - increment).toFixed(decimals));
                  }}
                >
                  -
                </button>
                <button
                  type="button"
                  className="w-6 h-full hover:bg-muted transition-colors flex items-center justify-center text-xs"
                  onClick={() => {
                    const current = stopLoss ? parseFloat(stopLoss) : price;
                    const decimals = current.toString().split('.')[1]?.length || 2;
                    const increment = decimals >= 5 ? 0.001 : decimals >= 3 ? 0.1 : 1;
                    setStopLoss((current + increment).toFixed(decimals));
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* TP Input */}
          {showTakeProfit && (
            <div className="relative">
              <Input
                type="number"
                placeholder="Take profit price"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="h-8 text-sm pr-12"
              />
              <div className="absolute right-0 top-0 h-8 flex border-l border-border">
                <button
                  type="button"
                  className="w-6 h-full hover:bg-muted transition-colors flex items-center justify-center text-xs border-r border-border"
                  onClick={() => {
                    const current = takeProfit ? parseFloat(takeProfit) : price;
                    const decimals = current.toString().split('.')[1]?.length || 2;
                    const increment = decimals >= 5 ? 0.001 : decimals >= 3 ? 0.1 : 1;
                    setTakeProfit(Math.max(0, current - increment).toFixed(decimals));
                  }}
                >
                  -
                </button>
                <button
                  type="button"
                  className="w-6 h-full hover:bg-muted transition-colors flex items-center justify-center text-xs"
                  onClick={() => {
                    const current = takeProfit ? parseFloat(takeProfit) : price;
                    const decimals = current.toString().split('.')[1]?.length || 2;
                    const increment = decimals >= 5 ? 0.001 : decimals >= 3 ? 0.1 : 1;
                    setTakeProfit((current + increment).toFixed(decimals));
                  }}
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Execute Button */}
          <Button 
            onClick={isApproved ? executeTrade : approve}
            disabled={isLoading || isApproving}
            className={`w-full h-10 text-xs font-semibold ${
              !isApproved
                ? "bg-primary hover:bg-primary/90"
                : orderSide === "long" 
                  ? "bg-success hover:bg-success/90 text-success-foreground" 
                  : "bg-danger hover:bg-danger/90 text-danger-foreground"
            }`}
          >
            {isApproving ? "Approving..." :
             !isApproved ? "Approve Token" :
             isLoading ? "Loading..." : 
             orderType === "market" 
               ? `Open at $${price.toFixed(2)}` 
               : `Place Order`
            }
          </Button>
        </div>
      )}
    </div>
  );
};