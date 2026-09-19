import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../api/products';
import { useAuth } from '../../context/AuthContext';
import Spinner from '../../components/Spinner';

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

  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    setDeletingId(id);
    await deleteProduct(id, token);
    loadProducts();
    setDeletingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <Link
          to="/admin/add-product"
          className="bg-[#66c0f4] text-[#171a21] font-semibold rounded px-4 py-2 hover:bg-[#7fd0ff] active:scale-[0.97] transition-all"
        >
          + Add Product
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 w-full rounded skeleton" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p, i) => (
            <div
              key={p.id}
              className={
                'flex items-center justify-between bg-[#16202d] border border-[#2a3f5a] rounded px-4 py-3 fade-in-up transition-opacity duration-200 ' +
                (deletingId === p.id ? 'opacity-40' : 'opacity-100')
              }
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <div>
                <p className="text-white font-medium">{p.title}</p>
                <p className="text-xs text-[#8f98a0]">{p.type} · {p.platform} · ${p.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  to={`/admin/edit-product/${p.id}`}
                  className="text-[#66c0f4] hover:text-[#7fd0ff] text-sm font-medium transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {deletingId === p.id && <Spinner size={14} />}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}