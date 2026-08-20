import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, X } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { products } from '../data/mockData.js';

const Shop = () => {
  const [params] = useSearchParams();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(params.get('category') || 'All');
  const [cropType, setCropType] = useState('All');
  const [availability, setAvailability] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [harvestDate, setHarvestDate] = useState('');
  const [sort, setSort] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const nextCategory = params.get('category');
    if (nextCategory) setCategory(nextCategory);
  }, [params]);

  const filtered = useMemo(() => {
    let list = products.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );

    if (category !== 'All') list = list.filter((item) => item.category === category);
    if (cropType !== 'All') list = list.filter((item) => item.cropType === cropType);
    if (availability === 'Available') list = list.filter((item) => item.available);
    if (availability === 'Out of stock') list = list.filter((item) => !item.available);
    if (harvestDate) list = list.filter((item) => item.harvestDate === harvestDate);
    if (priceRange === '0-200') list = list.filter((item) => item.price <= 200);
    if (priceRange === '201-400') list = list.filter((item) => item.price > 200 && item.price <= 400);
    if (priceRange === '401+') list = list.filter((item) => item.price > 400);

    const sorted = [...list];
    if (sort === 'newest') sorted.sort((a, b) => b.harvestDate.localeCompare(a.harvestDate));
    if (sort === 'low') sorted.sort((a, b) => a.price - b.price);
    if (sort === 'high') sorted.sort((a, b) => b.price - a.price);
    if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [query, category, cropType, availability, priceRange, harvestDate, sort]);

  const clearFilters = () => {
    setQuery('');
    setCategory('All');
    setCropType('All');
    setAvailability('All');
    setPriceRange('All');
    setHarvestDate('');
    setSort('newest');
  };

  const filters = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <label className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Crop Type
        <select className="input-field mt-1" value={cropType} onChange={(e) => setCropType(e.target.value)}>
          <option>All</option>
          <option>Fruiting</option>
          <option>Root</option>
          <option>Leafy</option>
          <option>Herb</option>
          <option>Flower</option>
          <option>Plant</option>
        </select>
      </label>
      <label className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Category
        <select className="input-field mt-1" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option>All</option>
          <option>Vegetables</option>
          <option>Fruits</option>
          <option>Herbs</option>
          <option>Flowers</option>
          <option>Plants</option>
        </select>
      </label>
      <label className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Price Range
        <select className="input-field mt-1" value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
          <option value="All">All prices</option>
          <option value="0-200">Rs. 0 – 200</option>
          <option value="201-400">Rs. 201 – 400</option>
          <option value="401+">Rs. 401+</option>
        </select>
      </label>
      <label className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Availability
        <select className="input-field mt-1" value={availability} onChange={(e) => setAvailability(e.target.value)}>
          <option>All</option>
          <option>Available</option>
          <option>Out of stock</option>
        </select>
      </label>
      <label className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Harvest Date
        <input type="date" className="input-field mt-1" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} />
      </label>
      <label className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
        Sort
        <select className="input-field mt-1" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Newest Harvest</option>
          <option value="low">Price Low to High</option>
          <option value="high">Price High to Low</option>
          <option value="name">Name A–Z</option>
        </select>
      </label>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <div className="overflow-hidden rounded-[2rem] bg-[url('/home-veg.jpg')] bg-cover bg-center">
        <div className="bg-gs-deep/70 px-8 py-14 text-white">
          <h1 className="font-display text-4xl">Shop Fresh Harvest</h1>
          <p className="mt-2 max-w-xl text-emerald-50">Vegetables, fruits, herbs, flowers, and plants from GardenSphere beds.</p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-emerald-400" size={18} />
            <input
              className="input-field pl-11"
              placeholder="Search products by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="button" className="btn-secondary lg:hidden" onClick={() => setShowFilters((prev) => !prev)}>
            <Filter size={16} /> Filters
          </button>
          <button type="button" className="btn-secondary" onClick={clearFilters}>
            <X size={16} /> Clear Filters
          </button>
        </div>
        <div className="mt-4 hidden lg:block">{filters}</div>
        {showFilters && <div className="mt-4 lg:hidden">{filters}</div>}
      </div>

      <p className="mt-6 text-sm text-emerald-800">{filtered.length} products found</p>
      <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Shop;
