import { useState, useEffect } from 'react';
import { useAccount, useReadContract, usePublicClient } from 'wagmi';

import { formatUnits } from 'viem';
import { pharosTestnet } from '@/lib/wagmi';
import { useWebSocket } from '@/hooks/useWebSocket';


const CORE_CONTRACT_ADDRESS = '0x34f89ca5a1c6dc4eb67dfe0af5b621185df32854' as const;

const CORE_CONTRACT_ABI = [
  {
    "inputs":[{"internalType":"address","name":"user","type":"address"}],
    "name":"getUserOpenIds",
    "outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],
    "stateMutability":"view","type":"function"
  },
  {
    "inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],
    "name":"getOpenById",
    "outputs":[{"internalType":"struct IBrokexStorage.Open","name":"","type":"tuple",
      "components":[
        {"internalType":"address","name":"trader","type":"address"},
        {"internalType":"uint256","name":"id","type":"uint256"},
        {"internalType":"uint256","name":"assetIndex","type":"uint256"},
        {"internalType":"bool","name":"isLong","type":"bool"},
        {"internalType":"uint256","name":"leverage","type":"uint256"},
        {"internalType":"uint256","name":"openPrice","type":"uint256"},
        {"internalType":"uint256","name":"sizeUsd","type":"uint256"},
        {"internalType":"uint256","name":"timestamp","type":"uint256"},
        {"internalType":"uint256","name":"slBucketId","type":"uint256"},
        {"internalType":"uint256","name":"tpBucketId","type":"uint256"},
        {"internalType":"uint256","name":"liqBucketId","type":"uint256"},
        {"internalType":"uint256","name":"stopLossPrice","type":"uint256"},
        {"internalType":"uint256","name":"takeProfitPrice","type":"uint256"},
        {"internalType":"uint256","name":"liquidationPrice","type":"uint256"}
      ]}],
    "stateMutability":"view","type":"function"
  },
  {
    "inputs":[
      {"internalType":"uint256","name":"openId","type":"uint256"},
      {"internalType":"bytes","name":"proof","type":"bytes"}
    ],
    "name":"closePosition",
    "outputs":[],
    "stateMutability":"nonpayable","type":"function"
  },
  {
    "inputs":[{"internalType":"address","name":"user","type":"address"}],
    "name":"getUserOrderIds",
    "outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],
    "stateMutability":"view","type":"function"
  },
  {
    "inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],
    "name":"getOrderById",
    "outputs":[{"internalType":"struct IBrokexStorage.Order","name":"","type":"tuple",
      "components":[
        {"internalType":"address","name":"trader","type":"address"},
        {"internalType":"uint256","name":"id","type":"uint256"},
        {"internalType":"uint256","name":"assetIndex","type":"uint256"},
        {"internalType":"bool","name":"isLong","type":"bool"},
        {"internalType":"uint256","name":"leverage","type":"uint256"},
        {"internalType":"uint256","name":"orderPrice","type":"uint256"},
        {"internalType":"uint256","name":"sizeUsd","type":"uint256"},
        {"internalType":"uint256","name":"timestamp","type":"uint256"},
        {"internalType":"uint256","name":"stopLoss","type":"uint256"},
        {"internalType":"uint256","name":"takeProfit","type":"uint256"},
        {"internalType":"uint256","name":"limitBucketId","type":"uint256"}
      ]}],
    "stateMutability":"view","type":"function"
  },
  {
    "inputs":[{"internalType":"uint256","name":"orderId","type":"uint256"}],
    "name":"cancelOrder",
    "outputs":[],
    "stateMutability":"nonpayable","type":"function"
  },
  {
    "inputs":[{"internalType":"address","name":"user","type":"address"}],
    "name":"getUserCloseds",
    "outputs":[{"internalType":"struct IBrokexStorage.Closed[]","name":"","type":"tuple[]",
      "components":[
        {"internalType":"uint256","name":"assetIndex","type":"uint256"},
        {"internalType":"bool","name":"isLong","type":"bool"},
        {"internalType":"uint256","name":"leverage","type":"uint256"},
        {"internalType":"uint256","name":"openPrice","type":"uint256"},
        {"internalType":"uint256","name":"closePrice","type":"uint256"},
        {"internalType":"uint256","name":"sizeUsd","type":"uint256"},
        {"internalType":"uint256","name":"openTimestamp","type":"uint256"},
        {"internalType":"uint256","name":"closeTimestamp","type":"uint256"},
        {"internalType":"int256","name":"pnl","type":"int256"}
      ]}],
    "stateMutability":"view","type":"function"
  }
] as const;

