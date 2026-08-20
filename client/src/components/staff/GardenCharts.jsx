const COLORS = ['#16A34A', '#84CC16', '#0EA5E9', '#F59E0B', '#F97316', '#14532D', '#10B981', '#EF4444'];

const withColors = (data = []) =>
  data
    .filter((item) => Number(item.value) > 0)
    .map((item, index) => ({
      ...item,
      color: item.color || COLORS[index % COLORS.length],
    }));

export const BarChart = ({ title, data = [] }) => {
  const items = withColors(data);
  const max = Math.max(...items.map((item) => Number(item.value)), 1);

  if (!items.length) {
    return (
      <div className="grid h-full min-h-[220px] place-items-center rounded-[24px] border border-dashed border-emerald-100 bg-white/70 text-sm text-slate-400">
        No chart data yet
      </div>
    );
  }

  return (
    <div className="h-full rounded-[24px] bg-white/80 p-5">
      {title && <h4 className="text-sm font-bold text-slate-800">{title}</h4>}
      <div className="mt-4 flex h-44 items-end gap-2">
        {items.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <p className="text-[10px] font-semibold text-slate-500">{item.value}</p>
            <div className="flex h-36 w-full items-end justify-center">
              <div
                className="w-7 max-w-full rounded-t-2xl shadow-sm"
                style={{
                  height: `${Math.max((Number(item.value) / max) * 100, 8)}%`,
                  background: `linear-gradient(180deg, ${item.color}, #14532D)`,
                }}
                title={`${item.label}: ${item.value}`}
              />
            </div>
            <p className="w-full truncate text-center text-[10px] font-semibold text-slate-600">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export const PieChart = ({ title, data = [] }) => {
  const items = withColors(data);
  const total = items.reduce((sum, item) => sum + Number(item.value), 0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (!items.length || total <= 0) {
    return (
      <div className="grid h-full min-h-[220px] place-items-center rounded-[24px] border border-dashed border-emerald-100 bg-white/70 text-sm text-slate-400">
        No chart data yet
      </div>
    );
  }

  return (
    <div className="h-full rounded-[24px] bg-white/80 p-5">
      {title && <h4 className="text-sm font-bold text-slate-800">{title}</h4>}
      <div className="mt-3 flex flex-wrap items-center gap-5">
        <svg viewBox="0 0 160 160" className="h-40 w-40 shrink-0">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#ECFDF3" strokeWidth="22" />
          {items.map((item) => {
            const portion = Number(item.value) / total;
            const dash = portion * circumference;
            const circle = (
              <circle
                key={item.label}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={item.color}
                strokeWidth="22"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                transform="rotate(-90 80 80)"
              />
            );
            offset += dash;
            return circle;
          })}
          <circle cx="80" cy="80" r="34" fill="white" />
          <text x="80" y="76" textAnchor="middle" className="fill-slate-400" fontSize="9">
            Total
          </text>
          <text x="80" y="94" textAnchor="middle" className="fill-slate-800" fontSize="14" fontWeight="700">
            {total}
          </text>
        </svg>
        <ul className="grid min-w-[140px] flex-1 gap-2">
          {items.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-3 text-xs">
              <span className="inline-flex items-center gap-2 font-medium text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
              <span className="font-semibold text-slate-800">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
