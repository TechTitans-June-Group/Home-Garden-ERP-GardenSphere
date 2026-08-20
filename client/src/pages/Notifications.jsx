import {
  Bell,
  CheckCircle2,
  Leaf,
  PackageCheck,
  ShoppingBasket,
  XCircle,
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { formatDateTime } from '../utils/format.js';

const icons = {
  order: ShoppingBasket,
  confirmed: PackageCheck,
  completed: CheckCircle2,
  cancelled: XCircle,
  harvest: Leaf,
  products: Bell,
};

const Notifications = () => {
  const { notifications, markRead, markAllRead } = useCustomer();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Notifications</h1>
        <button type="button" onClick={markAllRead} className="btn-secondary">
          Mark All as Read
        </button>
      </div>
      <div className="mt-8 grid gap-3">
        {notifications.map((item) => {
          const Icon = icons[item.type] || Bell;
          return (
            <article
              key={item.id}
              className={`flex gap-4 rounded-3xl p-5 ${item.read ? 'bg-white' : 'bg-gs-light'}`}
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-gs-primary shadow-sm">
                <Icon size={20} />
              </span>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold">{item.title}</h2>
                  {!item.read && (
                    <button type="button" onClick={() => markRead(item.id)} className="text-xs font-semibold text-gs-primary">
                      Mark as Read
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm text-emerald-800">{item.description}</p>
                <p className="mt-2 text-xs text-emerald-600">{formatDateTime(item.time)}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
