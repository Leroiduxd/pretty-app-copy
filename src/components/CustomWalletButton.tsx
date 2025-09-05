import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Wallet, Wifi, Copy, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDisconnect } from 'wagmi';

interface CustomWalletButtonProps {
  isDarkMode: boolean;
}

export const CustomWalletButton = ({ isDarkMode }: CustomWalletButtonProps) => {
  const { toast } = useToast();
  const { disconnect } = useDisconnect();
  
  const getConnectionStatus = () => {
    const statuses = ["good", "medium", "poor"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const colors = {
      good: "text-connection-good",
      medium: "text-connection-medium",
      poor: "text-connection-poor"
    };
    const speeds = {
      good: "~12ms",
      medium: "~45ms", 
      poor: "~120ms"
    };
    return { status, color: colors[status as keyof typeof colors], speed: speeds[status as keyof typeof speeds] };
  };

  const connectionInfo = getConnectionStatus();

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast({
        title: "Adresse copiée",
        description: "L'adresse du wallet a été copiée dans le presse-papier",
      });
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openConnectModal,
        openAccountModal,
        openChainModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div className="flex items-center gap-4">
            {connected && (
              <Card className="px-3 py-1.5 bg-card border-border">
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Wifi className={`w-3 h-3 ${connectionInfo.color}`} />
                    <span className="text-muted-foreground">{connectionInfo.speed}</span>
                  </div>
                  <div className="w-px h-3 bg-border" />
                  <span className="font-mono text-foreground">
                    {account.displayName}
                  </span>
                </div>
              </Card>
            )}

            {(() => {
              if (!connected) {
                return (
                  <Button
                    onClick={openConnectModal}
                    variant="default"
                    size="sm"
                    className="h-8"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button
                    onClick={openChainModal}
                    variant="destructive"
                    size="sm"
                    className="h-8"
                  >
                    Wrong network
                  </Button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8"
                      >
                        <Wallet className="w-4 h-4 mr-2" />
                        Connected
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4 bg-card border-border" align="end">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                              <Wallet className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{account.displayName}</p>
                              <p className="text-sm text-muted-foreground">0 ETH</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => copyAddress(account.address)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copier l'adresse
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => disconnect()}
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Déconnecter
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};