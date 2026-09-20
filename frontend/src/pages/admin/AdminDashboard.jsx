import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, deleteProduct } from '../../api/products';
import { getManualDeals, setManualDeal, removeManualDeal } from '../../api/deals';
import { useAuth } from '../../context/AuthContext';
import { useDeals } from '../../context/DealsContext';
import Spinner from '../../components/Spinner';

const SALE_PERCENTS = [10, 20, 30, 40, 50, 60, 70, 80, 90];

export default function AdminDashboard() {
  const { token } = useAuth();
  const { refreshDeals } = useDeals();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = () => {
    setLoading(true);
    getProducts().then(setProducts).finally(() => setLoading(false));
  };

  // Games the admin hand-picked for the Special Offers section: { productId: percent }
  const [saleMap, setSaleMap] = useState({});
  // Percent chosen in each row's dropdown before it's saved
  const [pickedPercent, setPickedPercent] = useState({});
  const [savingSaleId, setSavingSaleId] = useState(null);
  const [saleError, setSaleError] = useState('');

  const loadSales = () => {
    return getManualDeals(token)
      .then((items) => {
        const map = {};
        items.forEach((d) => {
          map[d.product_id] = d.percent;
        });
        setSaleMap(map);
      })
      .catch((err) => setSaleError(err.message));
  };

  useEffect(() => {
    loadProducts();
    loadSales();
  }, []);

  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    setDeletingId(id);
    await deleteProduct(id, token);
    loadProducts();
    loadSales();
    refreshDeals();
    setDeletingId(null);
  };

  const handleSetSale = async (product) => {
    const percent = pickedPercent[product.id] ?? saleMap[product.id] ?? 20;
    setSaleError('');
    setSavingSaleId(product.id);
    try {
      await setManualDeal(product.id, percent, token);
      await Promise.all([loadSales(), refreshDeals()]);
    } catch (err) {
      setSaleError(err.message);
    } finally {
      setSavingSaleId(null);
    }
  };

  const handleRemoveSale = async (product) => {
    setSaleError('');
    setSavingSaleId(product.id);
    try {
      await removeManualDeal(product.id, token);
      await Promise.all([loadSales(), refreshDeals()]);
    } catch (err) {
      setSaleError(err.message);
    } finally {
      setSavingSaleId(null);
    }
  };

  const saleCount = Object.keys(saleMap).length;

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

      <p className="text-sm text-[#8f98a0] mb-4">
        {saleCount > 0
          ? `The Special Offers section shows your ${saleCount} hand-picked game${saleCount === 1 ? '' : 's'}.`
          : 'No hand-picked sales yet, so Special Offers shows 2 random daily deals. Put a game on sale below to choose them yourself.'}
      </p>

      {saleError && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 text-sm rounded px-3 py-2 mb-4">
          {saleError}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 w-full rounded skeleton" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p, i) => {
            const onSale = saleMap[p.id] !== undefined;
            const percent = pickedPercent[p.id] ?? saleMap[p.id] ?? 20;
            const savingSale = savingSaleId === p.id;
            return (
            <div
              key={p.id}
              className={
                'flex items-center justify-between bg-[#16202d] border border-[#2a3f5a] rounded px-4 py-3 fade-in-up transition-opacity duration-200 ' +
                (deletingId === p.id ? 'opacity-40' : 'opacity-100')
              }
              style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            >
              <div>
                <p className="text-white font-medium flex items-center gap-2">
                  {p.title}
                  {onSale && (
                    <span className="bg-green-500 text-[#171a21] text-xs font-bold px-2 py-0.5 rounded">
                      -{saleMap[p.id]}%
                    </span>
                  )}
                </p>
                <p className="text-xs text-[#8f98a0]">{p.type} · {p.platform} · ${p.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-4">
                {p.price > 0 && (
                  <div className="flex items-center gap-2">
                    <select
                      value={percent}
                      onChange={(e) => setPickedPercent({ ...pickedPercent, [p.id]: Number(e.target.value) })}
                      className="bg-[#1b2838] border border-[#2a3f5a] rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-[#66c0f4]"
                    >
                      {SALE_PERCENTS.map((pct) => (
                        <option key={pct} value={pct}>{pct}% off</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleSetSale(p)}
                      disabled={savingSale}
                      className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      {savingSale && <Spinner size={14} />}
                      {onSale ? 'Update sale' : 'Put on sale'}
                    </button>
                    {onSale && (
                      <button
                        onClick={() => handleRemoveSale(p)}
                        disabled={savingSale}
                        className="text-[#8f98a0] hover:text-white text-sm font-medium transition-colors"
                      >
                        Remove sale
                      </button>
                    )}
                  </div>
                )}
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
            );
          })}
        </div>
      )}
    </div>
  );
}