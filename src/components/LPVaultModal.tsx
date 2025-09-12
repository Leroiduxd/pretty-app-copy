import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Vault, TrendingUp } from "lucide-react";

export const LPVaultModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");

  // Placeholder data - will be replaced with real data later
  const lpData = {
    balance: "0.00",
    price: "1.00",
    value: "0.00",
    totalSupply: "1,000,000"
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Trading */}
          <div className="lg:col-span-2 space-y-6">
            {/* LP Token Info */}
            <Card className="p-4 bg-card border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Informations LP Token</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Solde LP</p>
                  <p className="text-lg font-bold text-foreground">{lpData.balance}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prix LP</p>
                  <p className="text-lg font-bold text-foreground">${lpData.price}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valeur LP</p>
                  <p className="text-lg font-bold text-foreground">${lpData.value}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total en circulation</p>
                  <p className="text-lg font-bold text-foreground">{lpData.totalSupply}</p>
                </div>
              </div>
            </Card>

            {/* Trading Section */}
            <Card className="p-4 bg-card border-border">
              <Tabs defaultValue="buy" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted">
                  <TabsTrigger value="buy" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Acheter
                  </TabsTrigger>
                  <TabsTrigger value="sell" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                    Vendre
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="buy" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Montant à acheter
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={buyAmount}
                      onChange={(e) => setBuyAmount(e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    Acheter LP Token
                  </Button>
                </TabsContent>
                
                <TabsContent value="sell" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Montant à vendre
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={sellAmount}
                      onChange={(e) => setSellAmount(e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                    Vendre LP Token
                  </Button>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Right Section - Chart */}
          <div className="lg:col-span-1">
            <Card className="p-4 bg-card border-border h-full">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-foreground">Graphique LP</h3>
              </div>
              <div className="flex items-center justify-center h-64 border border-border rounded-lg bg-background/50">
                <p className="text-muted-foreground text-sm">
                  Graphique LP Token
                  <br />
                  (Données à venir)
                </p>
              </div>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};