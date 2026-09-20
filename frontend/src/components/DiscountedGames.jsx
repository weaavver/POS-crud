import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../api/products';

const DISCOUNT_PERCENT = 10;

export default function DiscountedGames() {
  const [deals, setDeals] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getProducts().then((all) => {
      const eligible = all.filter((p) => p.price > 0);
      const shuffled = [...eligible].sort(() => Math.random() - 0.5);
      setDeals(shuffled.slice(0, 2));
    });
  }, []);

  if (deals.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <h2 className="text-sm font-semibold text-[#8f98a0] tracking-wide uppercase mb-4">
        Special Offers
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {deals.map((game) => {
          const discounted = game.price * (1 - DISCOUNT_PERCENT / 100);
          return (
            <button
              key={game.id}
              onClick={() => navigate(`/products/${game.id}`)}
              className="text-left bg-[#0e1621] border border-[#2a3f5a] hover:border-[#66c0f4] transition-colors overflow-hidden"
            >
              <div className="aspect-[460/215] bg-[#1b2838]">
                {game.cover_image && (
                  <img src={game.cover_image} alt={game.title} className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-3 flex items-center justify-between">
                <p className="text-sm text-white font-medium truncate pr-2">{game.title}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="bg-green-500 text-[#171a21] text-xs font-bold px-2 py-1 rounded">
                    -{DISCOUNT_PERCENT}%
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-[#8f98a0] line-through">
                      ${game.price.toFixed(2)}
                    </span>
                    <span className="text-white font-bold">
                      ${discounted.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}