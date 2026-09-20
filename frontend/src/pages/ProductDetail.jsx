import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getProduct } from '../api/products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import MoreLikeThis from '../components/MoreLikeThis';
import { useDeals, getDiscountedPrice } from '../context/DealsContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [fading, setFading] = useState(false);
  const [theaterOpen, setTheaterOpen] = useState(false);
  const { addItem, items } = useCart();
  const { deals } = useDeals();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getProduct(id)
      .then((data) => {
        setProduct(data);
        setActiveIndex(0);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-[#8f98a0] px-4 py-10 max-w-5xl mx-auto">Loading...</p>;
  if (error) return <p className="text-red-400 px-4 py-10 max-w-5xl mx-auto">{error}</p>;
  if (!product) return null;

  const deal = getDiscountedPrice(product, deals);
  const finalPrice = deal ? deal.discountedPrice : product.price;

  const inCart = items.some((i) => i.id === product.id);

  const handleAddToCart = () => {
    if (!user) {
      // Not signed in: go to login, and come back to this product afterwards.
      navigate('/login', { state: { from: location } });
      return;
    }
    addItem({ ...product, price: finalPrice });
  };
  const allImages = (product.gallery_images || []).filter(Boolean);
  const activeImage = allImages[activeIndex] || product.cover_image;

  const changeImage = (newIndexFn) => {
    setFading(true);
    setTimeout(() => {
      setActiveIndex(newIndexFn);
      setFading(false);
    }, 150);
  };

  const goPrev = () => changeImage((prev) => (prev - 1 + allImages.length) % allImages.length);
  const goNext = () => changeImage((prev) => (prev + 1) % allImages.length);

  return (
    <div className="overflow-hidden">
      {/* Hero section: backdrop is sized to exactly match this block's height */}
      <div className="relative">
        {product.cover_image && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 blur-md scale-110"
            style={{ backgroundImage: `url(${product.cover_image})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1b2838]/60 to-[#1b2838]" />

        <div className="relative max-w-6xl mx-auto px-4 pt-10 pb-12">
          <Link to="/" className="text-sm text-[#66c0f4] hover:underline">&larr; Back to store</Link>

          <h1 className="text-3xl font-bold text-white mt-4">{product.title}</h1>
          <p className="text-[#8f98a0] mt-1">{product.platform}</p>

          <div className="grid md:grid-cols-[1fr_320px] gap-6 mt-6">
            <div>
              <div
                className="relative group aspect-video bg-[#0e1621] border border-[#2a3f5a] rounded overflow-hidden flex items-center justify-center cursor-pointer"
                onClick={() => allImages.length > 0 && setTheaterOpen(true)}
              >
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={product.title}
                    className={
                      'w-full h-full object-cover transition-opacity duration-150 ' +
                      (fading ? 'opacity-0' : 'opacity-100')
                    }
                  />
                ) : (
                  <div className="w-full h-full animate-pulse bg-gradient-to-br from-[#1b2838] via-[#22344a] to-[#1b2838]" />
                )}

                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); goPrev(); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); goNext(); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => changeImage(() => idx)}
                      className={
                        'w-24 h-14 rounded overflow-hidden border-2 shrink-0 ' +
                        (activeIndex === idx ? 'border-[#66c0f4]' : 'border-transparent opacity-70 hover:opacity-100')
                      }
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#16202d]/90 border border-[#2a3f5a] rounded p-5 h-fit">
              {product.cover_image && (
                <img
                  src={product.cover_image}
                  alt={product.title}
                  className="w-full rounded mb-4 aspect-[460/215] object-cover"
                />
              )}

              {deal && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-green-500 text-[#171a21] text-xs font-bold px-2 py-1 rounded">
                    -{deal.percent}%
                  </span>
                  <span className="text-sm text-[#8f98a0] line-through">${product.price.toFixed(2)}</span>
                </div>
              )}
              <p className="text-3xl font-bold text-white">${finalPrice.toFixed(2)}</p>

              <button
                onClick={handleAddToCart}
                disabled={inCart}
                className="mt-4 w-full bg-[#66c0f4] text-[#171a21] font-semibold rounded py-3 hover:bg-[#7fd0ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inCart ? 'Already in Cart' : 'Add to Cart'}
              </button>

              <div className="mt-5 pt-4 border-t border-[#2a3f5a] text-sm text-[#8f98a0] space-y-2">
                <div className="flex justify-between">
                  <span>Platform</span>
                  <span className="text-[#c7d5e0]">{product.platform}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Everything below sits on the plain page background — no backdrop here */}
      <div className="max-w-6xl mx-auto px-4 pb-10">
        <div className="bg-[#16202d]/90 border border-[#2a3f5a] rounded p-5">
          <h2 className="text-lg font-semibold text-white mb-2">About this game</h2>
          <p className="text-[#c7d5e0] leading-relaxed whitespace-pre-line">{product.description}</p>

          {product.system_requirements && (
            <div className="mt-6 border-t border-[#2a3f5a] pt-5">
              <h2 className="text-lg font-semibold text-white mb-3">System Requirements</h2>
              <ul className="text-sm text-[#c7d5e0] space-y-1">
                {product.system_requirements.os && (
                  <li><span className="text-[#8f98a0]">OS:</span> {product.system_requirements.os}</li>
                )}
                {product.system_requirements.processor && (
                  <li><span className="text-[#8f98a0]">Processor:</span> {product.system_requirements.processor}</li>
                )}
                {product.system_requirements.memory && (
                  <li><span className="text-[#8f98a0]">Memory:</span> {product.system_requirements.memory}</li>
                )}
                {product.system_requirements.graphics && (
                  <li><span className="text-[#8f98a0]">Graphics:</span> {product.system_requirements.graphics}</li>
                )}
                {product.system_requirements.directx && (
                  <li><span className="text-[#8f98a0]">DirectX:</span> {product.system_requirements.directx}</li>
                )}
                {product.system_requirements.storage && (
                  <li><span className="text-[#8f98a0]">Storage:</span> {product.system_requirements.storage}</li>
                )}
              </ul>
            </div>
          )}
        </div>

        <MoreLikeThis excludeId={product.id} />
      </div>

      {theaterOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setTheaterOpen(false)}
        >
          <button
            onClick={() => setTheaterOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-[#66c0f4] transition-colors"
          >
            <X size={32} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
          >
            <ChevronLeft size={32} />
          </button>

          <img
            src={activeImage}
            alt={product.title}
            className={
              'max-w-[90vw] max-h-[85vh] object-contain transition-opacity duration-150 ' +
              (fading ? 'opacity-0' : 'opacity-100')
            }
            onClick={(e) => e.stopPropagation()}
          />

          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </div>
  );
}