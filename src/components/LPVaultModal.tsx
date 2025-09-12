import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vault, TrendingUp, BarChart3 } from "lucide-react";

export const LPVaultModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [showChart, setShowChart] = useState(false);

  // Placeholder data - will be replaced with real data later
  const vaultData = {
    lpPrice: "1.2345",
    totalSupply: "1,000,000",
    totalMargins: "2,500,000",
    totalLiquidity: "5,000,000",
    totalProfit: "125,000"
  };

  const traderData = {
    lpBalance: "1,250.50",
    balanceValue: "1,543.12",
    totalProfit: "43.12"
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Vault className="w-4 h-4 mr-2" />
          LP Vault
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">LP Vault</DialogTitle>
        </DialogHeader>
        
        {!showChart ? (
          <div className="space-y-4">
            {/* Chart Toggle Button */}
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowChart(true)}
                className="flex items-center gap-2 border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
              >
                <BarChart3 className="w-4 h-4" />
                Show Chart
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Section - Vault & Trader Info */}
              <div className="lg:col-span-2 space-y-4">
                {/* Vault Information */}
                <Card className="p-4 bg-card border-border border-l-4 border-l-blue-500">
                  <h3 className="text-lg font-medium text-foreground mb-4 text-blue-600">Vault Information</h3>
                  
                  {/* LP Price - Highlighted */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                    <p className="text-xs text-muted-foreground mb-1">LP Token Price</p>
                    <p className="text-2xl font-bold text-blue-600">${vaultData.lpPrice}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Total LP Supply</p>
                      <p className="text-sm font-semibold text-foreground">{vaultData.totalSupply}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Locked Margins</p>
                      <p className="text-sm font-semibold text-foreground">${vaultData.totalMargins}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Locked Liquidity</p>
                      <p className="text-sm font-semibold text-foreground">${vaultData.totalLiquidity}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pool Profit</p>
                      <p className="text-sm font-semibold text-green-500">${vaultData.totalProfit}</p>
                    </div>
                  </div>
                </Card>

                {/* Trader Information */}
                <Card className="p-4 bg-card border-border border-l-4 border-l-red-500">
                  <h3 className="text-lg font-medium text-foreground mb-4 text-red-600">Your Position</h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">LP Balance</p>
                      <p className="text-lg font-semibold text-foreground">{traderData.lpBalance}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Balance Value</p>
                      <p className="text-lg font-semibold text-foreground">${traderData.balanceValue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Profit</p>
                      <p className="text-lg font-semibold text-green-500">+${traderData.totalProfit}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Right Section - Trading */}
              <div className="lg:col-span-1">
                <Card className="p-4 bg-card border-border h-fit">
                  <h3 className="text-lg font-medium text-foreground mb-4">Trade LP Tokens</h3>
                  <Tabs defaultValue="buy" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-muted">
                      <TabsTrigger value="buy" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-xs">
                        Buy
                      </TabsTrigger>
                      <TabsTrigger value="sell" className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs">
                        Sell
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="buy" className="space-y-3 mt-4">
                      <div>
                        <label className="text-xs font-medium text-foreground mb-2 block">
                          Amount to Buy
                        </label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={buyAmount}
                          onChange={(e) => setBuyAmount(e.target.value)}
                          className="bg-background border-border text-foreground text-sm h-9"
                        />
                      </div>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm">
                        Buy LP Tokens
                      </Button>
                    </TabsContent>
                    
                    <TabsContent value="sell" className="space-y-3 mt-4">
                      <div>
                        <label className="text-xs font-medium text-foreground mb-2 block">
                          Amount to Sell
                        </label>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={sellAmount}
                          onChange={(e) => setSellAmount(e.target.value)}
                          className="bg-background border-border text-foreground text-sm h-9"
                        />
                      </div>
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white h-9 text-sm">
                        Sell LP Tokens
                      </Button>
                    </TabsContent>
                  </Tabs>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          /* Chart View */
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-foreground">LP Token Chart</h3>
              <Button 
                variant="outline" 
                onClick={() => setShowChart(false)}
                className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
              >
                Back to Vault
              </Button>
            </div>
            
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-center h-96 border border-border rounded-lg bg-background/50">
                <p className="text-muted-foreground text-lg">
                  LP Token Chart
                  <br />
                  <span className="text-sm">(Chart data coming soon)</span>
                </p>
              </div>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};