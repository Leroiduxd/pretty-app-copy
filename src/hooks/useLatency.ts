import { useState, useEffect } from 'react';

export interface LatencyData {
  latency: number;
  status: 'good' | 'medium' | 'poor';
  color: string;
}

export const useLatency = () => {
  const [latencyData, setLatencyData] = useState<LatencyData>({
    latency: 0,
    status: 'good',
    color: 'text-green-500'
  });

  const measureLatency = async (): Promise<number> => {
    try {
      const start = Date.now();
      await fetch('https://testnet.dplabs-internal.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: Date.now(),
          method: 'eth_blockNumber',
          params: []
        })
      });
      const end = Date.now();
      return end - start;
    } catch (error) {
      console.error('Latency measurement failed:', error);
      return 999; // Return high latency on error
    }
  };

  const getLatencyStatus = (latency: number): LatencyData => {
    if (latency < 100) {
      return {
        latency,
        status: 'good',
        color: 'text-green-500'
      };
    } else if (latency < 300) {
      return {
        latency,
        status: 'medium',
        color: 'text-yellow-500'
      };
    } else {
      return {
        latency,
        status: 'poor',
        color: 'text-red-500'
      };
    }
  };

  useEffect(() => {
    const measureAndUpdate = async () => {
      const latency = await measureLatency();
      const status = getLatencyStatus(latency);
      setLatencyData(status);
    };

    // Initial measurement
    measureAndUpdate();

    // Set up interval for every minute (60000ms)
    const interval = setInterval(measureAndUpdate, 60000);

    return () => clearInterval(interval);
  }, []);

  return latencyData;
};