import { useEffect, useState } from 'react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { fetchMyContactMessages, sendContactMessage } from '../services/contactService.js';
import { formatDateTime } from '../utils/format.js';

const STATUS_TINTS = {
  New: 'bg-amber-100 text-amber-800',
  Read: 'bg-sky-100 text-sky-800',
  Replied: 'bg-emerald-100 text-emerald-800',
  Closed: 'bg-slate-100 text-slate-600',
};

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  subject: 'Product Availability',
  message: '',
};

const Contact = () => {
  const { user } = useCustomer();
  const [form, setForm] = useState({
    ...emptyForm,
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [threads, setThreads] = useState([]);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadThreads = async (email) => {
    if (!email) return;
    try {
      const rows = await fetchMyContactMessages(email);
      setThreads(rows);
    } catch {
      /* keep the form usable even if inbox lookup fails */
    }
  };

  useEffect(() => {
    if (user?.email) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
      loadThreads(user.email);
    }
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSent(false);
    try {
      await sendContactMessage(form);
      setSent(true);
      await loadThreads(form.email);
      setForm((prev) => ({ ...prev, message: '' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="relative h-64">
        <img
          src="https://images.unsplash.com/photo-1592419044706-39796d40f98c?auto=format&fit=crop&w=1400&q=80"
          alt="Gardener in a vegetable garden"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 grid place-items-center bg-gs-deep/55">
          <h1 className="font-display text-4xl text-white">Contact Garden Manager</h1>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 lg:grid-cols-2 lg:px-6">
        <div>
          <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-sm">
            {sent && (
              <p className="mb-4 rounded-2xl bg-gs-light p-4">
                Message sent. The garden manager will get back to you shortly. Replies appear below.
              </p>
            )}
            {error && <p className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
            <label className="block text-sm font-medium">
              Name
              <input className="input-field mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Email
              <input type="email" className="input-field mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Phone
              <input className="input-field mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </label>
            <label className="mt-4 block text-sm font-medium">
              Subject
              <select className="input-field mt-1" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                <option>Product Availability</option>
                <option>Harvest Information</option>
                <option>Order Inquiry</option>
                <option>General Inquiry</option>
              </select>
            </label>
            <label className="mt-4 block text-sm font-medium">
              Message
              <textarea className="input-field mt-1 min-h-32" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </label>
            <button type="submit" className="btn-primary mt-6" disabled={busy}>
              {busy ? 'Sending…' : 'Send Message'}
            </button>
          </form>

          {threads.length > 0 && (
            <section className="mt-6 space-y-4">
              <h2 className="font-display text-2xl">Your messages</h2>
              {threads.map((thread) => (
                <article key={thread.id} className="rounded-3xl bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">{thread.subject}</p>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TINTS[thread.status] || STATUS_TINTS.Read}`}>
                      {thread.status}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-emerald-900">{thread.message}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(thread.createdAt)}</p>
                  {(thread.replies || []).map((item) => (
                    <div key={item.id} className="mt-3 rounded-2xl bg-gs-light px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">
                        Reply from {item.byName || 'GardenSphere'}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm">{item.body}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatDateTime(item.createdAt)}</p>
                    </div>
                  ))}
                </article>
              ))}
            </section>
          )}
        </div>

        <div className="grid gap-4">
          {[
            { icon: Phone, title: 'Phone', text: '077 123 4567' },
            { icon: Mail, title: 'Email', text: 'manager@gardensphere.lk' },
            { icon: MapPin, title: 'Location', text: 'GardenSphere Home Garden, Kandy' },
            { icon: Clock, title: 'Available Hours', text: 'Mon–Sat, 8:00 AM – 5:00 PM' },
          ].map((item) => (
            <article key={item.title} className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gs-light text-gs-primary">
                <item.icon size={20} />
              </span>
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-sm text-emerald-800">{item.text}</p>
              </div>
            </article>
          ))}
          <img
            src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1000&q=80"
            alt="Fresh vegetables in garden soil"
            className="h-48 w-full rounded-3xl object-cover shadow-card"
          />
        </div>
      </div>
    </div>
  );
};

export default Contact;
