import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  timestamp: string;
  id: string;
  pairId: string;
}

interface StockSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: Stock[];
  onSelectStock: (symbol: string, pairId: string) => void;
  formatPrice: (value: number) => string;
}

export const StockSearchModal = ({ 
  isOpen, 
  onClose, 
  stocks, 
  onSelectStock, 
  formatPrice 
}: StockSearchModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStocks = useMemo(() => {
    if (!searchTerm) return stocks;
    
    const term = searchTerm.toLowerCase();
    return stocks.filter(stock => 
      stock.symbol.toLowerCase().includes(term) ||
      stock.name.toLowerCase().includes(term)
    );
  }, [stocks, searchTerm]);

  const handleSelectStock = (symbol: string, pairId: string) => {
    onSelectStock(symbol, pairId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-black border border-border rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Search Assets</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Search Input */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              type="text"
              placeholder="Search by symbol or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>
        </div>
        
        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredStocks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              {searchTerm ? "No assets found" : "No assets available"}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredStocks.map((stock) => (
                <Card
                  key={stock.symbol}
                  className="p-3 cursor-pointer transition-colors hover:bg-muted border-0 bg-transparent"
                  onClick={() => handleSelectStock(stock.symbol, stock.pairId)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-foreground">{stock.symbol}</div>
                      <div className="text-sm text-muted-foreground truncate">{stock.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">{formatPrice(stock.price)}</div>
                      <div className={`text-sm ${stock.changePercent >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};