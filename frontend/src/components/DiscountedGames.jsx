import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../api/products';
import { useDeals, getDiscountedPrice } from '../context/DealsContext';

// How many cards fit side by side: 1 on phones, 3 on tablets and up
// (matches Tailwind's `sm` breakpoint)
const WIDE_QUERY = '(min-width: 40rem)';

function countPerView() {
  if (window.matchMedia(WIDE_QUERY).matches) return 3;
  return 1;
}

function usePerView() {
  const [perView, setPerView] = useState(countPerView);

  useEffect(() => {
    const mql = window.matchMedia(WIDE_QUERY);
    const onChange = () => setPerView(countPerView());
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return perView;
}

const SLIDE_MS = 300;

export default function DiscountedGames() {
  const { deals, ready } = useDeals();
  const [products, setProducts] = useState([]);
  // Which game is first in view. It's briefly -1 or n while sliding onto the
  // copies at either end, then jumps back to the matching real card.
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [sliding, setSliding] = useState(false); // mirrors busy.current, but reactive (for disabling controls)
  const busy = useRef(false); // ignore clicks while a slide is running
  const timer = useRef(null);
  const perView = usePerView();

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!ready) return null;
  const dealIds = Object.keys(deals);
  const dealProducts = products.filter((p) => dealIds.includes(p.id));
  if (dealProducts.length === 0) return null;

  const n = dealProducts.length;
  const canSlide = n > perView;
  const current = canSlide && index >= -1 && index <= n ? index : 0;

  const slideTo = (target) => {
    if (busy.current || target === current) return;
    busy.current = true;
    setSliding(true);
    setAnimate(true);
    setIndex(target);
    timer.current = setTimeout(() => {
      // If we slid onto a copy at either end, jump (no animation) to the real
      // card that looks identical. That's what makes the loop seamless.
      setAnimate(false);
      setIndex((i) => (i >= n ? i - n : i < 0 ? i + n : i));
      busy.current = false;
      setSliding(false);
    }, SLIDE_MS);
  };

  const goPrev = () => slideTo(current - 1);
  const goNext = () => slideTo(current + 1);

  // Track = copies of the last cards + all cards + copies of the first cards
  const slides = canSlide
    ? [
        ...dealProducts.slice(-perView).map((g) => ({ game: g, key: 'pre-' + g.id })),
        ...dealProducts.map((g) => ({ game: g, key: g.id })),
        ...dealProducts.slice(0, perView).map((g) => ({ game: g, key: 'post-' + g.id })),
      ]
    : dealProducts.map((g) => ({ game: g, key: g.id }));

  const trackPosition = current + (canSlide ? perView : 0);
  const activeDot = ((current % n) + n) % n;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      <h2 className="text-sm font-semibold text-[#8f98a0] tracking-wide uppercase mb-4">
        Special Offers
      </h2>

      <div className="relative">
        <div className="overflow-hidden">
          {/* -mx-2 + px-2 on each card gives the 16px gap without breaking the slide maths */}
          <div
            className="flex -mx-2"
            style={{
              transform: `translateX(-${trackPosition * (100 / perView)}%)`,
              transition: animate ? `transform ${SLIDE_MS}ms ease-out` : 'none',
            }}
          >
            {slides.map(({ game, key }) => {
              const { percent, discountedPrice } = getDiscountedPrice(game, deals);
              return (
                <div key={key} className="shrink-0 px-2" style={{ width: `${100 / perView}%` }}>
                  <DealCard game={game} percent={percent} discountedPrice={discountedPrice} />
                </div>
              );
            })}
          </div>
        </div>

        {canSlide && (
          <>
            <CarouselArrow direction="left" onClick={goPrev} disabled={sliding} />
            <CarouselArrow direction="right" onClick={goNext} disabled={sliding} />
          </>
        )}
      </div>

      {canSlide && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: n }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => slideTo(idx)}
              disabled={sliding}
              aria-label={'Show offer ' + (idx + 1)}
              className={
                'h-1 w-8 rounded-full transition-colors duration-300 cursor-pointer disabled:cursor-not-allowed ' +
                (idx === activeDot ? 'bg-[#66c0f4]' : 'bg-[#3a4a5c] hover:bg-[#4d6178]')
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Tall, dark, semi-transparent button with a thick chevron, sitting on the card edges
function CarouselArrow({ direction, onClick, disabled }) {
  const isLeft = direction === 'left';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={isLeft ? 'Previous offers' : 'Next offers'}
      className={
        'absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-20 ' +
        'bg-black/40 hover:bg-black/70 text-[#bfc2c5] hover:text-white transition-colors ' +
        'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-black/40 disabled:hover:text-[#bfc2c5] ' +
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
          <span className="bg-green-500 text-[#171a21] text-lg font-bold px-2.5 py-1 rounded">
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