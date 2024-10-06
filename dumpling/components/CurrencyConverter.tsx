import React, { useState, useEffect } from 'react';

const CurrencyConverter = () => {
  const [exchangeRate, setExchangeRate] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // Using Exchange Rate API (free)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();

        // Get INR rate from response
        const inrRate = data.rates.INR;
        setExchangeRate(inrRate);
        setLastUpdated(new Date().toLocaleString());
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    };

    // Fetch initial rate
    fetchExchangeRate();

    // Update rate every 5 minutes
    const interval = setInterval(fetchExchangeRate, 300000);

    return () => clearInterval(interval);
  }, []);

  const convertUSDtoINR = (usdAmount: any) => {
    if (!exchangeRate) return null;
    return (usdAmount * exchangeRate).toFixed(10);
  };

  return {
    exchangeRate,
    lastUpdated,
    convertUSDtoINR,
  };
};

export default CurrencyConverter;
