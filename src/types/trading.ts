export type Theme = 'light' | 'dark';

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  id?: number;
  high24h?: number;
  low24h?: number;
}

export interface AssetData {
  id: number;
  name: string;
  instruments: {
    tradingPair: string;
    currentPrice: number;
    "24h_high": number;
    "24h_low": number;
    "24h_change": number;
    timestamp: string;
  }[];
}

export interface WebSocketData {
  [key: string]: AssetData;
}