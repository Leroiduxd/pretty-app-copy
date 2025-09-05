import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { pharosTestnet } from '@/lib/wagmi';

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
  });

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
            const response = await fetch('https://testnet.dplabs-internal.com', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_call',
                params: [{
                  to: CORE_CONTRACT_ADDRESS,
                  data: `0x${CORE_CONTRACT_ABI.find(f => f.name === 'getOpenById')?.name}${id.toString(16).padStart(64, '0')}`
                }, 'latest']
              })
            });
            
            // For now, we'll use mock data structure until proper RPC call is implemented
            // This will be replaced with actual contract call
            const mockOpen = {
              trader: address || '',
              id: id,
              assetIndex: Number(id) % 10, // Mock asset index
              isLong: Number(id) % 2 === 0,
              leverage: BigInt(10),
              openPrice: parseUnits('50000', 18), // Mock price
              sizeUsd: parseUnits('1000', 6), // Mock size
              timestamp: BigInt(Math.floor(Date.now() / 1000) - 3600),
              slBucketId: BigInt(0),
              tpBucketId: BigInt(0),
              liqBucketId: BigInt(0),
              stopLossPrice: BigInt(0),
              takeProfitPrice: BigInt(0),
              liquidationPrice: parseUnits('45000', 18)
            };

            const assetIndex = mockOpen.assetIndex;
            const symbol = idToPair.get(assetIndex) || `ASSET_${assetIndex}`;
            const currentPrice = lastPrices[assetIndex] || 51000; // Mock current price
            
            // Convert from on-chain format
            const openPrice = Number(formatUnits(mockOpen.openPrice, 18));
            const sizeUsd = Number(formatUnits(mockOpen.sizeUsd, 6));
            const leverage = Number(mockOpen.leverage);
            const liquidationPrice = Number(formatUnits(mockOpen.liquidationPrice, 18));
            
            // Calculate PnL
            const dir = mockOpen.isLong ? 1 : -1;
            const pnlUsd = sizeUsd * ((currentPrice / openPrice - 1) * dir);
            const usedMargin = sizeUsd / leverage;
            const pnlPercent = (pnlUsd / usedMargin) * 100;

            positions.push({
              id: mockOpen.id,
              trader: mockOpen.trader,
              assetIndex,
              isLong: mockOpen.isLong,
              leverage,
              openPrice,
              sizeUsd,
              timestamp: Number(mockOpen.timestamp),
              liquidationPrice,
              stopLossPrice: Number(formatUnits(mockOpen.stopLossPrice, 18)),
              takeProfitPrice: Number(formatUnits(mockOpen.takeProfitPrice, 18)),
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
          // Mock order data - replace with actual contract call
          const mockOrder = {
            trader: address || '',
            id: id,
            assetIndex: Number(id) % 10,
            isLong: Number(id) % 2 === 0,
            leverage: BigInt(5),
            orderPrice: parseUnits('49000', 18),
            sizeUsd: parseUnits('500', 6),
            timestamp: BigInt(Math.floor(Date.now() / 1000) - 1800),
            stopLoss: BigInt(0),
            takeProfit: BigInt(0),
            limitBucketId: BigInt(0)
          };

           const assetIndex = mockOrder.assetIndex;
           const symbol = idToPair.get(assetIndex) || `ASSET_${assetIndex}`;
           const currentPrice = lastPrices[assetIndex] || 51000;
          
          orders.push({
            id: mockOrder.id,
            trader: mockOrder.trader,
            assetIndex,
            isLong: mockOrder.isLong,
            leverage: Number(mockOrder.leverage),
            orderPrice: Number(formatUnits(mockOrder.orderPrice, 18)),
            sizeUsd: Number(formatUnits(mockOrder.sizeUsd, 6)),
            timestamp: Number(mockOrder.timestamp),
            stopLoss: Number(formatUnits(mockOrder.stopLoss, 18)),
            takeProfit: Number(formatUnits(mockOrder.takeProfit, 18)),
            symbol,
            currentPrice
          });
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