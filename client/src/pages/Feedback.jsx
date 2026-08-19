import { useState } from 'react';
import { useCustomer } from '../context/CustomerContext.jsx';
import FeedbackModal from '../components/FeedbackModal.jsx';
import StarRating from '../components/StarRating.jsx';
import { formatDate } from '../utils/format.js';

const Feedback = () => {
  const { orders, submitFeedback } = useCustomer();
  const completed = orders.filter((order) => order.status === 'Completed');
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState('');

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-4xl">Feedback & Rating</h1>
      <p className="mt-2 text-emerald-800">Share how your GardenSphere harvest tasted and arrived.</p>
      {message && <p className="mt-4 rounded-2xl bg-gs-light px-4 py-3 text-sm">{message}</p>}
      <div className="mt-8 grid gap-4">
        {completed.map((order) => (
          <article key={order.id} className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-sm sm:flex-row sm:items-center">
            <img src={order.image} alt="" className="h-24 w-full rounded-2xl object-cover sm:w-32" />
            <div className="flex-1">
              <h2 className="font-display text-2xl">{order.productName}</h2>
              <p className="text-sm text-emerald-700">{order.id} · {formatDate(order.orderDate)}</p>
              {order.feedback ? (
                <div className="mt-2">
                  <StarRating value={order.feedback.rating} readOnly />
                  <p className="mt-1 text-sm">{order.feedback.comment}</p>
                </div>
              ) : (
                <button type="button" onClick={() => setSelected(order)} className="btn-primary mt-3">
                  Give Feedback
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      <FeedbackModal
        open={Boolean(selected)}
        order={selected}
        onClose={() => setSelected(null)}
        onSubmit={({ rating, comment }) => {
          submitFeedback(selected.id, rating, comment);
          setSelected(null);
          setMessage('Feedback submitted. Thank you!');
        }}
      />
    </div>
  );
};

export default Feedback;
