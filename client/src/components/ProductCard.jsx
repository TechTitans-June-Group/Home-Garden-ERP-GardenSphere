import { Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDate, formatPrice } from '../utils/format.js';
import { useCustomer } from '../context/CustomerContext.jsx';

const ProductCard = ({ product }) => {
  const { user, isWishlisted, toggleWishlist } = useCustomer();
  const navigate = useNavigate();
  const liked = isWishlisted?.(product.id);

  const toggleFav = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    toggleWishlist(product.id);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-card">
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(event) => {
            event.currentTarget.src = '/login-garden.jpg';
          }}
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gs-deep">
          {product.category}
        </span>
        <button
          type="button"
          onClick={toggleFav}
          className={`absolute right-12 top-3 grid h-9 w-9 place-items-center rounded-full ${
            liked ? 'bg-rose-500 text-white' : 'bg-white/90 text-rose-500'
          }`}
          aria-label={liked ? 'Remove from favourites' : 'Save to favourites'}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
        </button>
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold ${
            product.available ? 'bg-gs-lime text-gs-deep' : 'bg-red-500 text-white'
          }`}
        >
          {product.available ? 'Available' : 'Out of stock'}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl text-gs-deep">{product.name}</h3>
          <p className="font-semibold text-gs-primary">
            {formatPrice(product.price)}
            <span className="text-xs font-medium text-emerald-600"> / {product.unit}</span>
          </p>
        </div>
        <p className="mt-2 text-sm text-emerald-800/80">
          {product.availableQuantity} {product.unit} left · {product.grade}
        </p>
        <p className="mt-1 text-xs text-emerald-700">Harvested {formatDate(product.harvestDate)}</p>
        <div className="mt-auto flex gap-2 pt-4">
          <Link to={`/shop/${product.id}`} className="btn-secondary flex-1 !py-2 text-center">
            View Details
          </Link>
          <Link
            to={product.available ? `/order/${product.id}` : '#'}
            className={`flex-1 rounded-full px-4 py-2 text-center text-sm font-semibold text-white ${
              product.available ? 'bg-gs-primary hover:bg-gs-deep' : 'pointer-events-none bg-slate-300'
            }`}
          >
            Order Now
          </Link>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
