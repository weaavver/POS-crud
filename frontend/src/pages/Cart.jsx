import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, removeItem, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Your cart is empty</h1>
        <p className="text-[#8f98a0] mb-6">Browse the store and add something to your library.</p>
        <Link to="/" className="text-[#66c0f4] hover:underline">Back to store</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">Your Cart</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 bg-[#16202d] border border-[#2a3f5a] p-3"
          >
            <div className="w-24 h-14 bg-[#1b2838] overflow-hidden shrink-0">
              {item.cover_image && (
                <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">{item.title}</p>
              <p className="text-xs text-[#8f98a0]">{item.platform}</p>
            </div>
            <p className="text-[#66c0f4] font-bold">${item.price.toFixed(2)}</p>
            <button
              onClick={() => removeItem(item.id)}
              className="text-red-400 hover:text-red-300 text-sm font-medium ml-2"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-[#2a3f5a] pt-4 flex items-center justify-between">
        <p className="text-lg text-[#c7d5e0]">Total</p>
        <p className="text-2xl font-bold text-[#66c0f4]">${total.toFixed(2)}</p>
      </div>

      <button
        onClick={() => navigate('/checkout')}
        className="mt-6 w-full bg-[#66c0f4] text-[#171a21] font-semibold rounded py-3 hover:bg-[#7fd0ff] transition-colors"
      >
        Proceed to Checkout
      </button>
    </div>
  );
}