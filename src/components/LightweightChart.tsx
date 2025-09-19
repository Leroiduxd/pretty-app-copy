import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, LineSeries, ColorType } from 'lightweight-charts';

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
  chartType?: string;
}

export const LightweightChart = ({ data, width, height, chartType = "candlesticks" }: LightweightChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

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

  return (
    <div className="w-full h-full relative">
      <div ref={chartContainerRef} className="w-full h-full" />
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground">No data available</div>
        </div>
      )}
    </div>
  );
};