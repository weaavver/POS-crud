import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getProducts } from '../api/products';
import { useDeals, getDiscountedPrice } from './DealsContext';

const CartContext = createContext(null);

// The cart only remembers WHICH products are in it (their ids). Names, images
// and prices are looked up fresh every time, so an old price, or a deal that
// has since expired, can never get stuck in localStorage.
function readStoredIds() {
  try {
    const raw = JSON.parse(localStorage.getItem('vault_cart') || '[]');
    // Older versions stored whole product objects; keep just their ids.
    const ids = raw
      .map((entry) => (typeof entry === 'string' ? entry : entry?.id))
      .filter(Boolean);
    return [...new Set(ids)];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [ids, setIds] = useState(readStoredIds);
  const [catalog, setCatalog] = useState({}); // id -> current product from the server
  const [catalogReady, setCatalogReady] = useState(false);
  const [error, setError] = useState(false);
  const { deals, ready: dealsReady } = useDeals();

  useEffect(() => {
    localStorage.setItem('vault_cart', JSON.stringify(ids));
  }, [ids]);

  // Load the current product data once. Anything that was deleted from the
  // shop since it was added quietly drops out of the cart.
  useEffect(() => {
    getProducts()
      .then((list) => {
        const map = {};
        list.forEach((p) => {
          map[p.id] = p;
        });
        setCatalog(map);
        setIds((prev) => prev.filter((id) => map[id]));
      })
      .catch(() => setError(true))
      .finally(() => setCatalogReady(true));
  }, []);

  // Cart lines with the price the customer will actually pay right now.
  const items = useMemo(
    () =>
      ids
        .map((id) => catalog[id])
        .filter(Boolean)
        .map((product) => {
          const deal = getDiscountedPrice(product, deals);
          return {
            ...product,
            listPrice: product.price,
            price: deal ? deal.discountedPrice : product.price,
            discountPercent: deal ? deal.percent : null,
          };
        }),
    [ids, catalog, deals]
  );

  // Add up in whole cents so floating-point error never shows up as $9.989999.
  const total = items.reduce((sum, item) => sum + Math.round(item.price * 100), 0) / 100;

  // Still waiting on prices? (An empty cart has nothing to wait for.)
  const loading = ids.length > 0 && (!catalogReady || !dealsReady);

  const addItem = (product) => {
    // Remember the product we were just given so it shows up straight away.
    setCatalog((prev) => ({ ...prev, [product.id]: product }));
    // Digital goods: no quantity, you can only own each one once.
    setIds((prev) => (prev.includes(product.id) ? prev : [...prev, product.id]));
  };

  const removeItem = (productId) => {
    setIds((prev) => prev.filter((id) => id !== productId));
  };

  const clearCart = () => setIds([]);

  const hasItem = (productId) => ids.includes(productId);

  return (
    <CartContext.Provider
      value={{
        items,
        count: ids.length,
        addItem,
        removeItem,
        clearCart,
        hasItem,
        total,
        loading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}