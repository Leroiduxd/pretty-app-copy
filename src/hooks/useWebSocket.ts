import { useState, useEffect, useRef } from 'react';

export interface WebSocketData {
  [pairKey: string]: {
    id?: string;
    name?: string;
    instruments?: Array<{
      tradingPair: string;
      currentPrice: string;
      "24h_high": string;
      "24h_low": string;
      "24h_change": string;
      timestamp: string;
    }>;
  };
}

export const useWebSocket = (url: string) => {
  const [data, setData] = useState<WebSocketData>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connect = () => {
      try {
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.onopen = () => {
          setIsConnected(true);
          setError(null);
          console.log('WebSocket connected');
        };

        socket.onmessage = (event) => {
          try {
            const parsedData = JSON.parse(event.data);
            setData(parsedData);
          } catch (err) {
            console.error('Error parsing WebSocket data:', err);
            setError('Error parsing data');
          }
        };

        socket.onerror = (err) => {
          console.error('WebSocket Error:', err);
          setError('WebSocket connection error');
          setIsConnected(false);
        };

        socket.onclose = () => {
          setIsConnected(false);
          console.log('WebSocket disconnected');
          
          // Reconnect after 3 seconds
          setTimeout(() => {
            if (socketRef.current?.readyState === WebSocket.CLOSED) {
              connect();
            }
          }, 3000);
        };
      } catch (err) {
        console.error('Error creating WebSocket:', err);
        setError('Failed to create WebSocket connection');
      }
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [url]);

  return { data, isConnected, error };
};