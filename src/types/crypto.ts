export interface CryptoAsset {
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
}

export interface Portfolio {
  assets: CryptoAsset[];
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
}
