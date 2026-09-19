import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../api/orders';
import { useAuth } from '../context/AuthContext';

export default function OrderHistory() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyOrders(token)
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-[#8f98a0] px-4 py-10 max-w-3xl mx-auto">Loading...</p>;
  if (error) return <p className="text-red-400 px-4 py-10 max-w-3xl mx-auto">{error}</p>;

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-2">No orders yet</h1>
        <p className="text-[#8f98a0] mb-6">Your purchases will show up here.</p>
        <Link to="/" className="text-[#66c0f4] hover:underline">Back to store</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-6">Your Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-[#16202d] border border-[#2a3f5a] p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-[#8f98a0]">
                {new Date(order.created_at).toLocaleString()}
              </p>
              <p className="text-[#66c0f4] font-bold">${order.total.toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-[#c7d5e0]">{item.title}</span>
                  <a
                    href={item.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#66c0f4] hover:underline"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}