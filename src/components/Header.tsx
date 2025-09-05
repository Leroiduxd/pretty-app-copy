import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Wallet, Wifi, Menu, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useUSDCBalance } from '@/hooks/useUSDCBalance';

interface HeaderProps {
  onTogglePositions: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header = ({ onTogglePositions, isDarkMode, onToggleDarkMode }: HeaderProps) => {
  const [selectedNetwork, setSelectedNetwork] = useState("pharos");
  const { address, isConnected } = useAccount();
  const { balance } = useUSDCBalance(address);

  const networks = [
    { value: "pharos", label: "Pharos Testnet", color: "text-blue-500" },
  ];

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
    <header className="bg-header-bg border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground">Brokex Protocol</h1>
          
          <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
            <SelectTrigger className="w-40 h-8 bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {networks.map((network) => (
                <SelectItem key={network.value} value={network.value}>
                  <span className={network.color}>{network.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => window.open('https://brokex.trade/faucet', '_blank')}
          >
            Faucet
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePositions}
            className="h-8"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Positions
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleDarkMode}
            className="h-8 w-8 p-0"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {isConnected && address ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 font-mono text-xs"
            >
              <Wallet className="w-3 h-3 mr-2" />
              {address.slice(0, 6)}...{address.slice(-4)}
            </Button>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <Button
                  onClick={openConnectModal}
                  variant="default"
                  size="sm"
                  className="h-8"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  Connecter le portefeuille
                </Button>
              )}
            </ConnectButton.Custom>
          )}
        </div>
      </div>
    </header>
  );
};