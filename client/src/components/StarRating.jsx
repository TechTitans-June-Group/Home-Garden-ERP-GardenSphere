import { Star } from 'lucide-react';

const StarRating = ({ value = 0, onChange, size = 20, readOnly = false }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={readOnly ? 'cursor-default' : 'transition hover:scale-110'}
          aria-label={`${star} star`}
        >
          <Star
            size={size}
            className={star <= value ? 'fill-gs-yellow text-gs-yellow' : 'text-emerald-200'}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
