const styles = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-sky-100 text-sky-800',
  Completed: 'bg-emerald-100 text-emerald-800',
  Cancelled: 'bg-red-100 text-red-700',
};

const StatusBadge = ({ status }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || 'bg-slate-100'}`}>
    {status}
  </span>
);

export default StatusBadge;