interface OpenPosition {
  id: bigint;
  trader: string;
  assetIndex: number;
  isLong: boolean;
  leverage: number;
  openPrice: number;
  sizeUsd: number;
  timestamp: number;
  liquidationPrice: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  symbol: string;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  margin: number;
}

interface OpenOrder {
  id: bigint;
  trader: string;
  assetIndex: number;
  isLong: boolean;
  leverage: number;
  orderPrice: number;
  sizeUsd: number;
  timestamp: number;
  stopLoss: number;
  takeProfit: number;
  symbol: string;
  currentPrice: number;
}

interface ClosedPosition {
  assetIndex: number;
  isLong: boolean;
  leverage: number;
  openPrice: number;
  closePrice: number;
  sizeUsd: number;
  openTimestamp: number;
  closeTimestamp: number;
  pnl: number;
  symbol: string;
  pnlPercent: number;
}

// Global state for WebSocket data
export const idToPair = new Map<number, string>();
export const lastPrices: { [key: number]: number } = {};

export const usePositions = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: pharosTestnet.id });
  const [openPositions, setOpenPositions] = useState<OpenPosition[]>([]);
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
  const [closedPositions, setClosedPositions] = useState<ClosedPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch open position IDs
  const { data: openIds } = useReadContract({
    address: CORE_CONTRACT_ADDRESS,
    abi: CORE_CONTRACT_ABI,
    functionName: 'getUserOpenIds',
    args: address ? [address] : undefined,
    chainId: pharosTestnet.id,
    query: { enabled: !!address && isConnected }
  } as any);

  // Fetch order IDs
  const { data: orderIds } = useReadContract({
    address: CORE_CONTRACT_ADDRESS,
    abi: CORE_CONTRACT_ABI,
    functionName: 'getUserOrderIds',
    args: address ? [address] : undefined,
    chainId: pharosTestnet.id,
    query: { enabled: !!address && isConnected }
  });

  // Fetch closed positions
  const { data: closedData } = useReadContract({
    address: CORE_CONTRACT_ADDRESS,
    abi: CORE_CONTRACT_ABI,
    functionName: 'getUserCloseds',
    args: address ? [address] : undefined,
    chainId: pharosTestnet.id,
    query: { enabled: !!address && isConnected }
  });

  const { data: wsData } = useWebSocket("wss://wss.brokex.trade:8443");

  // Map WSS ids to pair names and live prices
  useEffect(() => {
    if (!wsData || Object.keys(wsData).length === 0) return;
    idToPair.clear();
    Object.values(wsData as any).forEach((payload: any) => {
      const item = payload?.instruments?.[0];
      const id = Number(payload?.id);
      if (item && !Number.isNaN(id)) {
        idToPair.set(id, String(item.tradingPair).toUpperCase());
        const price = parseFloat(item.currentPrice || '0');
        if (!Number.isNaN(price)) {
          lastPrices[id] = price;
        }
      }
    });
  }, [wsData]);

  // Fetch individual open positions progressively
  useEffect(() => {
    const ids = (openIds as readonly bigint[]) || [];
    let cancelled = false;

    const fetchSequentially = async () => {
      if (!publicClient) return;
      setIsLoading(true);
      setOpenPositions([]);
      try {
        for (const id of ids) {
          if (cancelled) break;
          try {
            const openData: any = await (publicClient as any).readContract({
              address: CORE_CONTRACT_ADDRESS,
              abi: CORE_CONTRACT_ABI,
              functionName: 'getOpenById',
              args: [id],
              chainId: pharosTestnet.id,
            } as any);
            if (!openData) continue;

            const assetIndex = Number(openData.assetIndex);
            const symbol = idToPair.get(assetIndex) || `ASSET_${assetIndex}`;
            const currentPrice = lastPrices[assetIndex] || 0;

            const openPrice = Number(formatUnits(openData.openPrice, 18));
            const sizeUsd = Number(formatUnits(openData.sizeUsd, 6));
            const leverage = Number(openData.leverage);
            const liquidationPrice = Number(formatUnits(openData.liquidationPrice, 18));
            const stopLossPrice = Number(formatUnits(openData.stopLossPrice, 18));
            const takeProfitPrice = Number(formatUnits(openData.takeProfitPrice, 18));

            let pnlUsd = 0;
            let pnlPercent = 0;
            const usedMargin = leverage ? sizeUsd / leverage : 0;
            if (currentPrice > 0 && openPrice > 0 && usedMargin > 0) {
              const dir = openData.isLong ? 1 : -1;
              pnlUsd = sizeUsd * ((currentPrice / openPrice - 1) * dir);
              pnlPercent = (pnlUsd / usedMargin) * 100;
            }

            const position: OpenPosition = {
              id: openData.id,
              trader: openData.trader,
              assetIndex,
              isLong: openData.isLong,
              leverage,
              openPrice,
              sizeUsd,
              timestamp: Number(openData.timestamp),
              liquidationPrice,
              stopLossPrice,
              takeProfitPrice,
              symbol,
              currentPrice,
              pnl: pnlUsd,
              pnlPercent,
              margin: usedMargin,
            };

            if (!cancelled) {
              setOpenPositions((prev) => {
                const exists = prev.some((p) => p.id === position.id);
                if (exists) {
                  return prev.map((p) => (p.id === position.id ? position : p));
                }
                return [...prev, position];
              });
            }
          } catch (err) {
            console.error(`Error reading position ${id.toString()}:`, err);
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    if (!ids || ids.length === 0) {
      setOpenPositions([]);
      return;
    }

    fetchSequentially();
    return () => {
      cancelled = true;
    };
  }, [openIds, publicClient]);

  // Update PnL and price live from WebSocket without re-fetching on-chain
  useEffect(() => {
    if (!wsData) return;
    setOpenPositions((prev) => {
      if (!prev || prev.length === 0) return prev;
      return prev.map((p) => {
        const symbol = idToPair.get(p.assetIndex) || `ASSET_${p.assetIndex}`;
        const currentPrice = lastPrices[p.assetIndex] || 0;
        let pnlUsd = p.pnl;
        let pnlPercent = p.pnlPercent;
        const usedMargin = p.margin || (p.leverage ? p.sizeUsd / p.leverage : 0);
        if (currentPrice > 0 && p.openPrice > 0 && usedMargin > 0) {
          const dir = p.isLong ? 1 : -1;
          pnlUsd = p.sizeUsd * ((currentPrice / p.openPrice - 1) * dir);
          pnlPercent = (pnlUsd / usedMargin) * 100;
        }
        return { ...p, symbol, currentPrice, pnl: pnlUsd, pnlPercent, margin: usedMargin };
      });
    });
  }, [wsData]);

  // Fetch individual orders
  useEffect(() => {
    if (!orderIds || orderIds.length === 0) {
      setOpenOrders([]);
      return;
    }

    const fetchOrders = async () => {
      try {
        if (!publicClient) return;
        const ids = (orderIds as readonly bigint[]) || [];
        const ordersData = await Promise.all(ids.map(async (id) => {
          try {
            const order: any = await publicClient.readContract({
              address: CORE_CONTRACT_ADDRESS,
              abi: CORE_CONTRACT_ABI,
              functionName: 'getOrderById',
              args: [id]
            } as any);

            const assetIndex = Number(order.assetIndex);
            const symbol = idToPair.get(assetIndex) || `ASSET_${assetIndex}`;
            const currentPrice = lastPrices[assetIndex] || 0;

            return {
              id: order.id as bigint,
              trader: String(order.trader),
              assetIndex,
              isLong: Boolean(order.isLong),
              leverage: Number(order.leverage),
              orderPrice: Number(formatUnits(order.orderPrice, 18)),
              sizeUsd: Number(formatUnits(order.sizeUsd, 6)),
              timestamp: Number(order.timestamp),
              stopLoss: Number(formatUnits(order.stopLoss, 18)),
              takeProfit: Number(formatUnits(order.takeProfit, 18)),
              symbol,
              currentPrice
            } as OpenOrder;
          } catch (err) {
            console.error(`Error reading order ${id.toString()}:`, err);
            return null;
          }
        }));

        setOpenOrders(ordersData.filter(Boolean) as OpenOrder[]);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [orderIds, address, wsData]);

  // Update orders live from WebSocket
  useEffect(() => {
    if (!wsData) return;
    setOpenOrders((prev) => {
      if (!prev || prev.length === 0) return prev;
      return prev.map((order) => {
        const symbol = idToPair.get(order.assetIndex) || `ASSET_${order.assetIndex}`;
        const currentPrice = lastPrices[order.assetIndex] || 0;
        return { ...order, symbol, currentPrice };
      });
    });
  }, [wsData]);

  // Process closed positions
  useEffect(() => {
    if (!closedData) {
      setClosedPositions([]);
      return;
    }

    const processedClosed = closedData.map((closed: any) => {
      const assetIndex = Number(closed.assetIndex);
      const symbol = idToPair.get(assetIndex) || `ASSET_${assetIndex}`;
      const sizeUsd = Number(formatUnits(closed.sizeUsd, 6));
      const pnlUsd = Number(formatUnits(closed.pnl, 6));
      const pnlPercent = (pnlUsd / sizeUsd) * 100;

      return {
        assetIndex,
        isLong: closed.isLong,
        leverage: Number(closed.leverage),
        openPrice: Number(formatUnits(closed.openPrice, 18)),
        closePrice: Number(formatUnits(closed.closePrice, 18)),
        sizeUsd,
        openTimestamp: Number(closed.openTimestamp),
        closeTimestamp: Number(closed.closeTimestamp),
        pnl: pnlUsd,
        symbol,
        pnlPercent
      };
    });

    setClosedPositions(processedClosed);
  }, [closedData, wsData]);

  // Update closed positions live from WebSocket
  useEffect(() => {
    if (!wsData) return;
    setClosedPositions((prev) => {
      if (!prev || prev.length === 0) return prev;
      return prev.map((position) => {
        const symbol = idToPair.get(position.assetIndex) || `ASSET_${position.assetIndex}`;
        return { ...position, symbol };
      });
    });
  }, [wsData]);

  const closePosition = async (openId: bigint) => {
    try {
      const position = openPositions.find(p => p.id === openId);
      if (!position) return;

      // Fetch proof
      const response = await fetch(`https://proof.brokex.trade/proof?pairs=${position.assetIndex}`);
      const data = await response.json();
      
      return {
        openId,
        proof: data.proof
      };
    } catch (error) {
      console.error('Error getting close position data:', error);
      throw error;
    }
  };

  const cancelOrder = async (orderId: bigint) => {
    return { orderId };
  };

  return {
    openPositions,
    openOrders,
    closedPositions,
    isLoading,
    closePosition,
    cancelOrder
  };
};