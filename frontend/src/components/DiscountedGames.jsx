import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../api/products';
import { useDeals, getDiscountedPrice } from '../context/DealsContext';

// How many cards fit side by side (matches Tailwind's `sm` breakpoint)
function usePerView() {
  const query = '(min-width: 40rem)';
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setWide(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return wide ? 2 : 1;
}

export default function DiscountedGames() {
  const { deals, ready } = useDeals();
  const [products, setProducts] = useState([]);
  const [offset, setOffset] = useState(0);
  const perView = usePerView();

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  if (!ready) return null;
  const dealIds = Object.keys(deals);
  const dealProducts = products.filter((p) => dealIds.includes(p.id));
  if (dealProducts.length === 0) return null;

  // The row slides one card at a time. The last position always still shows a
  // full row of cards, so there's never an empty half when the count is odd.
  const maxOffset = Math.max(0, dealProducts.length - perView);
  const current = Math.min(offset, maxOffset);
  const canSlide = maxOffset > 0;

  // At either end the arrow rewinds to the other end
  const goPrev = () => setOffset(current === 0 ? maxOffset : current - 1);
  const goNext = () => setOffset(current >= maxOffset ? 0 : current + 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <h2 className="text-sm font-semibold text-[#8f98a0] tracking-wide uppercase mb-4">
        Special Offers
      </h2>

      <div className="relative">
        <div className="overflow-hidden">
          {/* -mx-2 + px-2 on each card gives the 16px gap without breaking the slide maths */}
          <div
            className="flex -mx-2 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${current * (100 / perView)}%)` }}
          >
            {dealProducts.map((game) => {
              const { percent, discountedPrice } = getDiscountedPrice(game, deals);
              return (
                <div key={game.id} className="w-full sm:w-1/2 shrink-0 px-2">
                  <DealCard game={game} percent={percent} discountedPrice={discountedPrice} />
                </div>
              );
            })}
          </div>
        </div>

        {canSlide && (
          <>
            <CarouselArrow direction="left" onClick={goPrev} />
            <CarouselArrow direction="right" onClick={goNext} />
          </>
        )}
      </div>

      {canSlide && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: maxOffset + 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setOffset(idx)}
              aria-label={'Show offers from ' + (idx + 1)}
              className={
                'h-1 w-8 rounded-full transition-colors duration-300 ' +
                (idx === current ? 'bg-[#66c0f4]' : 'bg-[#3a4a5c] hover:bg-[#4d6178]')
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
      className="block w-full text-left bg-[#0e1621] border border-[#2a3f5a] overflow-hidden"
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