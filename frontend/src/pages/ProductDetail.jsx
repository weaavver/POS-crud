import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct } from '../api/products';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(null);
  const { addItem, items } = useCart();

  useEffect(() => {
    getProduct(id)
      .then((data) => {
        setProduct(data);
        setActiveImage(data.cover_image);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-[#8f98a0] px-4 py-10 max-w-5xl mx-auto">Loading...</p>;
  if (error) return <p className="text-red-400 px-4 py-10 max-w-5xl mx-auto">{error}</p>;
  if (!product) return null;

  const inCart = items.some((i) => i.id === product.id);
  const allImages = [product.cover_image, ...(product.gallery_images || [])].filter(Boolean);

  return (
    <div className="relative">
      {/* Blurred cover backdrop */}
      {product.cover_image && (
        <div
          className="absolute inset-0 h-[600px] bg-cover bg-center opacity-25 blur-md scale-110"
          style={{ backgroundImage: `url(${product.cover_image})` }}
        />
      )}
      <div className="absolute inset-0 h-[600px] bg-gradient-to-b from-transparent via-[#1b2838]/70 to-[#1b2838]" />

      <div className="relative max-w-6xl mx-auto px-4 py-10">
        <Link to="/" className="text-sm text-[#66c0f4] hover:underline">&larr; Back to store</Link>

        <h1 className="text-3xl font-bold text-white mt-4">{product.title}</h1>
        <p className="text-[#8f98a0] mt-1">{product.platform}</p>

        <div className="grid md:grid-cols-[1fr_320px] gap-6 mt-6">
          {/* Main gallery — dominant focus */}
          <div>
            <div className="aspect-video bg-[#0e1621] border border-[#2a3f5a] rounded overflow-hidden flex items-center justify-center">
              {activeImage ? (
                <img src={activeImage} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full animate-pulse bg-gradient-to-br from-[#1b2838] via-[#22344a] to-[#1b2838]" />
              )}
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={
                      'w-24 h-14 rounded overflow-hidden border-2 shrink-0 ' +
                      (activeImage === img ? 'border-[#66c0f4]' : 'border-transparent opacity-70 hover:opacity-100')
                    }
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            <div className="mt-8 bg-[#16202d]/90 border border-[#2a3f5a] rounded p-5">
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
          </div>

          {/* Side info panel — Steam-style purchase box */}
          <div className="bg-[#16202d]/90 border border-[#2a3f5a] rounded p-5 h-fit">
            {product.cover_image && (
              <img
                src={product.cover_image}
                alt={product.title}
                className="w-full rounded mb-4 aspect-[460/215] object-cover"
              />
            )}

            <p className="text-3xl font-bold text-[#66c0f4]">${product.price.toFixed(2)}</p>

            <button
              onClick={() => addItem(product)}
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
  );
}