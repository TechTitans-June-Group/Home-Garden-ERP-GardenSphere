const CancelModal = ({ open, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-gs-deep/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-card">
        <h2 className="font-display text-2xl text-gs-deep">Cancel this order?</h2>
        <p className="mt-2 text-sm text-emerald-800">
          Are you sure you want to cancel this order? This action updates the order status to Cancelled.
        </p>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Keep Order
          </button>
          <button type="button" onClick={onConfirm} className="flex-1 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white">
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelModal;
