import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:8000';

export default function OrderConfirmation() {
  const { id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL + '/orders/' + id, {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(function (res) { return res.json(); })
      .then(setOrder)
      .finally(function () { setLoading(false); });
  }, [id, token]);

  if (loading) {
    return <p className="text-[#8f98a0] px-4 py-10 max-w-2xl mx-auto">Loading...</p>;
  }

  if (!order) {
    return <p className="text-red-400 px-4 py-10 max-w-2xl mx-auto">Order not found.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-white mb-2">Thank you for your purchase!</h1>
      <p className="text-[#8f98a0] mb-6">Your order has been placed. Download your items below.</p>

      <div className="bg-[#16202d] border border-[#2a3f5a] p-4 space-y-3">
        {order.items.map(function (item, idx) {
          return (
            <div key={idx} className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{item.title}</p>
                <p className="text-xs text-[#8f98a0]">${item.price.toFixed(2)}</p>
              </div>
              <a
                href={item.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#66c0f4] text-[#171a21] text-sm font-semibold px-4 py-2 rounded hover:bg-[#7fd0ff] transition-colors"
              >
                Download
              </a>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between text-[#c7d5e0]">
        <span>Order total</span>
        <span className="font-bold text-[#66c0f4]">${order.total.toFixed(2)}</span>
      </div>

      <Link to="/" className="block text-center mt-8 text-[#66c0f4] hover:underline">
        Back to store
      </Link>
    </div>
  );
}