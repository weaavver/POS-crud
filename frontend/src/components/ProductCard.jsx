import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef(null);

  const images = [product.cover_image, ...(product.gallery_images || [])].filter(Boolean);
  const hasImage = images.length > 0;

  const startCycling = () => {
    setIsHovering(true);
    if (images.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 2500);
  };

  const stopCycling = () => {
    setIsHovering(false);
    clearInterval(intervalRef.current);
    setActiveIndex(0);
  };

  return (
    <div
      onMouseEnter={startCycling}
      onMouseLeave={stopCycling}
      className="relative"
      style={{ zIndex: isHovering ? 20 : 1 }}
    >
      <Link
        to={`/products/${product.id}`}
        className={
          'bg-[#16202d] overflow-hidden border border-[#2a3f5a] block transition-all duration-200 ease-out ' +
          (isHovering ? 'scale-105 shadow-2xl shadow-black/60' : 'scale-100')
        }
      >
        <div className="relative aspect-[460/215] bg-[#1b2838] overflow-hidden">
          {hasImage ? (
            images.map((img, idx) => (
              <img
                key={img + idx}
                src={img}
                alt={product.title}
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

        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold text-white truncate">
            {product.title}
          </h3>
          <p className="text-xs text-[#8f98a0] mt-1">{product.platform}</p>
          <p className="text-white font-bold mt-2">${product.price.toFixed(2)}</p>
        </div>
      </Link>
    </div>
  );
}