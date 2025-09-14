import { useEffect, useState } from 'react';

export const LoadingScreen = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 0; // Reset when complete
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen bg-background flex flex-col items-center justify-center relative">
      {/* Loading bar */}
      <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 right-6 text-right">
        <div className="text-sm font-medium text-foreground">
          Brokex Protocol
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          powered by Pharos Network
        </div>
      </div>
    </div>
  );
};