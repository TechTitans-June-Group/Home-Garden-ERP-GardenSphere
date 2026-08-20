import { useState } from 'react';
import StarRating from './StarRating.jsx';

const FeedbackModal = ({ open, onClose, onSubmit, order }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!open || !order) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ rating, comment });
    setComment('');
    setRating(5);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-gs-deep/40 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-card">
        <h2 className="font-display text-2xl text-gs-deep">How was your GardenSphere experience?</h2>
        <p className="mt-1 text-sm text-emerald-700">Feedback for {order.productName}</p>
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium">Rating</p>
          <StarRating value={rating} onChange={setRating} size={28} />
        </div>
        <label className="mt-5 block text-sm font-medium">
          Feedback comment
          <textarea
            className="input-field mt-2 min-h-28"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Tell us about freshness, packing, and taste..."
            required
          />
        </label>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Close
          </button>
          <button type="submit" className="btn-primary flex-1">
            Submit Feedback
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackModal;
