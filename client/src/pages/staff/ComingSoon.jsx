const ComingSoon = ({ title }) => {
  return (
    <div className="rounded-[28px] bg-white px-6 py-16 text-center shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-3 text-sm font-semibold text-amber-600">Coming soon</p>
      <p className="mt-2 text-slate-500">This module is not available yet.</p>
    </div>
  );
};

export default ComingSoon;
