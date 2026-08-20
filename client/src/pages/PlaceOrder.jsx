import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { products } from '../data/mockData.js';
import { useCustomer } from '../context/CustomerContext.jsx';
import { formatPrice } from '../utils/format.js';

const PlaceOrder = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user, placeOrder } = useCustomer();
  const product = products.find((item) => item.id === Number(id));
  const [qty, setQty] = useState(Number(params.get('qty')) || 1);
  const [form, setForm] = useState({
    customerName: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    notes: '',
  });
  const [success, setSuccess] = useState(null);

  if (!product) return <p className="p-10 text-center">Product not found.</p>;

  const total = qty * product.price;

  const handleSubmit = (event) => {
    event.preventDefault();
    const order = placeOrder({
      productId: product.id,
      productName: product.name,
      image: product.image,
      quantity: qty,
      unit: product.unit,
      unitPrice: product.price,
      total,
      notes: form.notes,
      customerName: form.customerName,
      phone: form.phone,
      address: form.address,
    });
    setSuccess(order);
  };

  if (success) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto text-gs-primary" size={56} />
        <h1 className="mt-4 font-display text-4xl">Order placed successfully!</h1>
        <p className="mt-3 text-emerald-800">
          Order {success.id} for {success.productName} is now Pending.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/orders" className="btn-primary">
            View My Orders
          </Link>
          <Link to="/shop" className="btn-secondary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-2 lg:px-6">
      <article className="rounded-3xl bg-white p-6 shadow-sm">
        <img src={product.image} alt={product.name} className="h-56 w-full rounded-2xl object-cover" />
        <h1 className="mt-4 font-display text-3xl">{product.name}</h1>
        <p className="mt-2 text-emerald-800">{product.category} · {product.grade}</p>
        <div className="mt-4 grid gap-2 text-sm">
          <p>Quantity: {qty} {product.unit}</p>
          <p>Unit price: {formatPrice(product.price)}</p>
          <p className="text-lg font-semibold text-gs-primary">Total: {formatPrice(total)}</p>
        </div>
      </article>

      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl">Checkout</h2>
        <label className="mt-4 block text-sm font-medium">
          Quantity
          <input
            type="number"
            min="1"
            max={product.availableQuantity}
            className="input-field mt-1"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Customer name
          <input className="input-field mt-1" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Phone number
          <input className="input-field mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Address
          <textarea className="input-field mt-1" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Order notes
          <textarea className="input-field mt-1" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </label>
        <button type="submit" className="btn-primary mt-6 w-full">
          Place Order
        </button>
      </form>
    </div>
  );
};

export default PlaceOrder;
