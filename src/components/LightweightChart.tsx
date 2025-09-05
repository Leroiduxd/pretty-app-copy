import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

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

export const LightweightChart = ({ data, width = 800, height = 400 }: LightweightChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      // Create chart with proper configuration
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: '#374151' },
          horzLines: { color: '#374151' },
        },
        rightPriceScale: {
          borderColor: '#374151',
        },
        timeScale: {
          borderColor: '#374151',
          timeVisible: true,
          secondsVisible: false,
        },
        width,
        height,
      });

      // Use the correct API for adding a candlestick series
      const candlestickSeries = (chart as any).addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#22c55e',
        wickDownColor: '#ef4444',
        wickUpColor: '#22c55e',
      });

      chartRef.current = chart;
      seriesRef.current = candlestickSeries;

    } catch (error) {
      console.error('Error creating chart:', error);
      // If candlestick fails, create a fallback line chart
      try {
        const lineSeries = (chartRef.current as any).addLineSeries({
          color: '#2563eb',
          lineWidth: 2,
        });
        seriesRef.current = lineSeries;
      } catch (fallbackError) {
        console.error('Fallback chart creation failed:', fallbackError);
      }
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
        // Format data for the chart
        const formattedData = data.map(item => ({
          time: item.time as any,
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
        // Fallback: try setting as line data using close prices
        try {
          const lineData = data.map(item => ({
            time: item.time as any,
            value: item.close,
          }));
          seriesRef.current.setData(lineData);
        } catch (fallbackError) {
          console.error('Fallback data setting failed:', fallbackError);
        }
      }
    }
  }, [data]);

  if (!chartContainerRef) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="text-muted-foreground">Erreur lors du chargement du graphique</div>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div ref={chartContainerRef} className="w-full" />
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground">Aucune donnée disponible</div>
        </div>
      )}
    </div>
  );
};