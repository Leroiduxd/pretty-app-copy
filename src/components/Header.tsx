import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Moon, Sun, BarChart3, ChevronDown, Droplets, Bug, Trophy, PanelLeftClose, PanelLeft } from "lucide-react";
import { CustomWalletButton } from "./CustomWalletButton";
import { ReportBugModal } from "./ReportBugModal";
import { FaucetModal } from "./FaucetModal";
import { CompetitionModal } from "./CompetitionModal";

interface HeaderProps {
  onTogglePositions: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isStockListVisible: boolean;
  onToggleStockList: () => void;
}

export const Header = ({ onTogglePositions, isDarkMode, onToggleDarkMode, isStockListVisible, onToggleStockList }: HeaderProps) => {
  const [selectedNetwork, setSelectedNetwork] = useState("pharos");
  const [faucetOpen, setFaucetOpen] = useState(false);
  const [reportBugOpen, setReportBugOpen] = useState(false);
  const [competitionOpen, setCompetitionOpen] = useState(false);
  const [lastUsedTool, setLastUsedTool] = useState<'faucet' | 'bug' | 'competition'>('faucet');

  const networks = [
    { value: "pharos", label: "Pharos Testnet", color: "text-blue-500" },
  ];

  return (
    <header className="bg-header-bg border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a 
            href="https://brokex.trade" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            Brokex Protocol
          </a>
          
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2 h-8">
                {lastUsedTool === 'faucet' && (
                  <>
                    <Droplets className="h-4 w-4" />
                    Faucet
                  </>
                )}
                {lastUsedTool === 'bug' && (
                  <>
                    <Bug className="h-4 w-4" />
                    Report Bug
                  </>
                )}
                {lastUsedTool === 'competition' && (
                  <>
                    <Trophy className="h-4 w-4" />
                    Competition
                  </>
                )}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-popover border-border z-50">
              <DropdownMenuItem onClick={() => { setFaucetOpen(true); setLastUsedTool('faucet'); }} className="cursor-pointer">
                <Droplets className="h-4 w-4 mr-2" />
                Faucet
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setReportBugOpen(true); setLastUsedTool('bug'); }} className="cursor-pointer">
                <Bug className="h-4 w-4 mr-2" />
                Report Bug
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { setCompetitionOpen(true); setLastUsedTool('competition'); }} className="cursor-pointer">
                <Trophy className="h-4 w-4 mr-2 text-blue-500" />
                Competition
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <FaucetModal open={faucetOpen} onOpenChange={setFaucetOpen} />
          <ReportBugModal open={reportBugOpen} onOpenChange={setReportBugOpen} />
          <CompetitionModal open={competitionOpen} onOpenChange={setCompetitionOpen} />
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

          <CustomWalletButton isDarkMode={isDarkMode} />
        </div>
      </div>
    </header>
  );
};