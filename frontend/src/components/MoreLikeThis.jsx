import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getProducts } from '../api/products';

export default function MoreLikeThis({ excludeId }) {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const perPage = 4;

  useEffect(() => {
    getProducts().then((all) => {
      const pool = all.filter((p) => p.id !== excludeId);
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      setItems(shuffled.slice(0, 8));
    });
  }, [excludeId]);

  if (items.length === 0) return null;

  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const visible = items.slice(page * perPage, page * perPage + perPage);

  const goPrev = () => setPage((p) => (p - 1 + totalPages) % totalPages);
  const goNext = () => setPage((p) => (p + 1) % totalPages);

  return (
    <div className="mt-8 bg-[#16202d]/90 border border-[#2a3f5a] rounded p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#8f98a0] tracking-wide uppercase">More Like This</h2>
      </div>

      <div className="relative flex items-center gap-2">
        {totalPages > 1 && (
          <button
            onClick={goPrev}
            className="text-[#c7d5e0] hover:text-white transition-colors shrink-0"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
          {visible.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/products/${item.id}`)}
              className="text-left bg-[#0e1621] border border-[#2a3f5a] rounded overflow-hidden hover:border-[#66c0f4] transition-colors"
            >
              <div className="aspect-[460/215] bg-[#1b2838]">
                {item.cover_image && (
                  <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-2">
                <p className="text-xs text-white truncate">{item.title}</p>
                <p className="text-xs text-[#66c0f4] font-semibold mt-1">
                  {item.price === 0 ? 'FREE' : `$${item.price.toFixed(2)}`}
                </p>
              </div>
            </button>
          ))}
        </div>

        {totalPages > 1 && (
          <button
            onClick={goNext}
            className="text-[#c7d5e0] hover:text-white transition-colors shrink-0"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>
    </div>
  );
}