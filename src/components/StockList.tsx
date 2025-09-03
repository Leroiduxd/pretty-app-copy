import { Card } from "@/components/ui/card";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface StockListProps {
  stocks: Stock[];
  selectedStock: string;
  onSelectStock: (symbol: string) => void;
}

export const StockList = ({ stocks, selectedStock, onSelectStock }: StockListProps) => {
  return (
    <div className="w-80 h-screen bg-[hsl(var(--sidebar-bg))] border-r border-border overflow-y-auto">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">B</span>
          </div>
          <span className="text-foreground font-semibold">BrokeX</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">SYMBOL</span>
          <span className="text-muted-foreground">LAST/CHANGE</span>
        </div>
      </div>
      
      <div className="space-y-1 p-2">
        {stocks.map((stock) => (
          <Card
            key={stock.symbol}
            className={`p-3 cursor-pointer transition-colors hover:bg-[hsl(var(--sidebar-hover))] border-0 ${
              selectedStock === stock.symbol ? 'bg-[hsl(var(--sidebar-hover))]' : 'bg-transparent'
            }`}
            onClick={() => onSelectStock(stock.symbol)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">{stock.symbol}</div>
                <div className="text-xs text-muted-foreground">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-foreground">{stock.price.toFixed(2)}</div>
                <div className={`text-xs ${stock.change >= 0 ? 'text-success' : 'text-danger'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}% / {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};