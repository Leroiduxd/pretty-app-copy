import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { config } from './lib/wagmi';
import Index from "./pages/Index";
import Faucet from "./pages/Faucet";
import NotFound from "./pages/NotFound";
import '@rainbow-me/rainbowkit/styles.css';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient();

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Mobile detection and redirect
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     window.innerWidth <= 768;
    
    if (isMobile) {
      window.location.href = 'https://mobile.brokex.trade';
      return;
    }
  }, []);

  useEffect(() => {
    // Check system theme preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      const isDark = e.matches;
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Set initial theme
    updateTheme(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', updateTheme);

    return () => mediaQuery.removeEventListener('change', updateTheme);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider 
          theme={isDarkMode ? darkTheme() : lightTheme()}
          locale="en-US"
        >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/faucet" element={<Faucet />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
  );
};

export default App;
