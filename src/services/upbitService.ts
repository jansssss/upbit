class UpbitService {
  private readonly baseUrl = 'https://api.upbit.com/v1';

  async getCoinPrice(symbol: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/ticker?markets=${symbol}`);
      if (!response.ok) {
        throw new Error('Failed to fetch price');
      }
      const data = await response.json();
      return data[0]?.trade_price || 0;
    } catch (error) {
      console.error('Error fetching coin price:', error);
      return 0;
    }
  }

  async getWatchlistPrices(symbols: string[]): Promise<Map<string, number>> {
    try {
      const markets = symbols.join(',');
      const response = await fetch(`${this.baseUrl}/ticker?markets=${markets}`);
      if (!response.ok) {
        throw new Error('Failed to fetch prices');
      }
      const data = await response.json();
      
      return new Map(
        data.map((item: any) => [item.market, item.trade_price])
      );
    } catch (error) {
      console.error('Error fetching watchlist prices:', error);
      return new Map();
    }
  }
}

export const upbitService = new UpbitService();
