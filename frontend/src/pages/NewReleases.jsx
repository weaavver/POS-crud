import ProductGrid from '../components/ProductGrid';

export default function NewReleases() {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <h1 className="text-3xl font-bold text-white">New Releases</h1>
        <p className="mt-2 text-[#8f98a0]">The latest additions to the Vault.</p>
      </div>
      {/* TODO: once products have a release/created date, sort or filter by it here.
          For now this shows the same catalog as the shop. */}
      <ProductGrid />
    </>
  );
}