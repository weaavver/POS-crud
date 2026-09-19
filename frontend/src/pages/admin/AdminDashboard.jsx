import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../api/products';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = () => {
    setLoading(true);
    getProducts().then(setProducts).finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await deleteProduct(id, token);
    loadProducts();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <Link
          to="/admin/add-product"
          className="bg-[#66c0f4] text-[#171a21] font-semibold rounded px-4 py-2 hover:bg-[#7fd0ff] transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {loading ? (
        <p className="text-[#8f98a0]">Loading...</p>
      ) : (
        <div className="space-y-2">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between bg-[#16202d] border border-[#2a3f5a] rounded px-4 py-3"
            >
              <div>
                <p className="text-white font-medium">{p.title}</p>
                <p className="text-xs text-[#8f98a0]">{p.type} · {p.platform} · ${p.price.toFixed(2)}</p>
              </div>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-red-400 hover:text-red-300 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}