import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CancelModal from '../components/CancelModal.jsx';
import FeedbackModal from '../components/FeedbackModal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useCustomer } from '../context/CustomerContext.jsx';
import { formatDate, formatPrice } from '../utils/format.js';

const OrderDetails = () => {
  const { id } = useParams();
  const { orders, cancelOrder, submitFeedback } = useCustomer();
  const navigate = useNavigate();
  const order = orders.find((item) => item.id === id);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [message, setMessage] = useState('');

  if (!order) return <p className="p-10 text-center">Order not found.</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <button type="button" onClick={() => navigate(-1)} className="btn-secondary mb-6">
        Back
      </button>
      {message && <p className="mb-4 rounded-2xl bg-gs-light px-4 py-3 text-sm">{message}</p>}
      <article className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <img src={order.image} alt={order.productName} className="h-56 w-full object-cover" />
        <div className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-display text-3xl">{order.productName}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-emerald-700">Order {order.id} · {formatDate(order.orderDate)}</p>
          <div className="mt-5 grid gap-2 text-sm">
            <p>Quantity: {order.quantity} {order.unit}</p>
            <p>Unit price: {formatPrice(order.unitPrice)}</p>
            <p className="font-semibold">Total: {formatPrice(order.total)}</p>
            <p>Customer: {order.customerName}</p>
            <p>Phone: {order.phone}</p>
            <p>Address: {order.address}</p>
            {order.notes && <p>Notes: {order.notes}</p>}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/invoice/${order.id}`} className="btn-primary">
              View Invoice
            </Link>
            {order.status === 'Pending' && (
              <button type="button" onClick={() => setCancelOpen(true)} className="rounded-full bg-red-50 px-5 py-2.5 text-sm font-semibold text-red-600">
                Cancel Order
              </button>
            )}
            {order.status === 'Completed' && !order.feedback && (
              <button type="button" onClick={() => setFeedbackOpen(true)} className="btn-secondary">
                Submit Feedback
              </button>
            )}
          </div>
        </div>
      </article>
      <CancelModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={() => {
          cancelOrder(order.id);
          setCancelOpen(false);
          setMessage('Order cancelled.');
        }}
      />
      <FeedbackModal
        open={feedbackOpen}
        order={order}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={({ rating, comment }) => {
          submitFeedback(order.id, rating, comment);
          setFeedbackOpen(false);
          setMessage('Feedback submitted. Thank you!');
        }}
      />
    </div>
  );
};

export default OrderDetails;
