import { Link, useParams } from 'react-router-dom';
import { Leaf, Printer } from 'lucide-react';
import StatusBadge from '../components/StatusBadge.jsx';
import { useCustomer } from '../context/CustomerContext.jsx';
import { formatDate, formatPrice } from '../utils/format.js';
import { formatDeliverySlot } from '../utils/checkout.js';

const Invoice = () => {
  const { id } = useParams();
  const { orders } = useCustomer();
  const order = orders.find((item) => item.id === id);

  if (!order) return <p className="p-10 text-center">Invoice not found.</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="no-print mb-6 flex gap-3">
        <button type="button" onClick={() => window.print()} className="btn-primary">
          <Printer size={16} /> Print Invoice
        </button>
        <Link to="/orders" className="btn-secondary">
          Back to Orders
        </Link>
      </div>

      <article id="invoice-print" className="rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex items-start justify-between border-b border-emerald-100 pb-6">
          <div className="flex items-center gap-2 text-gs-deep">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gs-deep text-white">
              <Leaf size={18} />
            </span>
            <div>
              <p className="font-display text-2xl">GardenSphere</p>
              <p className="text-xs text-emerald-700">Fresh harvest invoice</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-emerald-700">Invoice number</p>
            <p className="font-semibold">{order.id}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <p className="text-emerald-700">Customer</p>
            <p className="font-semibold">{order.customerName}</p>
            <p>{order.phone}</p>
            <p>{order.address}</p>
          </div>
          <div>
            <p className="text-emerald-700">Purchase date</p>
            <p className="font-semibold">{formatDate(order.orderDate)}</p>
            {formatDeliverySlot(order) ? (
              <p className="mt-2 text-emerald-800">Delivery {formatDeliverySlot(order)}</p>
            ) : null}
            <div className="mt-2">
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>

        <table className="mt-8 w-full text-left text-sm">
          <thead className="bg-gs-light">
            <tr>
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Qty</th>
              <th className="px-3 py-2">Unit price</th>
              <th className="px-3 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-emerald-50">
              <td className="px-3 py-3">{order.productName}</td>
              <td className="px-3 py-3">{order.quantity} {order.unit}</td>
              <td className="px-3 py-3">{formatPrice(order.unitPrice)}</td>
              <td className="px-3 py-3 font-semibold">{formatPrice(order.total)}</td>
            </tr>
          </tbody>
        </table>

        <p className="mt-8 text-right text-xl font-semibold text-gs-deep">
          Amount due: {formatPrice(order.total)}
        </p>
        <p className="mt-6 text-xs text-emerald-700">Thank you for supporting GardenSphere home-garden harvests.</p>
      </article>
    </div>
  );
};

export default Invoice;
