"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CryptoAsset, Portfolio } from '../types/crypto';
import { upbitService } from '../services/upbitService';

interface PortfolioContextType {
  portfolio: Portfolio;
  refreshPrices: () => Promise<void>;
}

const initialAssets: Omit<CryptoAsset, 'currentPrice'>[] = [
  {
    symbol: "KRW-BTC",
    name: "Bitcoin",
    quantity: 23.2,
    purchasePrice: 4300000 // 2019년 3월 21일 기준 가격
  },
  {
    symbol: "KRW-ETH",
    name: "Ethereum",
    quantity: 100,
    purchasePrice: 160000 // 2019년 3월 21일 기준 가격
  },
  {
    symbol: "KRW-XRP",
    name: "Ripple",
    quantity: 30234,
    purchasePrice: 350 // 2019년 3월 21일 기준 가격
  },
  {
    symbol: "KRW-XLM",
    name: "Stellar Lumens",
    quantity: 245142,
    purchasePrice: 120 // 2019년 3월 21일 기준 가격
  }
];

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [portfolio, setPortfolio] = useState<Portfolio>({
    assets: [],
    totalValue: 0,
    totalProfitLoss: 0,
    totalProfitLossPercentage: 0,
  });

  const calculatePortfolioMetrics = (assets: CryptoAsset[]) => {
    const totalValue = assets.reduce((sum, asset) => sum + asset.quantity * asset.currentPrice, 0);
    const totalInvestment = assets.reduce((sum, asset) => sum + asset.quantity * asset.purchasePrice, 0);
    const totalProfitLoss = totalValue - totalInvestment;
    const totalProfitLossPercentage = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

    return {
      assets,
      totalValue,
      totalProfitLoss,
      totalProfitLossPercentage,
    };
  };

  const refreshPrices = async () => {
    const markets = portfolio.assets.map(asset => asset.symbol);
    if (markets.length === 0) return;

    const prices = await upbitService.getWatchlistPrices(markets);
    const updatedAssets = portfolio.assets.map(asset => ({
      ...asset,
      currentPrice: prices.get(asset.symbol) || asset.currentPrice,
    }));

    setPortfolio(calculatePortfolioMetrics(updatedAssets));
  };

  const initializePortfolio = async () => {
    const assets = await Promise.all(
      initialAssets.map(async (asset) => ({
        ...asset,
        currentPrice: await upbitService.getCoinPrice(asset.symbol)
      }))
    );
    setPortfolio(calculatePortfolioMetrics(assets));
  };

  useEffect(() => {
    initializePortfolio();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(refreshPrices, 10000); // 10초마다 가격 갱신
    return () => clearInterval(intervalId);
  }, [portfolio.assets]);

  return (
    <PortfolioContext.Provider
      value={{
        portfolio,
        refreshPrices,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}; 