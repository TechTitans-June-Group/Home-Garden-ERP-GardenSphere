import { useEffect, useMemo, useState } from 'react';
import { Leaf, Mail, Search, Send, X } from 'lucide-react';
import { formatDateTime } from '../../utils/format.js';
import { toast } from '../../context/ToastContext.jsx';
import {
  deleteContactMessage,
  fetchStaffMessage,
  fetchStaffMessages,
  replyToContactMessage,
  updateContactStatus,
} from '../../services/contactService.js';

const STATUS_TINTS = {
  New: 'bg-amber-100 text-amber-800',
  Read: 'bg-sky-100 text-sky-800',
  Replied: 'bg-emerald-100 text-emerald-800',
  Closed: 'bg-slate-100 text-slate-600',
};

const Hero = ({ unread }) => (
  <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#14532D] via-[#15803D] to-[#84CC16] p-6 text-white shadow-[0_20px_50px_rgba(20,83,45,0.22)] sm:p-8">
    <div className="gs-dot-vine pointer-events-none absolute inset-0 opacity-20" />
    <Leaf className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rotate-12 text-white/10" />
    <div className="relative max-w-2xl">
      <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-lime-100">
        <Mail size={14} /> Inbox
      </p>
      <h2 className="mt-2 font-display text-3xl sm:text-4xl">Customer messages</h2>
      <p className="mt-2 text-sm text-emerald-50 sm:text-base">
        Contact form inquiries land here. Open a thread, reply, and mark it closed when the conversation is done.
        {unread ? ` ${unread} new message${unread === 1 ? '' : 's'} waiting.` : ''}
      </p>
    </div>
  </section>
);

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-[#14532D]/45 px-4" onClick={onClose} role="presentation">
    <div
      className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-[0_24px_60px_rgba(20,83,45,0.25)]"
      onClick={(event) => event.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-start justify-between gap-3 border-b border-emerald-50 bg-gradient-to-r from-emerald-50 to-lime-50 px-6 py-4">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <button type="button" className="rounded-full p-1 text-slate-500 hover:bg-white" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const MessagesPage = () => {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ total: 0, unread: 0, replied: 0 });
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [active, setActive] = useState(null);
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const flash = (message) => {
    toast.success(message);
    setNotice(message);
    setTimeout(() => setNotice(''), 2200);
  };

  const load = async () => {
    const data = await fetchStaffMessages();
    setRows(data.messages || []);
    setSummary(data.summary || { total: 0, unread: 0, replied: 0 });
  };

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesStatus = status === 'All' || row.status === status;
      const haystack = `${row.name} ${row.email} ${row.phone} ${row.subject} ${row.message}`.toLowerCase();
      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [query, rows, status]);

  const openThread = async (id) => {
    setError('');
    try {
      const message = await fetchStaffMessage(id);
      setActive(message);
      setReply('');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const sendReply = async (event) => {
    event.preventDefault();
    if (!active) return;
    setBusy(true);
    setError('');
    try {
      const updated = await replyToContactMessage(active.id, reply);
      setActive(updated);
      setReply('');
      await load();
      flash('Reply sent to the customer.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const setClosed = async () => {
    if (!active) return;
    setBusy(true);
    try {
      const updated = await updateContactStatus(active.id, 'Closed');
      setActive(updated);
      await load();
      flash('Message marked closed.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this message permanently?')) return;
    try {
      await deleteContactMessage(id);
      setActive(null);
      await load();
      flash('Message deleted.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <Hero unread={summary.unread} />
      {notice && (
        <div className="mt-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 px-4 py-3 text-sm font-semibold text-white shadow-sm">
          {notice}
        </div>
      )}
      {error && !active && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Total</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{summary.total}</p>
        </article>
        <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">New</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{summary.unread}</p>
        </article>
        <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Replied</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{summary.replied}</p>
        </article>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <label className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            className="input-field pl-9"
            placeholder="Search name, email, or subject"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select className="input-field w-40" value={status} onChange={(event) => setStatus(event.target.value)}>
          {['All', 'New', 'Read', 'Replied', 'Closed'].map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="mt-5 overflow-hidden rounded-[28px] bg-white shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
        <table className="w-full text-left text-sm">
          <thead className="bg-emerald-50 text-[11px] uppercase tracking-[0.14em] text-emerald-800">
            <tr>
              <th className="px-5 py-3">From</th>
              <th className="px-5 py-3">Subject</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Received</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                  No messages yet.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-t border-emerald-50 hover:bg-emerald-50/60"
                  onClick={() => openThread(row.id)}
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{row.name}</p>
                    <p className="text-xs text-slate-500">{row.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium">{row.subject}</p>
                    <p className="line-clamp-1 text-xs text-slate-500">{row.message}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TINTS[row.status] || STATUS_TINTS.Read}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{formatDateTime(row.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {active && (
        <Modal title={active.subject} onClose={() => setActive(null)}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900">{active.name}</p>
              <p className="text-sm text-slate-500">
                {active.email}
                {active.phone ? ` · ${active.phone}` : ''}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TINTS[active.status]}`}>{active.status}</span>
          </div>

          <div className="mt-4 space-y-3">
            <article className="rounded-2xl bg-emerald-50 px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-700">Customer</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{active.message}</p>
              <p className="mt-2 text-xs text-slate-500">{formatDateTime(active.createdAt)}</p>
            </article>
            {(active.replies || []).map((item) => (
              <article key={item.id} className="rounded-2xl bg-white px-4 py-3 ring-1 ring-emerald-100">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-lime-700">
                  {item.byName || 'GardenSphere'}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{item.body}</p>
                <p className="mt-2 text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
              </article>
            ))}
          </div>

          {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          {active.status !== 'Closed' ? (
            <form className="mt-4 grid gap-3" onSubmit={sendReply}>
              <label className="text-sm font-medium">
                Reply
                <textarea
                  className="input-field mt-1 min-h-28"
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  required
                  placeholder="Write a reply the customer can see on the contact page."
                />
              </label>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn-primary inline-flex items-center gap-2" disabled={busy}>
                  <Send size={16} /> Send reply
                </button>
                <button type="button" className="btn-secondary" onClick={setClosed} disabled={busy}>
                  Mark closed
                </button>
                <button type="button" className="text-sm font-semibold text-red-600" onClick={() => remove(active.id)}>
                  Delete
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-4 flex flex-wrap gap-3">
              <p className="w-full text-sm text-slate-500">This thread is closed.</p>
              <button type="button" className="text-sm font-semibold text-red-600" onClick={() => remove(active.id)}>
                Delete
              </button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default MessagesPage;
