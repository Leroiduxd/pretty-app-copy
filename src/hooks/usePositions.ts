import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';
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

// Static pair metadata provided by backend
const PAIR_METADATA: Record<string, { id: number; name: string }> = {
  "aapl_usd": { id: 6004, name: "APPLE INC." },
  "amzn_usd": { id: 6005, name: "AMAZON" },
  "coin_usd": { id: 6010, name: "COINBASE" },
  "goog_usd": { id: 6003, name: "ALPHABET INC." },
  "gme_usd": { id: 6011, name: "GAMESTOP CORP." },
  "intc_usd": { id: 6009, name: "INTEL CORPORATION" },
  "ko_usd": { id: 6059, name: "COCA-COLA CO" },
  "mcd_usd": { id: 6068, name: "MCDONALD'S CORP" },
  "msft_usd": { id: 6001, name: "MICROSOFT CORP" },
  "ibm_usd": { id: 6066, name: "IBM" },
  "meta_usd": { id: 6006, name: "META PLATFORMS INC." },
  "nvda_usd": { id: 6002, name: "NVIDIA CORP" },
  "tsla_usd": { id: 6000, name: "TESLA INC" },
  "aud_usd": { id: 5010, name: "AUSTRALIAN DOLLAR" },
  "eur_usd": { id: 5000, name: "EURO" },
  "gbp_usd": { id: 5002, name: "GREAT BRITAIN POUND" },
  "nzd_usd": { id: 5013, name: "NEW ZEALAND DOLLAR" },
  "usd_cad": { id: 5011, name: "CANADIAN DOLLAR" },
  "usd_chf": { id: 5012, name: "SWISS FRANC" },
  "usd_jpy": { id: 5001, name: "JAPANESE YEN" },
  "xag_usd": { id: 5501, name: "SILVER" },
  "xau_usd": { id: 5500, name: "GOLD" },
  "btc_usdt": { id: 0, name: "BITCOIN" },
  "eth_usdt": { id: 1, name: "ETHEREUM" },
  "sol_usdt": { id: 10, name: "SOLANA" },
  "xrp_usdt": { id: 14, name: "RIPPLE" },
  "avax_usdt": { id: 5, name: "AVALANCHE" },
  "doge_usdt": { id: 3, name: "DOGECOIN" },
  "trx_usdt": { id: 15, name: "TRON" },
  "ada_usdt": { id: 16, name: "CARDANO" },
  "sui_usdt": { id: 90, name: "SUI" },
  "link_usdt": { id: 2, name: "CHAINLINK" }
};

// Convenience: metadata indexed by id
const METADATA_BY_ID = new Map<number, { key: string; name: string }>(
  Object.entries(PAIR_METADATA).map(([k, v]) => [v.id, { key: k.toUpperCase(), name: v.name }])
);

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

  // Seed maps from static metadata once
  useEffect(() => {
    METADATA_BY_ID.forEach((meta, id) => {
      idToPair.set(id, meta.key);
    });
  }, []);

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
            // Mock data for now - replace with actual contract calls
            const mockOpen = {
              trader: address || '',
              id: id,
              assetIndex: Number(id) % 10, // Mock asset index based on ID
              isLong: Number(id) % 2 === 0,
              leverage: BigInt(10),
              openPrice: BigInt("50000000000000000000000"), // 50000 * 1e18
              sizeUsd: BigInt("1000000000"), // 1000 * 1e6
              timestamp: BigInt(Math.floor(Date.now() / 1000) - 3600),
              stopLossPrice: BigInt(0),
              takeProfitPrice: BigInt(0),
              liquidationPrice: BigInt("45000000000000000000000") // 45000 * 1e18
            };

            const assetIndex = mockOpen.assetIndex;
            // Get name from metadata based on assetIndex
            const metaData = METADATA_BY_ID.get(assetIndex);
            const symbol = metaData?.name || `ASSET_${assetIndex}`;
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
            orderPrice: BigInt("49000000000000000000000"), // 49000 * 1e18
            sizeUsd: BigInt("500000000"), // 500 * 1e6
            timestamp: BigInt(Math.floor(Date.now() / 1000) - 1800),
            stopLoss: BigInt(0),
            takeProfit: BigInt(0)
          };

          const assetIndex = mockOrder.assetIndex;
          const metaData = METADATA_BY_ID.get(assetIndex);
          const symbol = metaData?.name || `ASSET_${assetIndex}`;
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
      const metaData = METADATA_BY_ID.get(assetIndex);
      const symbol = metaData?.name || `ASSET_${assetIndex}`;
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