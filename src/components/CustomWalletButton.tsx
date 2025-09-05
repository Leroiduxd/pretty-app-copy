import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Wifi } from "lucide-react";

interface CustomWalletButtonProps {
  isDarkMode: boolean;
}

export const CustomWalletButton = ({ isDarkMode }: CustomWalletButtonProps) => {
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
                  <Button
                    onClick={openAccountModal}
                    variant="secondary"
                    size="sm"
                    className="h-8"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connected
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};