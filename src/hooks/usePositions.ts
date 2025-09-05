import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits, parseUnits, createPublicClient, http } from 'viem';
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
export const idToName = new Map<number, string>();
export const lastPrices: { [key: number]: number } = {};

// Viem public client for on-chain reads
const client = createPublicClient({ chain: pharosTestnet, transport: http() });

export const usePositions = () => {
  const { address, isConnected } = useAccount();
  const [openPositions, setOpenPositions] = useState<OpenPosition[]>([]);
  const [openOrders, setOpenOrders] = useState<OpenOrder[]>([]);
  const [closedPositions, setClosedPositions] = useState<ClosedPosition[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Connect to market WebSocket and maintain maps
  const { data: wsData } = useWebSocket('wss://wss.brokex.trade:8443');

  // Seed maps from static metadata once
  useEffect(() => {
    METADATA_BY_ID.forEach((meta, id) => {
      idToPair.set(id, meta.key);
      idToName.set(id, meta.name);
    });
  }, []);

  // Update live prices and pairs from WebSocket
  useEffect(() => {
    if (!wsData) return;
    Object.entries(wsData).forEach(([pairKey, payload]: any) => {
      const meta = (PAIR_METADATA as any)[pairKey];
      const id = payload?.id ? Number(payload.id) : meta?.id;
      const inst = payload?.instruments?.[0];
      if (typeof id === 'number' && inst) {
        idToPair.set(id, (inst.tradingPair || pairKey).toUpperCase());
        lastPrices[id] = Number(inst.currentPrice);
      }
    });
  }, [wsData]);


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

  // Fetch individual open positions
  useEffect(() => {
    if (!openIds || openIds.length === 0) {
      setOpenPositions([]);
      return;
    }

    const fetchOpenPositions = async () => {
      setIsLoading(true);
      try {
        const positions: OpenPosition[] = [];
        
        for (const id of openIds) {
          try {
            const open: any = await client.readContract({
              address: CORE_CONTRACT_ADDRESS,
              abi: CORE_CONTRACT_ABI,
              functionName: 'getOpenById',
              args: [id]
            });

            const assetIndex = Number(open.assetIndex);
            const symbol = idToName.get(assetIndex) || idToPair.get(assetIndex) || `ASSET_${assetIndex}`;
            const currentPrice = lastPrices[assetIndex] ?? Number(formatUnits(open.openPrice, 18));
            
            // Convert from on-chain format
            const openPrice = Number(formatUnits(open.openPrice, 18));
            const sizeUsd = Number(formatUnits(open.sizeUsd, 6));
            const leverage = Number(open.leverage);
            const liquidationPrice = Number(formatUnits(open.liquidationPrice, 18));
            
            // Calculate PnL
            const dir = open.isLong ? 1 : -1;
            const pnlUsd = sizeUsd * ((currentPrice / openPrice - 1) * dir);
            const usedMargin = sizeUsd / leverage;
            const pnlPercent = (pnlUsd / usedMargin) * 100;

            positions.push({
              id: open.id,
              trader: open.trader,
              assetIndex,
              isLong: open.isLong,
              leverage,
              openPrice,
              sizeUsd,
              timestamp: Number(open.timestamp),
              liquidationPrice,
              stopLossPrice: Number(formatUnits(open.stopLossPrice, 18)),
              takeProfitPrice: Number(formatUnits(open.takeProfitPrice, 18)),
              symbol,
              currentPrice,
              pnl: pnlUsd,
              pnlPercent,
              margin: usedMargin
            });
          } catch (error) {
            console.error(`Error fetching position ${id}:`, error);
          }
        }
        
        setOpenPositions(positions);
      } catch (error) {
        console.error('Error fetching open positions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOpenPositions();
  }, [openIds, address]);

  // Fetch individual orders
  useEffect(() => {
    if (!orderIds || orderIds.length === 0) {
      setOpenOrders([]);
      return;
    }

    const fetchOrders = async () => {
      try {
        const orders: OpenOrder[] = [];
        
        for (const id of orderIds) {
          try {
            const order: any = await client.readContract({
              address: CORE_CONTRACT_ADDRESS,
              abi: CORE_CONTRACT_ABI,
              functionName: 'getOrderById',
              args: [id]
            });

            const assetIndex = Number(order.assetIndex);
            const symbol = idToName.get(assetIndex) || idToPair.get(assetIndex) || `ASSET_${assetIndex}`;
            const currentPrice = lastPrices[assetIndex] ?? Number(formatUnits(order.orderPrice, 18));
            
            orders.push({
              id: order.id,
              trader: order.trader,
              assetIndex,
              isLong: order.isLong,
              leverage: Number(order.leverage),
              orderPrice: Number(formatUnits(order.orderPrice, 18)),
              sizeUsd: Number(formatUnits(order.sizeUsd, 6)),
              timestamp: Number(order.timestamp),
              stopLoss: Number(formatUnits(order.stopLoss, 18)),
              takeProfit: Number(formatUnits(order.takeProfit, 18)),
              symbol,
              currentPrice
            });
          } catch (error) {
            console.error(`Error fetching order ${id}:`, error);
          }
        }
        
        setOpenOrders(orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [orderIds, address]);

  // Process closed positions
  useEffect(() => {
    if (!closedData) {
      setClosedPositions([]);
      return;
    }

    const processedClosed = closedData.map((closed: any) => {
      const assetIndex = Number(closed.assetIndex);
      const symbol = idToName.get(assetIndex) || idToPair.get(assetIndex) || `ASSET_${assetIndex}`;
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
  }, [closedData]);

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