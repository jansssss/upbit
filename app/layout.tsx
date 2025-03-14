"use client";

import React from 'react';
import { PortfolioProvider } from '../src/contexts/PortfolioContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PortfolioProvider>
          {children}
        </PortfolioProvider>
      </body>
    </html>
  );
} 