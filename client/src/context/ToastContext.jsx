import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let pushToast = () => {};

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const TINTS = {
  success: 'border-emerald-100 from-emerald-600 to-lime-500',
  error: 'border-red-100 from-rose-600 to-orange-500',
  info: 'border-sky-100 from-sky-600 to-cyan-500',
};

export const toast = {
  success: (title, description) => pushToast({ type: 'success', title, description }),
  error: (title, description) => pushToast({ type: 'error', title, description }),
  info: (title, description) => pushToast({ type: 'info', title, description }),
};

const ToastCard = ({ item, onDismiss }) => {
  const Icon = ICONS[item.type] || CheckCircle2;
  return (
    <div
      className={`gs-toast pointer-events-auto flex w-full max-w-sm gap-3 rounded-2xl border bg-gradient-to-r ${TINTS[item.type]} p-3.5 text-white shadow-[0_16px_40px_rgba(20,83,45,0.22)]`}
      role="status"
    >
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/15">
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-5">{item.title}</p>
        {item.description ? <p className="mt-0.5 text-xs leading-5 text-white/90">{item.description}</p> : null}
      </div>
      <button
        type="button"
        className="shrink-0 rounded-full p-1 text-white/80 hover:bg-white/15 hover:text-white"
        onClick={() => onDismiss(item.id)}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  useEffect(() => {
    pushToast = ({ type = 'success', title, description }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const message = typeof title === 'string' ? title : 'Done';
      setToasts((prev) => [...prev.slice(-3), { id, type, title: message, description }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 3800);
    };
    return () => {
      pushToast = () => {};
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[90] grid w-[min(100%-2rem,24rem)] gap-2 sm:right-6 sm:top-6">
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
};
