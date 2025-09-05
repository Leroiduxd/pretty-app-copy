import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, TrendingUp, TrendingDown } from "lucide-react";

interface PositionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockPositions = [
  { 
    id: "ORD-001", 
    symbol: "AAPL_USD", 
    openDate: "2024-01-10 14:30", 
    openPrice: 238.45, 
    currentPrice: 240.12,
    pnl: 125.50, 
    pnlPercent: 2.1, 
    sizeUSD: 6000,
    margin: 600,
    leverage: 10,
    liquidationPrice: 214.61,
    type: "long"
  },
  { 
    id: "ORD-002", 
    symbol: "TSLA_USD", 
    openDate: "2024-01-09 11:15", 
    openPrice: 185.20, 
    currentPrice: 182.85,
    pnl: -45.20, 
    pnlPercent: -1.8, 
    sizeUSD: 2500,
    margin: 500,
    leverage: 5,
    liquidationPrice: 203.72,
    type: "short"
  },
];

const mockOrders = [
  { 
    id: "ORD-003", 
    symbol: "NVDA_USD", 
    openDate: "2024-01-11 09:45",
    targetPrice: 170.50, 
    currentPrice: 172.30,
    sizeUSD: 5000, 
    leverage: 25,
    type: "limit", 
    status: "pending" 
  },
  { 
    id: "ORD-004", 
    symbol: "META_USD", 
    openDate: "2024-01-11 16:20",
    targetPrice: 737.00, 
    currentPrice: 737.00,
    sizeUSD: 3750, 
    leverage: 5,
    type: "market", 
    status: "pending" 
  },
];

const mockHistory = [
  { 
    id: "ORD-005", 
    symbol: "GOOGL_USD", 
    openDate: "2024-01-14 10:15", 
    closeDate: "2024-01-15 14:30",
    openPrice: 142.80,
    closePrice: 145.75,
    pnl: 89.30, 
    sizeUSD: 3000
  },
  { 
    id: "ORD-006", 
    symbol: "AMZN_USD", 
    openDate: "2024-01-13 13:45", 
    closeDate: "2024-01-14 11:20",
    openPrice: 155.60,
    closePrice: 154.85,
    pnl: -23.10, 
    sizeUSD: 2000
  },
];

export const PositionsPanel = ({ isOpen, onClose }: PositionsPanelProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed right-0 top-0 h-full w-[600px] bg-background border-l border-border shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Trading Dashboard</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="w-8 h-8 p-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4">
          <Tabs defaultValue="positions" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted">
              <TabsTrigger value="positions">Open Positions</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="positions" className="space-y-3 mt-4">
              {mockPositions.map((position) => (
                <Card key={position.id} className="p-4 bg-card border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{position.symbol}</span>
                        <Badge variant={position.type === "long" ? "default" : "secondary"} className="text-xs">
                          {position.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">ID: {position.id}</div>
                    </div>
                    <Button size="sm" variant="destructive" className="h-7 px-2 text-xs">
                      Close Position
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-muted-foreground">Open Date</div>
                      <div className="text-foreground">{position.openDate}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Open Price</div>
                      <div className="text-foreground">${position.openPrice}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Current Price</div>
                      <div className="text-foreground">${position.currentPrice}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">PnL</div>
                      <div className={position.pnl > 0 ? "text-blue-500" : "text-red-500"}>
                        ${position.pnl.toFixed(2)} ({position.pnlPercent > 0 ? "+" : ""}{position.pnlPercent}%)
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Position Size</div>
                      <div className="text-foreground">${position.sizeUSD}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Margin Used</div>
                      <div className="text-foreground">${position.margin}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Leverage</div>
                      <div className="text-foreground">{position.leverage}x</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Liquidation Price</div>
                      <div className="text-red-500">${position.liquidationPrice}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="orders" className="space-y-3 mt-4">
              {mockOrders.map((order) => (
                <Card key={order.id} className="p-4 bg-card border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{order.symbol}</span>
                        <Badge variant="outline" className="text-xs">
                          {order.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">ID: {order.id}</div>
                    </div>
                    <Button size="sm" variant="destructive" className="h-7 px-2 text-xs">
                      Cancel Order
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-muted-foreground">Open Date</div>
                      <div className="text-foreground">{order.openDate}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Target Price</div>
                      <div className="text-foreground">${order.targetPrice}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Market Price</div>
                      <div className="text-foreground">${order.currentPrice}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Size USD</div>
                      <div className="text-foreground">${order.sizeUSD}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Leverage</div>
                      <div className="text-foreground">{order.leverage}x</div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="history" className="space-y-3 mt-4">
              {mockHistory.map((trade) => (
                <Card key={trade.id} className="p-4 bg-card border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{trade.symbol}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">ID: {trade.id}</div>
                    </div>
                    <div className={trade.pnl > 0 ? "text-blue-500" : "text-red-500"}>
                      ${trade.pnl.toFixed(2)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-muted-foreground">Open Date</div>
                      <div className="text-foreground">{trade.openDate}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Close Date</div>
                      <div className="text-foreground">{trade.closeDate}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Open Price</div>
                      <div className="text-foreground">${trade.openPrice}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Close Price</div>
                      <div className="text-foreground">${trade.closePrice}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Size USD</div>
                      <div className="text-foreground">${trade.sizeUSD}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">PnL USD</div>
                      <div className={trade.pnl > 0 ? "text-blue-500" : "text-red-500"}>${trade.pnl.toFixed(2)}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};