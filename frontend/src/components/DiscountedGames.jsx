import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../api/products';
import { useDeals, getDiscountedPrice } from '../context/DealsContext';

export default function DiscountedGames() {
  const { deals, ready } = useDeals();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  if (!ready) return null;
  const dealIds = Object.keys(deals);
  const dealProducts = products.filter((p) => dealIds.includes(p.id));
  if (dealProducts.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <h2 className="text-sm font-semibold text-[#8f98a0] tracking-wide uppercase mb-4">
        Special Offers
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {dealProducts.map((game) => {
          const { percent, discountedPrice } = getDiscountedPrice(game, deals);
          return (
            <DealCard key={game.id} game={game} percent={percent} discountedPrice={discountedPrice} />
          );
        })}
      </div>
    </div>
  );
}

function DealCard({ game, percent, discountedPrice }) {
  const navigate = useNavigate();
  return (
    <button
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
            -{percent}%
          </span>
          <div className="flex flex-col items-end">
            <span className="text-xs text-[#8f98a0] line-through">${game.price.toFixed(2)}</span>
            <span className="text-white font-bold">${discountedPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </button>
  );
}