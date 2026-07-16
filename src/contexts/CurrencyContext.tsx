import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Currency = "MYR" | "USD" | "BDT";

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  rates: Record<string, number>;
  formatCurrency: (amount: number | string | undefined | null) => string;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Fallback rates in case the API fails
const FALLBACK_RATES: Record<string, number> = {
  MYR: 1,
  USD: 0.21,
  BDT: 26.5,
};

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrencyState] = useState<Currency>("MYR");
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved currency on mount
  useEffect(() => {
    const saved = localStorage.getItem("selected_currency") as Currency;
    if (saved && ["MYR", "USD", "BDT"].includes(saved)) {
      setCurrencyState(saved);
    }
  }, []);

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem("selected_currency", c);
  };

  // Fetch live exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        // Check cache first (cache for 12 hours)
        const cachedRatesStr = localStorage.getItem("exchange_rates_cache");
        if (cachedRatesStr) {
          const cache = JSON.parse(cachedRatesStr);
          const now = new Date().getTime();
          if (now - cache.timestamp < 12 * 60 * 60 * 1000) {
            setRates(cache.rates);
            setIsLoading(false);
            return; // Use cache
          }
        }

        // Fetch live from public API (no key required for er-api)
        const response = await fetch("https://open.er-api.com/v6/latest/MYR");
        if (response.ok) {
          const data = await response.json();
          if (data && data.rates) {
            const newRates = {
              MYR: 1,
              USD: data.rates.USD || FALLBACK_RATES.USD,
              BDT: data.rates.BDT || FALLBACK_RATES.BDT,
            };
            setRates(newRates);
            
            // Save to cache
            localStorage.setItem("exchange_rates_cache", JSON.stringify({
              timestamp: new Date().getTime(),
              rates: newRates
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch exchange rates, using fallbacks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRates();
  }, []);

  /**
   * Intelligently parses a string or number and returns a formatted currency string.
   * e.g. formatCurrency("MYR 22,000") -> "USD 4,620"
   */
  const formatCurrency = (input: number | string | undefined | null): string => {
    if (input === undefined || input === null || input === "") return "-";

    // Extract the numerical value
    let numValue: number;
    
    if (typeof input === "number") {
      numValue = input;
    } else {
      // Remove all non-numeric characters EXCEPT dots
      const cleanStr = input.replace(/[^0-9.]/g, "");
      numValue = parseFloat(cleanStr);
      if (isNaN(numValue)) return input; // If we can't parse a number, return the original string
    }

    // Apply exchange rate based on MYR base
    const rate = rates[currency] || 1;
    const converted = numValue * rate;

    // Format with commas and appropriate decimal places
    const formatter = new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0, // Keep it clean for large numbers
    });

    const formattedNumber = formatter.format(converted);

    // Prefix with currency short name
    return `${currency} ${formattedNumber}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rates, formatCurrency, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};
