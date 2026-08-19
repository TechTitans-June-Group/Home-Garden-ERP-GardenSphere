import { useState } from 'react';
import { Link } from 'react-router-dom';
import CancelModal from '../components/CancelModal.jsx';
import FeedbackModal from '../components/FeedbackModal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useCustomer } from '../context/CustomerContext.jsx';
import { formatDate, formatPrice } from '../utils/format.js';

const MyOrders = () => {
  const { orders, cancelOrder, submitFeedback } = useCustomer();
  const [cancelId, setCancelId] = useState(null);
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [message, setMessage] = useState('');

  const active = orders.filter((order) => order.status === 'Pending' || order.status === 'Confirmed');

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">My Orders</h1>
          <p className="mt-2 text-emerald-800">Track pending and confirmed harvest orders.</p>
        </div>
        <Link to="/history" className="btn-secondary">
          Order History
        </Link>
      </div>

      {message && <p className="mt-4 rounded-2xl bg-gs-light px-4 py-3 text-sm text-gs-deep">{message}</p>}

      <div className="mt-8 grid gap-5">
        {active.length === 0 && <p className="rounded-3xl bg-white p-8 text-center">No active orders yet.</p>}
        {active.map((order) => (
          <article key={order.id} className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm md:grid-cols-[8rem_1fr_auto]">
            <img src={order.image} alt={order.productName} className="h-28 w-full rounded-2xl object-cover" />
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-2xl">{order.productName}</h2>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-1 text-sm text-emerald-700">Order {order.id} · {formatDate(order.orderDate)}</p>
              <p className="mt-2 text-sm">Qty {order.quantity} {order.unit} · {formatPrice(order.total)}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Link to={`/orders/${order.id}`} className="btn-secondary !py-2">
                View Details
              </Link>
              {order.status === 'Pending' && (
                <button type="button" onClick={() => setCancelId(order.id)} className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">
                  Cancel Order
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      <CancelModal
        open={Boolean(cancelId)}
        onClose={() => setCancelId(null)}
        onConfirm={() => {
          cancelOrder(cancelId);
          setCancelId(null);
          setMessage('Order cancelled.');
        }}
      />
      <FeedbackModal
        open={Boolean(feedbackOrder)}
        onClose={() => setFeedbackOrder(null)}
        order={feedbackOrder}
        onSubmit={({ rating, comment }) => {
          submitFeedback(feedbackOrder.id, rating, comment);
          setFeedbackOrder(null);
          setMessage('Feedback submitted. Thank you!');
        }}
      />
    </div>
  );
};

export default MyOrders;
