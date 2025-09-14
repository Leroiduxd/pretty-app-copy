import { useEffect, useState } from 'react';

export const LoadingScreen = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen bg-background flex flex-col items-center justify-center relative">
      {/* Loading bar */}
      <div className="w-64 h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary animate-pulse"></div>
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