import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('vault_cart');
    if (stored) setItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('vault_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) return prev; // digital goods — no quantity, just own it once
      return [...prev, product];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}