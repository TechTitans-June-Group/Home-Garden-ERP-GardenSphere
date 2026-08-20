import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Minus, Plus } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { products } from '../data/mockData.js';
import { formatDate, formatPrice } from '../utils/format.js';
import { useCustomer } from '../context/CustomerContext.jsx';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isWishlisted, toggleWishlist } = useCustomer();
  const product = products.find((item) => item.id === Number(id));
  const [qty, setQty] = useState(1);
  const liked = product ? isWishlisted?.(product.id) : false;

  if (!product) {
    return <p className="p-10 text-center">Product not found.</p>;
  }

  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <button type="button" onClick={() => navigate('/shop')} className="btn-secondary mb-6">
        <ArrowLeft size={16} /> Back to Shop
      </button>

      <div className="grid gap-8 lg:grid-cols-2">
        <img src={product.image} alt={product.name} className="h-[420px] w-full rounded-[2rem] object-cover shadow-card" />
        <div>
          <span className="rounded-full bg-gs-light px-3 py-1 text-sm font-semibold text-gs-primary">{product.category}</span>
          <h1 className="mt-4 font-display text-4xl">{product.name}</h1>
          <p className="mt-3 text-2xl font-semibold text-gs-primary">
            {formatPrice(product.price)} <span className="text-base text-emerald-700">/ {product.unit}</span>
          </p>
          <p className="mt-4 leading-7 text-emerald-800">{product.description}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-4">Available: {product.availableQuantity} {product.unit}</div>
            <div className="rounded-2xl bg-white p-4">Harvest: {formatDate(product.harvestDate)}</div>
            <div className="rounded-2xl bg-white p-4">Quality: {product.grade}</div>
            <div className={`rounded-2xl p-4 font-semibold ${product.available ? 'bg-gs-light text-gs-primary' : 'bg-red-50 text-red-600'}`}>
              {product.available ? 'In stock' : 'Out of stock'}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-emerald-100 bg-white">
              <button type="button" className="p-3" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-semibold">{qty}</span>
              <button
                type="button"
                className="p-3"
                onClick={() => setQty((q) => Math.min(product.availableQuantity || 1, q + 1))}
              >
                <Plus size={16} />
              </button>
            </div>
            <Link
              to={product.available ? `/order/${product.id}?qty=${qty}` : '#'}
              className={`btn-primary ${!product.available ? 'pointer-events-none opacity-50' : ''}`}
            >
              Place Order
            </Link>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  navigate('/login');
                  return;
                }
                toggleWishlist(product.id);
              }}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${
                liked ? 'bg-rose-500 text-white' : 'border border-rose-200 bg-white text-rose-600'
              }`}
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
              {liked ? 'Saved' : 'Save favourite'}
            </button>
          </div>
        </div>
      </div>

      <h2 className="mt-14 font-display text-3xl">Related Products</h2>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {related.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </div>
  );
};

export default ProductDetails;
