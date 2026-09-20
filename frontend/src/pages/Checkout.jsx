import { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../api/orders';

export default function Checkout() {
  const { items, total, clearCart, loading } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const orderPlaced = useRef(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <p className="text-[#8f98a0] px-4 py-10 max-w-2xl mx-auto">Loading...</p>;
  }

  if (items.length === 0) {
    // Cart is empty because we just bought everything: don't bounce to /cart
    return orderPlaced.current ? null : <Navigate to="/cart" replace />;
  }

  const handlePlaceOrder = async () => {
    setError('');
    setPlacing(true);
    try {
      const order = await createOrder(items, token);
      orderPlaced.current = true;
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">Checkout</h1>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded px-3 py-2 mb-4">
          {error}
        </div>
      )}

      <div className="bg-[#16202d] border border-[#2a3f5a] p-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span className="text-[#c7d5e0]">{item.title}</span>
            <span className="text-white">
              {item.discountPercent && (
                <span className="text-xs text-[#8f98a0] line-through mr-2">${item.listPrice.toFixed(2)}</span>
              )}
              ${item.price.toFixed(2)}
            </span>
          </div>
        ))}
        <div className="border-t border-[#2a3f5a] pt-3 flex justify-between font-bold">
          <span className="text-white">Total</span>
          <span className="text-white">${total.toFixed(2)}</span>
        </div>
      </div>

      <p className="text-xs text-[#8f98a0] mt-4">
        This is a prototype checkout — no real payment is processed. Placing this order will
        grant you instant access to the download links.
      </p>

      <button
        onClick={handlePlaceOrder}
        disabled={placing}
        className="mt-6 w-full bg-[#66c0f4] text-[#171a21] font-semibold rounded py-3 hover:bg-[#7fd0ff] transition-colors disabled:opacity-50"
      >
        {placing ? 'Placing Order...' : 'Place Order'}
      </button>
    </div>
  );
}