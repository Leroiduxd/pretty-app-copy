import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLOR_PRESETS = {
  blue: "210 100% 50%",
  green: "142 76% 36%",
  cyan: "189 94% 43%",
  purple: "271 91% 65%",
  orange: "25 95% 53%",
  red: "0 84% 60%",
  pink: "330 81% 60%",
};

const BACKGROUND_PRESETS = {
  light: {
    white: "0 0% 100%",
    gray: "240 4.8% 95.9%",
    blue: "210 100% 98%",
  },
  dark: {
    black: "240 10% 3.9%",
    gray: "240 6% 10%",
    blue: "217 33% 8%",
  }
};

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const { settings, updateSettings, resetSettings } = useSettings();

  const ColorPicker = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: string; 
    onChange: (color: string) => void;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-4 gap-2">
        {Object.entries(COLOR_PRESETS).map(([name, hsl]) => (
          <button
            key={name}
            onClick={() => onChange(hsl)}
            className={`h-10 rounded-md border-2 transition-all ${
              value === hsl ? 'border-primary scale-105' : 'border-border hover:scale-105'
            }`}
            style={{ backgroundColor: `hsl(${hsl})` }}
            title={name}
          />
        ))}
      </div>
    </div>
  );

  const BackgroundPicker = ({ 
    label, 
    value, 
    onChange,
    presets
  }: { 
    label: string; 
    value: string; 
    onChange: (color: string) => void;
    presets: Record<string, string>;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        {Object.entries(presets).map(([name, hsl]) => (
          <button
            key={name}
            onClick={() => onChange(hsl)}
            className={`h-10 rounded-md border-2 transition-all flex items-center justify-center text-xs font-medium ${
              value === hsl ? 'border-primary scale-105' : 'border-border hover:scale-105'
            }`}
            style={{ 
              backgroundColor: `hsl(${hsl})`,
              color: hsl.includes('100%') ? 'hsl(240 10% 3.9%)' : 'hsl(0 0% 98%)'
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Chart Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Chart</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-positions" className="text-sm">
                Show Positions on Chart
              </Label>
              <Switch
                id="show-positions"
                checked={settings.showPositionsOnChart}
                onCheckedChange={(checked) => 
                  updateSettings({ showPositionsOnChart: checked })
                }
              />
            </div>
          </div>

          {/* Color Theme */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Color Theme</h3>
            
            <ColorPicker
              label="Long / Buy Color"
              value={settings.successColor}
              onChange={(color) => updateSettings({ successColor: color })}
            />
            
            <ColorPicker
              label="Short / Sell Color"
              value={settings.dangerColor}
              onChange={(color) => updateSettings({ dangerColor: color })}
            />
          </div>

          {/* Background Colors */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Background Colors</h3>
            
            <BackgroundPicker
              label="Light Mode Background"
              value={settings.lightBackground}
              onChange={(color) => updateSettings({ lightBackground: color })}
              presets={BACKGROUND_PRESETS.light}
            />
            
            <BackgroundPicker
              label="Dark Mode Background"
              value={settings.darkBackground}
              onChange={(color) => updateSettings({ darkBackground: color })}
              presets={BACKGROUND_PRESETS.dark}
            />
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            onClick={resetSettings}
            className="w-full"
          >
            Reset to Default
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
