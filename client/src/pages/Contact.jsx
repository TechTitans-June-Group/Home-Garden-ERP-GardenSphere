import { useState } from 'react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Product Availability',
    message: '',
  });
  const [sent, setSent] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSent(true);
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
        <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-sm">
          {sent ? (
            <p className="rounded-2xl bg-gs-light p-4">Message sent. The garden manager will get back to you shortly.</p>
          ) : (
            <>
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
              <button type="submit" className="btn-primary mt-6">
                Send Message
              </button>
            </>
          )}
        </form>

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
