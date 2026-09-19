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
  const inCart = items.some((i) => i.id === product?.id);   

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

  const allImages = [product.cover_image, ...product.gallery_images].filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link to="/" className="text-sm text-[#66c0f4] hover:underline">&larr; Back to store</Link>

      <div className="grid md:grid-cols-2 gap-8 mt-4">
        {/* Image gallery */}
        <div>
          <div className="aspect-video bg-[#16202d] border border-[#2a3f5a] rounded-lg overflow-hidden flex items-center justify-center">
            {activeImage ? (
              <img src={activeImage} alt={product.title} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full animate-pulse bg-gradient-to-br from-[#1b2838] via-[#22344a] to-[#1b2838]" />
            )}
          </div>

          {allImages.length > 1 && (
            <div className="flex gap-2 mt-3">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-14 rounded overflow-hidden border-2 ${
                    activeImage === img ? 'border-[#66c0f4]' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain bg-[#16202d]" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="inline-block bg-[#171a21] text-[#66c0f4] text-xs font-semibold px-2 py-1 rounded uppercase tracking-wide mb-2">
            {product.type}
          </span>
          <h1 className="text-3xl font-bold text-white">{product.title}</h1>
          <p className="text-[#8f98a0] mt-1">{product.platform}</p>

          <p className="text-3xl font-bold text-[#66c0f4] mt-6">${product.price.toFixed(2)}</p>
<button
  onClick={() => addItem(product)}
  disabled={inCart}
  className="mt-4 w-full bg-[#66c0f4] text-[#171a21] font-semibold rounded py-3 hover:bg-[#7fd0ff] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
  {inCart ? 'Already in Cart' : 'Add to Cart'}
</button>

          <div className="mt-8">
            <h2 className="text-lg font-semibold text-white mb-2">About this {product.type}</h2>
            <p className="text-[#c7d5e0] leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {product.system_requirements && (
            <div className="mt-8 border-t border-[#2a3f5a] pt-6">
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
    </div>
  );
}