import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard.jsx';
import { useCustomer } from '../context/CustomerContext.jsx';

const Wishlist = () => {
  const { user, wishlistProducts } = useCustomer();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-4xl">Favourite harvests</h1>
      <p className="mt-2 text-emerald-800">Crops you saved from the shop.</p>
      {!user ? (
        <p className="mt-8 rounded-3xl bg-white p-8 text-center">
          <Link to="/login" className="font-semibold text-gs-primary">Log in</Link> to keep a wishlist.
        </p>
      ) : wishlistProducts.length === 0 ? (
        <p className="mt-8 rounded-3xl bg-white p-8 text-center">
          No favourites yet. Tap the heart on a shop item.{' '}
          <Link to="/shop" className="font-semibold text-gs-primary">Browse the shop</Link>
        </p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      <p className="mt-6 inline-flex items-center gap-2 text-sm text-emerald-700">
        <Heart size={14} /> Saved items stay on this device with your customer account.
      </p>
    </div>
  );
};

export default Wishlist;
