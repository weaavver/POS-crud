import { useEffect, useState, useRef } from 'react';
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
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef(null);

  const images = [game.cover_image, ...(game.gallery_images || [])].filter(Boolean);
  const hasImage = images.length > 0;

  const startCycling = () => {
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 1500);
  };

  const stopCycling = () => {
    clearInterval(intervalRef.current);
    setActiveIndex(0);
  };

  return (
    <button
      onClick={() => navigate(`/products/${game.id}`)}
      onMouseEnter={startCycling}
      onMouseLeave={stopCycling}
      className="text-left bg-[#0e1621] border border-[#2a3f5a] overflow-hidden"
    >
      <div className="relative aspect-[460/215] bg-[#1b2838] overflow-hidden">
        {hasImage ? (
          images.map((img, idx) => (
            <img
              key={img + idx}
              src={img}
              alt={game.title}
              className={
                'absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ' +
                (idx === activeIndex ? 'opacity-100' : 'opacity-0')
              }
            />
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1b2838]">
            <div className="w-full h-full animate-pulse bg-gradient-to-br from-[#1b2838] via-[#22344a] to-[#1b2838] bg-[length:200%_200%]" />
          </div>
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