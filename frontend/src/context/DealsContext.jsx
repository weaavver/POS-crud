import { createContext, useContext, useEffect, useState } from 'react';
import { getProducts } from '../api/products';

const DealsContext = createContext(null);
const STORAGE_KEY = 'vault_deals_v1';
const DAY_MS = 24 * 60 * 60 * 1000;
const PERCENT_OPTIONS = [10, 20, 30, 40, 50, 60, 70];

export function DealsProvider({ children }) {
  const [deals, setDeals] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function loadDeals() {
      let stored = null;
      try {
        stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      } catch {
        stored = null;
      }

      const isValid = stored && Date.now() - stored.generatedAt < DAY_MS;

      if (isValid) {
        setDeals(stored.deals);
        setReady(true);
        return;
      }

      try {
        const products = await getProducts();
        const previousIds = stored?.dealIds || [];
        const eligible = products.filter((p) => p.price > 0 && !previousIds.includes(p.id));
        const pool = eligible.length >= 2 ? eligible : products.filter((p) => p.price > 0);
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const picks = shuffled.slice(0, 2);

        const newDeals = {};
        picks.forEach((p) => {
          newDeals[p.id] = PERCENT_OPTIONS[Math.floor(Math.random() * PERCENT_OPTIONS.length)];
        });

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            generatedAt: Date.now(),
            deals: newDeals,
            dealIds: picks.map((p) => p.id),
          })
        );
        setDeals(newDeals);
      } catch {
        setDeals({});
      } finally {
        setReady(true);
      }
    }

    loadDeals();
  }, []);

  return (
    <DealsContext.Provider value={{ deals, ready }}>
      {children}
    </DealsContext.Provider>
  );
}

export function useDeals() {
  return useContext(DealsContext);
}

export function getDiscountedPrice(product, deals) {
  const percent = deals?.[product.id];
  if (!percent) return null;
  return {
    percent,
    discountedPrice: product.price * (1 - percent / 100),
  };
}