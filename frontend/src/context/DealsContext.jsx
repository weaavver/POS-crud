import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const DealsContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function DealsProvider({ children }) {
  const [deals, setDeals] = useState({});
  const [ready, setReady] = useState(false);

  // Also called by the admin dashboard after it changes or deletes something,
  // so the shop shows the new deals without a page reload.
  const refreshDeals = useCallback(() => {
    return fetch(`${API_URL}/deals/`)
      .then((res) => res.json())
      .then((items) => {
        const map = {};
        items.forEach((item) => {
          map[item.product_id] = item.percent;
        });
        setDeals(map);
      })
      .catch(() => setDeals({}))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    refreshDeals();
  }, [refreshDeals]);

  return (
    <DealsContext.Provider value={{ deals, ready, refreshDeals }}>
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
  // Work in whole cents and round half up, exactly like the backend's
  // apply_discount(), so the price shown here is the price that gets charged.
  const cents = Math.round(product.price * 100);
  const discountedCents = Math.round((cents * (100 - percent)) / 100);
  return {
    percent,
    discountedPrice: discountedCents / 100,
  };
}