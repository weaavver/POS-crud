import { useEffect, useState } from 'react';
import { getProducts } from '../api/products';
import ProductCard from './ProductCard';

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-[#8f98a0] px-4 py-10">Loading products...</p>;
  }

  if (error) {
    return <p className="text-red-400 px-4 py-10">Error: {error}</p>;
  }

  if (products.length === 0) {
    return <p className="text-[#8f98a0] px-4 py-10">No products yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}