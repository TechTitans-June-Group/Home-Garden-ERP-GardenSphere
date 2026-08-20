const StatCard = ({ icon: Icon, label, value, hint, color = 'bg-emerald-100 text-emerald-800' }) => (
  <article className="rounded-3xl bg-white p-5 shadow-sm">
    <span className={`inline-flex rounded-2xl p-3 ${color}`}>
      <Icon size={20} />
    </span>
    <p className="mt-4 text-sm text-emerald-700">{label}</p>
    <p className="font-display text-3xl text-gs-deep">{value}</p>
    {hint && <p className="mt-1 text-xs text-emerald-600">{hint}</p>}
  </article>
);

export default StatCard;
