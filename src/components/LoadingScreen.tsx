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
      {/* Loading content */}
      <div className="flex flex-col items-center space-y-6">
        {/* Logo/Brand */}
        <div className="text-4xl font-bold text-foreground">
          Brokex
        </div>
        
        {/* Loading animation */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Loading{dots}
        </div>
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