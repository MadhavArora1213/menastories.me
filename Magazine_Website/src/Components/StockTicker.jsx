import React, { useEffect, useState } from 'react';

const StockTicker = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStocks = async () => {
      try {
        // Using Alpha Vantage API for real stock data
        const apiKey = 'YOUR_ALPHA_VANTAGE_API_KEY'; // Replace with actual API key
        const symbols = ['MSFT', 'AAPL', 'GOOGL', 'AMZN', 'TSLA'];

        const stockPromises = symbols.map(async (symbol) => {
          try {
            const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`);
            const data = await res.json();

            if (data['Global Quote']) {
              const quote = data['Global Quote'];
              return {
                s: symbol,
                p: parseFloat(quote['05. price']).toFixed(2),
                d: parseFloat(quote['09. change']).toFixed(2),
                dp: parseFloat(quote['10. change percent'].replace('%', '')).toFixed(2)
              };
            }
          } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
          }
          return null;
        });

        const results = await Promise.all(stockPromises);
        const validStocks = results.filter(stock => stock !== null);

        if (validStocks.length > 0) {
          setStocks(validStocks);
        } else {
          // Fallback to mock data if API fails
          setStocks([
            { s: 'MSFT', p: '378.85', d: '+2.45', dp: '+0.65' },
            { s: 'AAPL', p: '192.53', d: '-1.23', dp: '-0.63' },
            { s: 'GOOGL', p: '141.80', d: '+0.95', dp: '+0.68' },
            { s: 'AMZN', p: '155.89', d: '+3.21', dp: '+2.10' },
            { s: 'TSLA', p: '248.42', d: '-5.67', dp: '-2.23' }
          ]);
        }
      } catch (error) {
        console.error('Error loading stocks:', error);
        // Fallback to mock data
        setStocks([
          { s: 'MSFT', p: '378.85', d: '+2.45', dp: '+0.65' },
          { s: 'AAPL', p: '192.53', d: '-1.23', dp: '-0.63' },
          { s: 'GOOGL', p: '141.80', d: '+0.95', dp: '+0.68' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadStocks();

    // Refresh every 5 minutes
    const interval = setInterval(loadStocks, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 text-white rounded p-1 flex items-center space-x-1">
        <div className="w-3 h-3 bg-gray-600 rounded animate-pulse"></div>
        <div className="text-xs text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white rounded overflow-hidden">
      <div className="px-1 py-1 flex gap-2 overflow-x-auto scrollbar-hide">
        {stocks.map(stock => (
          <div key={stock.s} className="text-xs whitespace-nowrap flex-shrink-0 flex items-center space-x-1">
            <span className="font-semibold">{stock.s}</span>
            <span>{stock.p}</span>
            <span className={parseFloat(stock.d) >= 0 ? 'text-green-400' : 'text-red-400'}>
              {parseFloat(stock.d) >= 0 ? '+' : ''}{stock.d}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockTicker;

