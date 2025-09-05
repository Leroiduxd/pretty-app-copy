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
    <div className="w-72 h-full bg-card border-r border-border overflow-y-auto">
      <div className="p-3 border-b border-border">
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">SYMBOL</span>
          <span className="text-muted-foreground">LAST/CHANGE</span>
        </div>
      </div>
      
      <div className="space-y-0.5 p-2">
        {stocks.map((stock) => (
          <Card
            key={stock.symbol}
            className={`p-2.5 cursor-pointer transition-colors hover:bg-muted border-0 ${
              selectedStock === stock.symbol ? 'bg-primary/10 border border-primary/20' : 'bg-transparent'
            }`}
            onClick={() => onSelectStock(stock.symbol)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground text-sm">{stock.symbol}</div>
                <div className="text-xs text-muted-foreground truncate">{stock.name}</div>
              </div>
              <div className="text-right">
                <div className="font-medium text-foreground text-sm">
                  ${(() => {
                    const price = Number(stock.price);
                    const priceStr = Math.abs(price).toString();
                    const digitsBeforeDecimal = priceStr.split('.')[0].length;
                    
                    let decimals = 2; // default
                    if (digitsBeforeDecimal === 1) {
                      decimals = 5;
                    } else if (digitsBeforeDecimal === 2) {
                      decimals = 4;
                    } else if (digitsBeforeDecimal >= 3) {
                      decimals = 2;
                    }
                    
                    return price.toFixed(decimals);
                  })()}
                </div>
                <div className={`text-xs ${stock.change >= 0 ? 'text-success' : 'text-danger'}`}>
                  {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};