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
  { id: 1, symbol: "AAPL_USD", size: "50", type: "long", pnl: 125.50, pnlPercent: 2.1, status: "open" },
  { id: 2, symbol: "TSLA_USD", size: "25", type: "short", pnl: -45.20, pnlPercent: -1.8, status: "open" },
];

const mockOrders = [
  { id: 1, symbol: "NVDA_USD", size: "100", type: "limit", price: "170.50", status: "pending" },
  { id: 2, symbol: "META_USD", size: "75", type: "market", price: "737.00", status: "filled" },
];

const mockHistory = [
  { id: 1, symbol: "GOOGL_USD", size: "30", type: "long", pnl: 89.30, closedAt: "2024-01-15", status: "closed" },
  { id: 2, symbol: "AMZN_USD", size: "20", type: "short", pnl: -23.10, closedAt: "2024-01-14", status: "closed" },
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
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{position.symbol}</span>
                      <Badge variant={position.type === "long" ? "default" : "secondary"} className="text-xs">
                        {position.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {position.pnl > 0 ? (
                        <TrendingUp className="w-4 h-4 text-success" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-danger" />
                      )}
                      <span className={position.pnl > 0 ? "text-success" : "text-danger"}>
                        ${position.pnl.toFixed(2)} ({position.pnlPercent > 0 ? "+" : ""}{position.pnlPercent}%)
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Size: ${position.size}
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="orders" className="space-y-3 mt-4">
              {mockOrders.map((order) => (
                <Card key={order.id} className="p-4 bg-card border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{order.symbol}</span>
                      <Badge variant="outline" className="text-xs">
                        {order.type}
                      </Badge>
                    </div>
                    <Badge variant={order.status === "filled" ? "default" : "secondary"} className="text-xs">
                      {order.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Size: ${order.size} • Price: ${order.price}
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="history" className="space-y-3 mt-4">
              {mockHistory.map((trade) => (
                <Card key={trade.id} className="p-4 bg-card border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{trade.symbol}</span>
                      <Badge variant={trade.type === "long" ? "default" : "secondary"} className="text-xs">
                        {trade.type}
                      </Badge>
                    </div>
                    <span className={trade.pnl > 0 ? "text-success" : "text-danger"}>
                      ${trade.pnl.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Size: ${trade.size} • Closed: {trade.closedAt}
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