import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { usePositions } from "@/hooks/usePositions";
import { useWriteContract } from 'wagmi';
import { toast } from "sonner";
interface PositionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const CORE_CONTRACT_ADDRESS = '0x34f89ca5a1c6dc4eb67dfe0af5b621185df32854' as const;

const CORE_CONTRACT_ABI = [
  {
    "inputs":[
      {"internalType":"uint256","name":"openId","type":"uint256"},
      {"internalType":"bytes","name":"proof","type":"bytes"}
    ],
    "name":"closePosition",
    "outputs":[],
    "stateMutability":"nonpayable","type":"function"
  },
  {
    "inputs":[{"internalType":"uint256","name":"orderId","type":"uint256"}],
    "name":"cancelOrder",
    "outputs":[],
    "stateMutability":"nonpayable","type":"function"
  }
] as const;

export const PositionsPanel = ({ isOpen, onClose }: PositionsPanelProps) => {
  const { openPositions, openOrders, closedPositions, isLoading, closePosition, cancelOrder } = usePositions();
  const { writeContract } = useWriteContract();
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});

  // Calculate total PnL for open positions
  const totalOpenPnL = openPositions.reduce((total, position) => total + position.pnl, 0);
  
  // Calculate total PnL for closed positions
  const totalClosedPnL = closedPositions.reduce((total, position) => total + position.pnl, 0);

  const handleClosePosition = async (openId: bigint) => {
    const key = `close-${openId.toString()}`;
    setLoadingActions(prev => ({ ...prev, [key]: true }));
    
    try {
      const { proof } = await closePosition(openId);
      
      writeContract({
        address: CORE_CONTRACT_ADDRESS,
        abi: CORE_CONTRACT_ABI,
        functionName: 'closePosition',
        args: [openId, proof as `0x${string}`],
      } as any);
      
      toast.success("Position close initiated!");
    } catch (error: any) {
      console.error('Error closing position:', error);
      toast.error(error?.message || "Failed to close position");
    } finally {
      setLoadingActions(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleCancelOrder = async (orderId: bigint) => {
    const key = `cancel-${orderId.toString()}`;
    setLoadingActions(prev => ({ ...prev, [key]: true }));
    
    try {
      writeContract({
        address: CORE_CONTRACT_ADDRESS,
        abi: CORE_CONTRACT_ABI,
        functionName: 'cancelOrder',
        args: [orderId],
      } as any);
      
      toast.success("Order cancellation initiated!");
    } catch (error: any) {
      console.error('Error canceling order:', error);
      toast.error(error?.message || "Failed to cancel order");
    } finally {
      setLoadingActions(prev => ({ ...prev, [key]: false }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed right-0 top-0 h-full w-[600px] bg-background border-l border-border shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Trading Dashboard</h2>
            <div className={`text-sm font-medium ${totalOpenPnL >= 0 ? 'text-success' : 'text-danger'}`}>
              {totalOpenPnL >= 0 ? '+' : ''}${totalOpenPnL.toFixed(2)}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="w-8 h-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden pt-4">
          <Tabs defaultValue="positions" className="w-full flex-1 flex flex-col overflow-hidden px-4">
            <TabsList className="grid w-full grid-cols-3 bg-muted">
              <TabsTrigger value="positions">Open Positions</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="positions" className="mt-4 flex-1 overflow-hidden">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">Loading positions...</div>
              ) : openPositions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No open positions</div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="space-y-3 pr-2 pb-4">
                  {openPositions.map((position) => (
                  <Card key={position.id.toString()} className="p-4 bg-card border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{position.symbol}</span>
                          <Badge variant={position.isLong ? "default" : "secondary"} className="text-xs">
                            {position.isLong ? "LONG" : "SHORT"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">ID: {position.id.toString()}</div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        className="h-7 px-2 text-xs"
                        onClick={() => handleClosePosition(position.id)}
                        disabled={loadingActions[`close-${position.id.toString()}`]}
                      >
                        {loadingActions[`close-${position.id.toString()}`] ? "Closing..." : "Close Position"}
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-muted-foreground">Open Date</div>
                        <div className="text-foreground">{new Date(position.timestamp * 1000).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Open Price</div>
                        <div className="text-foreground">${position.openPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Current Price</div>
                        <div className="text-foreground">${position.currentPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">PnL</div>
                        <div className={position.pnl > 0 ? "text-success" : "text-danger"}>
                          ${position.pnl.toFixed(2)} ({position.pnlPercent > 0 ? "+" : ""}{position.pnlPercent.toFixed(2)}%)
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Position Size</div>
                        <div className="text-foreground">${position.sizeUsd.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Margin Used</div>
                        <div className="text-foreground">${position.margin.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Leverage</div>
                        <div className="text-foreground">{position.leverage}x</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Liquidation Price</div>
                        <div className="text-danger">${position.liquidationPrice.toFixed(2)}</div>
                      </div>
                    </div>
                  </Card>
                  ))}
                </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="orders" className="mt-4 flex-1 overflow-hidden">
              {openOrders.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No open orders</div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="space-y-3 pr-2 pb-4">
                    {openOrders.map((order) => (
                    <Card key={order.id.toString()} className="p-4 bg-card border-border">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">{order.symbol}</span>
                            <Badge variant="outline" className="text-xs">
                              {order.isLong ? "LONG" : "SHORT"}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">ID: {order.id.toString()}</div>
                        </div>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          className="h-7 px-2 text-xs"
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={loadingActions[`cancel-${order.id.toString()}`]}
                        >
                          {loadingActions[`cancel-${order.id.toString()}`] ? "Canceling..." : "Cancel Order"}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <div className="text-muted-foreground">Order Date</div>
                          <div className="text-foreground">{new Date(order.timestamp * 1000).toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Target Price</div>
                          <div className="text-foreground">${order.orderPrice.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Market Price</div>
                          <div className="text-foreground">${order.currentPrice.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Size USD</div>
                          <div className="text-foreground">${order.sizeUsd.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Leverage</div>
                          <div className="text-foreground">{order.leverage}x</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Type</div>
                          <div className="text-foreground">Limit Order</div>
                        </div>
                      </div>
                    </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4 flex-1 overflow-hidden">
              {closedPositions.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">No closed positions</div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="space-y-3 pr-2 pb-4">
                  {closedPositions.map((trade, index) => (
                  <Card key={index} className="p-4 bg-card border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{trade.symbol}</span>
                          <Badge variant={trade.isLong ? "default" : "secondary"} className="text-xs">
                            {trade.isLong ? "LONG" : "SHORT"}
                          </Badge>
                        </div>
                      </div>
                      <div className={trade.pnl > 0 ? "text-success" : "text-danger"}>
                        ${trade.pnl.toFixed(2)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-muted-foreground">Open Date</div>
                        <div className="text-foreground">{new Date(trade.openTimestamp * 1000).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Close Date</div>
                        <div className="text-foreground">{new Date(trade.closeTimestamp * 1000).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Open Price</div>
                        <div className="text-foreground">${trade.openPrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Close Price</div>
                        <div className="text-foreground">${trade.closePrice.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Size USD</div>
                        <div className="text-foreground">${trade.sizeUsd.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">PnL %</div>
                        <div className={trade.pnl > 0 ? "text-success" : "text-danger"}>
                          {trade.pnlPercent > 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Leverage</div>
                        <div className="text-foreground">{trade.leverage}x</div>
                      </div>
                    </div>
                  </Card>
                  ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};