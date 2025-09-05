import { Card } from "@/components/ui/card";

interface TradingChartProps {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export const TradingChart = ({ symbol, price, change, changePercent }: TradingChartProps) => {
  return (
    <div className="flex-1 p-4 overflow-hidden">
      <Card className="h-full bg-card border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-foreground">{symbol}</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-foreground">{price.toFixed(2)}</span>
              <span className={`text-sm ${change >= 0 ? 'text-success' : 'text-danger'}`}>
                {change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
              </span>
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
                  stroke="hsl(var(--chart-grid))"
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
                  stroke="hsl(var(--chart-grid))"
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
                return (
                  <div
                    key={i}
                    className={`w-2 ${isGreen ? 'bg-success' : 'bg-danger'} opacity-80`}
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
  );
};