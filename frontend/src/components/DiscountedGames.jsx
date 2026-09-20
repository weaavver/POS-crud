import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../api/products';
import { useDeals, getDiscountedPrice } from '../context/DealsContext';

const PER_PAGE = 2;

export default function DiscountedGames() {
  const { deals, ready } = useDeals();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  if (!ready) return null;
  const dealIds = Object.keys(deals);
  const dealProducts = products.filter((p) => dealIds.includes(p.id));
  if (dealProducts.length === 0) return null;

  const totalPages = Math.ceil(dealProducts.length / PER_PAGE);
  // If games were removed from sale while on a later page, fall back to the last one
  const currentPage = Math.min(page, totalPages - 1);
  const visible = dealProducts.slice(currentPage * PER_PAGE, currentPage * PER_PAGE + PER_PAGE);

  const changePage = (newPage) => {
    setFading(true);
    setTimeout(() => {
      setPage(newPage);
      setFading(false);
    }, 150);
  };

  const goPrev = () => changePage((currentPage - 1 + totalPages) % totalPages);
  const goNext = () => changePage((currentPage + 1) % totalPages);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <h2 className="text-sm font-semibold text-[#8f98a0] tracking-wide uppercase mb-4">
        Special Offers
      </h2>

      <div className="relative">
        <div
          className={
            'grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity duration-150 ' +
            (fading ? 'opacity-0' : 'opacity-100')
          }
        >
          {visible.map((game) => {
            const { percent, discountedPrice } = getDiscountedPrice(game, deals);
            return (
              <DealCard key={game.id} game={game} percent={percent} discountedPrice={discountedPrice} />
            );
          })}
        </div>

        {totalPages > 1 && (
          <>
            <CarouselArrow direction="left" onClick={goPrev} />
            <CarouselArrow direction="right" onClick={goNext} />
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => changePage(idx)}
              aria-label={'Offers page ' + (idx + 1)}
              className={
                'h-1 w-8 rounded-full transition-colors duration-300 ' +
                (idx === currentPage ? 'bg-[#66c0f4]' : 'bg-[#3a4a5c] hover:bg-[#4d6178]')
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Tall, dark, semi-transparent button with a thick chevron, sitting on the card edges
function CarouselArrow({ direction, onClick }) {
  const isLeft = direction === 'left';
  return (
    <button
      onClick={onClick}
      aria-label={isLeft ? 'Previous offers' : 'Next offers'}
      className={
        'absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-20 ' +
        'bg-black/40 hover:bg-black/70 text-[#bfc2c5] hover:text-white transition-colors ' +
        (isLeft ? 'left-0' : 'right-0')
      }
    >
      <svg
        width="16"
        height="32"
        viewBox="0 0 16 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="square"
        aria-hidden="true"
        className={isLeft ? '' : 'rotate-180'}
      >
        <polyline points="14,2 2,16 14,30" />
      </svg>
    </button>
  );
}

function DealCard({ game, percent, discountedPrice }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

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
        <div className="flex items-center gap-3 shrink-0">
          <span className="bg-green-500 text-[#171a21] text-xl font-bold px-3 py-1.5 rounded">
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