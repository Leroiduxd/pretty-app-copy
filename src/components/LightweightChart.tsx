import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, LineSeries, ColorType } from 'lightweight-charts';

interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Position {
  id: string;
  openPrice: number;
  isLong: boolean;
  size: number;
  pnl: number;
}

interface LightweightChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
  chartType?: string;
  positions?: Position[];
  currentPrice?: number;
}

export const LightweightChart = ({ data, width, height, chartType = "candlesticks", positions = [], currentPrice }: LightweightChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const priceLinesRef = useRef<any[]>([]);

  // Format prices based on number of digits before decimal
  const formatPrice = (value: number) => {
    if (value === 0) return "0.00";
    const integerPart = Math.floor(Math.abs(value)).toString().length;
    if (integerPart === 1) return value.toFixed(5);
    if (integerPart === 2) return value.toFixed(3);
    return value.toFixed(2);
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

    try {
      // Theme-aware colors - Fixed for light mode visibility
      const isDark = document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches;
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)';
      const borderColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.25)';
      const textColor = isDark ? '#ffffff' : '#374151';

      // Create chart with proper configuration - based on working repo
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: 'transparent' },
          textColor: textColor,
        },
        grid: {
          vertLines: { color: gridColor, style: 0, visible: true },
          horzLines: { color: gridColor, style: 0, visible: true },
        },
        rightPriceScale: {
          borderColor: borderColor,
          textColor: textColor,
          visible: true,
        },
        timeScale: {
          borderColor: borderColor,
          timeVisible: true,
          secondsVisible: false,
          visible: true,
        },
        handleScroll: {
          mouseWheel: true,
          pressedMouseMove: true,
          horzTouchDrag: true,
          vertTouchDrag: true,
        },
        handleScale: {
          axisPressedMouseMove: true,
          mouseWheel: true,
          pinch: true,
          axisDoubleClickReset: true,
        },
        crosshair: {
          mode: 0,
        },
        width: width || chartContainerRef.current.clientWidth,
        height: height || chartContainerRef.current.clientHeight,
      });

      // Create series based on chart type
      let series;
      if (chartType === "lines") {
        series = chart.addSeries(LineSeries, {
          color: '#3b82f6',
          lineWidth: 2,
          priceFormat: {
            type: 'custom',
            formatter: (price: number) => formatPrice(price),
          },
        });
      } else {
        series = chart.addSeries(CandlestickSeries, {
          upColor: '#3b82f6',
          downColor: '#ef4444',
          borderDownColor: '#ef4444',
          borderUpColor: '#3b82f6',
          wickDownColor: '#ef4444',
          wickUpColor: '#3b82f6',
          priceFormat: {
            type: 'custom',
            formatter: (price: number) => formatPrice(price),
          },
        });
      }

      chartRef.current = chart;
      seriesRef.current = series;

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
  }, [width, height, chartType]);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      try {
        // Format data based on chart type
        let formattedData;
        if (chartType === "lines") {
          // For line charts, use only close price and time
          formattedData = data.map(item => ({
            time: item.time,
            value: item.close,
          }));
        } else {
          // For candlestick charts, use all OHLC data
          formattedData = data.map(item => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
          }));
        }

        seriesRef.current.setData(formattedData);
      } catch (error) {
        console.error('Error setting chart data:', error);
      }
    }
  }, [data, chartType]);

  // Add price lines for open positions
  useEffect(() => {
    if (!seriesRef.current || !positions || positions.length === 0) return;

    // Remove existing price lines
    priceLinesRef.current.forEach(line => {
      try {
        seriesRef.current.removePriceLine(line);
      } catch (e) {
        console.warn('Error removing price line:', e);
      }
    });
    priceLinesRef.current = [];

    // Add new price lines for each position
    positions.forEach(position => {
      try {
        const pnlText = position.pnl >= 0 ? `+$${formatPrice(position.pnl)}` : `-$${formatPrice(Math.abs(position.pnl))}`;
        const positionType = position.isLong ? 'LONG' : 'SHORT';
        
        const priceLine = seriesRef.current.createPriceLine({
          price: position.openPrice,
          color: position.isLong ? '#3b82f6' : '#ef5350',
          lineWidth: 2,
          lineStyle: 2, // Dashed
          axisLabelVisible: true,
          title: `${positionType} ${pnlText}`,
        });

        priceLinesRef.current.push(priceLine);
      } catch (error) {
        console.error('Error creating price line:', error);
      }
    });
  }, [positions, currentPrice]);

  return (
    <div className="w-full h-full relative">
      <div ref={chartContainerRef} className="w-full h-full" />
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground">No data available</div>
        </div>
      )}
      {/* TradingView logo with theme awareness */}
      <div className="absolute bottom-2 left-2 opacity-50">
        <svg 
          width="71" 
          height="16" 
          viewBox="0 0 71 16" 
          fill="none" 
          className={document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches ? 'text-white' : 'text-black'}
        >
          <path 
            d="M2.5 0h66c1.4 0 2.5 1.1 2.5 2.5v11c0 1.4-1.1 2.5-2.5 2.5h-66C1.1 16 0 14.9 0 13.5v-11C0 1.1 1.1 0 2.5 0z" 
            fill="currentColor"
          />
          <path 
            d="M8.89 4.03l-1.23.49v7.91h1.23V4.03zm2.84 3.92v4.48h1.23V7.95c0-.98.78-1.77 1.77-1.77.98 0 1.77.78 1.77 1.77v4.48h1.23V7.95c0-1.65-1.35-3-3-3s-3 1.35-3 3zm12.04-3.92c-1.65 0-3 1.35-3 3v1.99c0 1.65 1.35 3 3 3 1.17 0 2.19-.68 2.68-1.67l-1.1-.44c-.29.58-.88.98-1.58.98-.98 0-1.77-.78-1.77-1.77V8.12c0-.98.78-1.77 1.77-1.77.7 0 1.28.4 1.58.98l1.1-.44c-.49-.99-1.51-1.67-2.68-1.67zm8.13 0c-1.65 0-3 1.35-3 3v1.99c0 1.65 1.35 3 3 3s3-1.35 3-3V7.03c0-1.65-1.35-3-3-3zm1.77 4.99c0 .98-.78 1.77-1.77 1.77s-1.77-.78-1.77-1.77V7.03c0-.98.78-1.77 1.77-1.77s1.77.78 1.77 1.77v1.99zm6.36-4.99c-1.65 0-3 1.35-3 3v1.99c0 1.65 1.35 3 3 3 1.17 0 2.19-.68 2.68-1.67l-1.1-.44c-.29.58-.88.98-1.58.98-.98 0-1.77-.78-1.77-1.77V8.12c0-.98.78-1.77 1.77-1.77.7 0 1.28.4 1.58.98l1.1-.44c-.49-.99-1.51-1.67-2.68-1.67zm7.2 0l-2.37 7.95h1.28l.53-1.77h2.47l.53 1.77h1.28l-2.37-7.95h-1.35zm.68 2.22l.89 2.96h-1.78l.89-2.96zm7.38-2.22l-2.37 7.95h1.28l.53-1.77h2.47l.53 1.77h1.28l-2.37-7.95h-1.35zm.68 2.22l.89 2.96h-1.78l.89-2.96zm8.13-2.22c-1.65 0-3 1.35-3 3v1.99c0 1.65 1.35 3 3 3s3-1.35 3-3V7.03c0-1.65-1.35-3-3-3zm1.77 4.99c0 .98-.78 1.77-1.77 1.77s-1.77-.78-1.77-1.77V7.03c0-.98.78-1.77 1.77-1.77s1.77.78 1.77 1.77v1.99z" 
            fill={document.documentElement.classList.contains('dark') || window.matchMedia('(prefers-color-scheme: dark)').matches ? '#000' : '#fff'}
          />
        </svg>
      </div>
    </div>
  );
};