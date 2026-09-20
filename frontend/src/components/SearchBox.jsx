import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getProducts } from '../api/products';
import { useDeals, getDiscountedPrice } from '../context/DealsContext';

const MAX_RESULTS = 6;

// Every word typed has to appear somewhere. Titles that START with the query
// rank first, then titles that contain it, then matches on platform/type.
export function searchProducts(products, query) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const phrase = words.join(' ');

  const ranked = [];
  for (const product of products) {
    const title = (product.title || '').toLowerCase();
    const extra = `${product.platform || ''} ${product.type || ''}`.toLowerCase();

    let rank = -1;
    if (title.startsWith(phrase)) rank = 0;
    else if (words.every((w) => title.includes(w))) rank = 1;
    else if (words.every((w) => title.includes(w) || extra.includes(w))) rank = 2;

    if (rank >= 0) ranked.push({ product, rank });
  }

  ranked.sort((a, b) => a.rank - b.rank); // stable: newest-first is kept within a rank
  return ranked.slice(0, MAX_RESULTS).map((r) => r.product);
}

// Desktop: a search icon that grows a text box out to its left, with the
// results in a dropdown underneath. Mobile (`mobile` prop): the same box, but
// always visible and full width inside the mobile menu.
export default function SearchBox({ mobile = false, onSelect }) {
  const [open, setOpen] = useState(mobile);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { deals } = useDeals();

  const results = useMemo(() => searchProducts(products, query), [products, query]);
  const showDropdown = open && query.trim() !== '';

  const closeAndClear = () => {
    if (!mobile) setOpen(false);
    setQuery('');
    setActive(0);
  };

  // Fetch the catalog each time the box opens, so results are never stale.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    getProducts()
      .then((list) => {
        if (!cancelled) setProducts(list);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Typing starts right away after clicking the icon.
  useEffect(() => {
    if (open && !mobile) inputRef.current?.focus();
  }, [open, mobile]);

  // Clicking anywhere outside the search closes it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        if (!mobile) setOpen(false);
        setQuery('');
        setActive(0);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open, mobile]);

  // Navigating anywhere (including via a result) resets the search.
  useEffect(() => {
    if (!mobile) setOpen(false);
    setQuery('');
    setActive(0);
  }, [location.pathname, mobile]);

  const goTo = (product) => {
    navigate(`/products/${product.id}`);
    closeAndClear();
    onSelect?.();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeAndClear();
      return;
    }
    if (results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      goTo(results[active] ?? results[0]);
    }
  };

  const input = (
    <input
      ref={inputRef}
      type="text"
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        setActive(0);
      }}
      onKeyDown={handleKeyDown}
      placeholder="Search the store"
      aria-label="Search the store"
      role="combobox"
      aria-expanded={showDropdown}
      autoComplete="off"
      tabIndex={open ? 0 : -1}
      className={
        mobile
          ? 'w-full bg-[#0e1621] border border-[#2a3f5a] rounded-sm pl-3 pr-10 py-2 text-sm text-white placeholder:text-[#8f98a0] focus:outline-none'
          : 'w-full h-full bg-transparent pl-3 pr-9 text-sm text-white placeholder:text-[#8f98a0] focus:outline-none'
      }
    />
  );

  const dropdown = showDropdown && (
    <div
      role="listbox"
      className={
        'absolute z-50 bg-[#16202d] border border-[#2a3f5a] rounded-sm shadow-2xl shadow-black/60 max-h-96 overflow-y-auto ' +
        (mobile ? 'left-0 right-0 top-full mt-1' : 'right-[-10px] top-full mt-3 w-80 lg:w-96')
      }
    >
      {loading && products.length === 0 ? (
        <p className="px-4 py-3 text-sm text-[#8f98a0]">Searching...</p>
      ) : failed && products.length === 0 ? (
        <p className="px-4 py-3 text-sm text-red-300">Search isn't available right now.</p>
      ) : results.length === 0 ? (
        <p className="px-4 py-3 text-sm text-[#8f98a0]">No results for “{query.trim()}”</p>
      ) : (
        results.map((product, i) => {
          const deal = getDiscountedPrice(product, deals);
          return (
            <button
              key={product.id}
              type="button"
              role="option"
              aria-selected={i === active}
              onClick={() => goTo(product)}
              onMouseEnter={() => setActive(i)}
              className={
                'w-full flex items-center gap-3 px-3 py-2 text-left cursor-pointer border-l-2 transition-colors duration-200 ease-out ' +
                (i === active ? 'bg-[#22344a] border-[#66c0f4]' : 'bg-transparent border-transparent')
              }
            >
              <div className="w-16 h-8 bg-[#1b2838] overflow-hidden shrink-0">
                {product.cover_image && (
                  <img src={product.cover_image} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{product.title}</p>
                <p className="text-xs text-[#8f98a0] truncate">{product.platform}</p>
              </div>
              <div className="text-right shrink-0">
                {deal ? (
                  <>
                    <span className="block text-xs text-[#8f98a0] line-through">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-white font-semibold">
                      ${deal.discountedPrice.toFixed(2)}
                    </span>
                  </>
                ) : product.price === 0 ? (
                  <span className="text-sm text-green-400 font-semibold">FREE</span>
                ) : (
                  <span className="text-sm text-white font-semibold">${product.price.toFixed(2)}</span>
                )}
              </div>
            </button>
          );
        })
      )}
    </div>
  );

  if (mobile) {
    return (
      <div ref={rootRef} className="relative w-full">
        <div className="relative">
          {input}
          <Search
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8f98a0] pointer-events-none"
          />
        </div>
        {dropdown}
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative flex items-center">
      {/* The box grows out to the LEFT of the icon; the icon sits inside it. */}
      <div
        className={
          'absolute right-[-10px] top-1/2 -translate-y-1/2 h-9 bg-[#0e1621] border border-[#2a3f5a] rounded-sm ' +
          'transition-[width,opacity] duration-200 ease-out ' +
          (open ? 'w-56 lg:w-72 opacity-100' : 'w-5 opacity-0 pointer-events-none')
        }
      >
        {input}
      </div>

      <button
        type="button"
        onClick={() => (open ? closeAndClear() : setOpen(true))}
        aria-label={open ? 'Close search' : 'Open search'}
        className="relative z-10 text-[#c7d5e0] hover:text-white transition-colors cursor-pointer"
      >
        <Search size={20} />
      </button>

      {dropdown}
    </div>
  );
}