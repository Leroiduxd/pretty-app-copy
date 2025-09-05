import { useState, useEffect } from 'react';

interface ChartData {
  time: string;
  timestamp: string;
  open: string;
  high: string;
  low: string;
  close: string;
}

interface UseChartDataProps {
  pairId: string | null;
  interval?: number;
}

export const useChartData = ({ pairId, interval = 3600 }: UseChartDataProps) => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pairId) return;

    const fetchChartData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`https://chart.brokex.trade/history?pair=${pairId}&interval=${interval}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const chartData = await response.json();
        setData(chartData);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [pairId, interval]);

  // Convert data to lightweight-charts format
  const formatDataForChart = () => {
    return data.map(item => ({
      time: Math.floor(parseInt(item.time) / 1000) as any, // Convert to seconds and cast as Time
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
    })).sort((a, b) => a.time - b.time);
  };

  return {
    data,
    formattedData: formatDataForChart(),
    loading,
    error,
  };
};