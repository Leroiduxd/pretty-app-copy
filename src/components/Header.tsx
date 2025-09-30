import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Moon, Sun, BarChart3, ChevronDown, Droplets, Bug, Trophy } from "lucide-react";
import { CustomWalletButton } from "./CustomWalletButton";
import { ReportBugModal } from "./ReportBugModal";
import { FaucetModal } from "./FaucetModal";
import { CompetitionModal } from "./CompetitionModal";

interface HeaderProps {
  onTogglePositions: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header = ({ onTogglePositions, isDarkMode, onToggleDarkMode }: HeaderProps) => {
  const [selectedNetwork, setSelectedNetwork] = useState("pharos");
  const [faucetOpen, setFaucetOpen] = useState(false);
  const [reportBugOpen, setReportBugOpen] = useState(false);
  const [competitionOpen, setCompetitionOpen] = useState(false);
  const [lastUsedTool, setLastUsedTool] = useState<'faucet' | 'bug' | 'competition'>('faucet');

  const networks = [
    { value: "pharos", label: "Pharos Testnet", color: "text-blue-500" },
  ];

  return (
    <header className="bg-header-bg border-b border-border px-2 md:px-4 py-2 md:py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 md:gap-4">
          <a 
            href="https://brokex.trade" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm md:text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer"
          >
            Brokex
          </a>
          
          <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
            <SelectTrigger className="w-24 md:w-40 h-7 md:h-8 bg-card border-border text-xs md:text-sm">
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
              <Button variant="outline" size="sm" className="flex items-center gap-1 md:gap-2 h-7 md:h-8 text-xs md:text-sm px-2 md:px-3">
                {lastUsedTool === 'faucet' && (
                  <>
                    <Droplets className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden md:inline">Faucet</span>
                  </>
                )}
                {lastUsedTool === 'bug' && (
                  <>
                    <Bug className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden md:inline">Report Bug</span>
                  </>
                )}
                {lastUsedTool === 'competition' && (
                  <>
                    <Trophy className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden md:inline">Competition</span>
                  </>
                )}
                <ChevronDown className="h-2 w-2 md:h-3 md:w-3" />
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

        <div className="flex items-center gap-1 md:gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onTogglePositions}
            className="h-7 md:h-8 px-2 md:px-3"
          >
            <BarChart3 className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
            <span className="hidden md:inline">Positions</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleDarkMode}
            className="h-7 w-7 md:h-8 md:w-8 p-0"
          >
            {isDarkMode ? <Sun className="w-3 h-3 md:w-4 md:h-4" /> : <Moon className="w-3 h-3 md:w-4 md:h-4" />}
          </Button>

          <CustomWalletButton isDarkMode={isDarkMode} />
        </div>
      </div>
    </header>
  );
};