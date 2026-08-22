import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CancelModal from '../components/CancelModal.jsx';
import FeedbackModal from '../components/FeedbackModal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useCustomer } from '../context/CustomerContext.jsx';
import { toast } from '../context/ToastContext.jsx';
import { formatDate, formatPrice } from '../utils/format.js';
import { formatDeliverySlot } from '../utils/checkout.js';
import { products } from '../data/mockData.js';

const OrderDetails = () => {
  const { id } = useParams();
  const { orders, cancelOrder, submitFeedback, refreshOrders } = useCustomer();
  const navigate = useNavigate();
  const order = orders.find((item) => item.id === id);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    refreshOrders?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
            {formatDeliverySlot(order) ? <p>Delivery: {formatDeliverySlot(order)}</p> : null}
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={`/invoice/${order.id}`} className="btn-primary">
              View Invoice
            </Link>
            {(order.productId || products.find((item) => item.name === order.productName)) && (
              <Link
                to={`/order/${order.productId || products.find((item) => item.name === order.productName)?.id}?qty=${order.quantity || 1}`}
                className="btn-secondary"
              >
                Order again
              </Link>
            )}
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
        onConfirm={async () => {
          try {
            await cancelOrder(order.id);
            setCancelOpen(false);
            setMessage('Order cancelled.');
            toast.success('Order cancelled', `${order.id} was cancelled.`);
          } catch (err) {
            const text = err.message || 'Could not cancel this order.';
            setMessage(text);
            toast.error('Could not cancel order', text);
          }
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
          toast.success('Feedback submitted', 'Thank you for rating your harvest.');
        }}
      />
    </div>
  );
};

export default OrderDetails;
