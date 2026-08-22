import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FeedbackModal from '../components/FeedbackModal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useCustomer } from '../context/CustomerContext.jsx';
import { toast } from '../context/ToastContext.jsx';
import { formatDate, formatPrice } from '../utils/format.js';
import { products } from '../data/mockData.js';

const OrderHistory = () => {
  const { orders, submitFeedback } = useCustomer();
  const [filter, setFilter] = useState('All');
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [message, setMessage] = useState('');

  const history = useMemo(() => {
    const list = orders.filter((order) => order.status === 'Completed' || order.status === 'Cancelled');
    if (filter === 'All') return list;
    return list.filter((order) => order.status === filter);
  }, [orders, filter]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-4xl">Order History</h1>
      <p className="mt-2 text-emerald-800">Completed and cancelled purchases.</p>
      {message && <p className="mt-4 rounded-2xl bg-gs-light px-4 py-3 text-sm">{message}</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        {['All', 'Completed', 'Cancelled'].map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              filter === item ? 'bg-gs-primary text-white' : 'bg-white text-gs-deep'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-3xl bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gs-light text-gs-deep">
            <tr>
              <th className="px-4 py-3">Order ID</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Purchase date</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {history.map((order) => (
              <tr key={order.id} className="border-t border-emerald-50">
                <td className="px-4 py-3 font-semibold">{order.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={order.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    {order.productName}
                  </div>
                </td>
                <td className="px-4 py-3">{formatDate(order.orderDate)}</td>
                <td className="px-4 py-3">{order.quantity}</td>
                <td className="px-4 py-3">{formatPrice(order.unitPrice)}</td>
                <td className="px-4 py-3">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <Link to={`/orders/${order.id}`} className="font-semibold text-gs-primary">
                      Details
                    </Link>
                    {order.status === 'Completed' && !order.feedback && (
                      <button type="button" onClick={() => setFeedbackOrder(order)} className="text-left font-semibold text-gs-orange">
                        Feedback
                      </button>
                    )}
                    {(order.productId || products.find((item) => item.name === order.productName)) && (
                      <Link
                        to={`/order/${order.productId || products.find((item) => item.name === order.productName)?.id}?qty=${order.quantity || 1}`}
                        className="font-semibold text-emerald-800"
                      >
                        Order again
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FeedbackModal
        open={Boolean(feedbackOrder)}
        order={feedbackOrder}
        onClose={() => setFeedbackOrder(null)}
        onSubmit={({ rating, comment }) => {
          submitFeedback(feedbackOrder.id, rating, comment);
          setFeedbackOrder(null);
          setMessage('Feedback submitted. Thank you!');
          toast.success('Feedback submitted', 'Thank you for rating your harvest.');
        }}
      />
    </div>
  );
};

export default OrderHistory;
