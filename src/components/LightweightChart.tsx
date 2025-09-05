import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, ColorType } from 'lightweight-charts';

interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface LightweightChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
}

export const LightweightChart = ({ data, width, height }: LightweightChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      // Create chart with proper configuration - based on working repo
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: 'hsl(var(--foreground))',
        },
        grid: {
          vertLines: { color: 'hsl(var(--border))' },
          horzLines: { color: 'hsl(var(--border))' },
        },
        rightPriceScale: {
          borderColor: 'hsl(var(--border))',
        },
        timeScale: {
          borderColor: 'hsl(var(--border))',
          timeVisible: true,
          secondsVisible: false,
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
        },
        handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: true,
          pinch: true,
        },
        width: width || chartContainerRef.current.clientWidth,
        height: height || chartContainerRef.current.clientHeight,
      });

      // Use the CORRECT syntax from the working repo: addSeries(CandlestickSeries, options)
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#3b82f6',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#3b82f6',
        wickDownColor: '#ef4444',
        wickUpColor: '#3b82f6',
      });

      chartRef.current = chart;
      seriesRef.current = candlestickSeries;

    } catch (error) {
      console.error('Error creating chart:', error);
    }

    // Cleanup function
    return () => {
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (e) {
          console.warn('Error removing chart:', e);
        }
        chartRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [width, height]);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      try {
        // Format data correctly for lightweight-charts v5
        const formattedData = data.map(item => ({
          time: item.time,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        seriesRef.current.setData(formattedData);
        
        // Fit content to time scale
        if (chartRef.current?.timeScale) {
          chartRef.current.timeScale().fitContent();
        }
      } catch (error) {
        console.error('Error setting chart data:', error);
      }
    }
  }, [data]);

  return (
    <div className="w-full h-full relative">
      <div ref={chartContainerRef} className="w-full h-full" />
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground">Aucune donnée disponible</div>
        </div>
      )}
    </div>
  );
};