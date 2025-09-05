"use client";

import { useEffect, useRef, useState } from 'react';
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { Button } from '@/components/ui/button';

interface ChartProps {
  pairId?: number;
  theme: 'dark' | 'light';
}

interface OHLCData {
  time: string;
  timestamp: string;
  open: string;
  high: string;
  low: string;
  close: string;
}

const INTERVALS = [
  { label: '1M', value: 60 },
  { label: '5M', value: 300 },
  { label: '15M', value: 900 },
  { label: '1H', value: 3600 },
  { label: '4H', value: 14400 },
];

export const LightweightChart = ({ pairId, theme }: ChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);
  
  const [currentInterval, setCurrentInterval] = useState(300); // 5M default
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getThemeOptions = (isDark: boolean) => ({
    layout: {
      background: { color: isDark ? 'hsl(var(--background))' : 'hsl(var(--background))' },
      textColor: isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))',
    },
    grid: {
      vertLines: { color: isDark ? 'hsl(var(--border))' : 'hsl(var(--border))' },
      horzLines: { color: isDark ? 'hsl(var(--border))' : 'hsl(var(--border))' },
    },
    timeScale: {
      borderColor: isDark ? 'hsl(var(--border))' : 'hsl(var(--border))',
      timeVisible: true,
      secondsVisible: false,
    },
    rightPriceScale: {
      borderColor: isDark ? 'hsl(var(--border))' : 'hsl(var(--border))',
    },
    crosshair: {
      mode: 1,
    },
  });

  const initChart = () => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      ...getThemeOptions(theme === 'dark'),
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#3b82f6', // Blue for bullish
      downColor: '#ef4444', // Red for bearish
      borderVisible: false,
      wickUpColor: '#3b82f6',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Setup resize observer
    resizeObserver.current = new ResizeObserver(() => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    });

    if (chartContainerRef.current) {
      resizeObserver.current.observe(chartContainerRef.current);
    }
  };

  const updateChartTheme = () => {
    if (chartRef.current) {
      chartRef.current.applyOptions(getThemeOptions(theme === 'dark'));
    }
  };

  const fetchHistoryData = async (pairId: number, intervalSec: number) => {
    const response = await fetch(
      `https://chart.brokex.trade/history?pair=${pairId}&interval=${intervalSec}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    
    const data: OHLCData[] = await response.json();
    
    return data.map(item => ({
      time: Math.floor(Number(item.time) / 1000),
      open: Number(item.open),
      high: Number(item.high),
      low: Number(item.low),
      close: Number(item.close),
    }));
  };

  const fetchAndApplyData = async (pairId: number, intervalSec: number) => {
    if (!seriesRef.current || !chartRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const ohlcData = await fetchHistoryData(pairId, intervalSec);
      seriesRef.current.setData(ohlcData);
      chartRef.current.timeScale().fitContent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      console.error('Chart data fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIntervalChange = (newInterval: number) => {
    setCurrentInterval(newInterval);
    if (pairId) {
      fetchAndApplyData(pairId, newInterval);
    }
  };

  // Initialize chart
  useEffect(() => {
    initChart();
    return () => {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  // Update theme
  useEffect(() => {
    updateChartTheme();
  }, [theme]);

  // Fetch data when pairId or interval changes
  useEffect(() => {
    if (pairId && chartRef.current && seriesRef.current) {
      fetchAndApplyData(pairId, currentInterval);
    }
  }, [pairId, currentInterval]);

  return (
    <div className="flex-1 p-4 overflow-hidden">
      <div className="h-full bg-card border border-border rounded-lg flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex gap-4 text-sm">
              {INTERVALS.map((interval) => (
                <Button
                  key={interval.value}
                  variant={currentInterval === interval.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleIntervalChange(interval.value)}
                  className={currentInterval === interval.value ? 'bg-primary text-primary-foreground' : ''}
                >
                  {interval.label}
                </Button>
              ))}
            </div>
            
            {pairId && (
              <div className="text-sm text-muted-foreground">
                ID #{pairId}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
              <div className="text-sm text-muted-foreground">Loading chart data...</div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
              <div className="text-center">
                <div className="text-sm text-destructive mb-2">{error}</div>
                <Button
                  size="sm"
                  onClick={() => pairId && fetchAndApplyData(pairId, currentInterval)}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}
          
          <div ref={chartContainerRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};