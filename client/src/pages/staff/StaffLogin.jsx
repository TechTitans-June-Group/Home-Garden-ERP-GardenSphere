import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import { useStaff } from '../../context/StaffContext.jsx';
import { toast } from '../../context/ToastContext.jsx';
import { ROLE_LABELS, staffAccounts } from '../../data/staffData.js';

const StaffLogin = () => {
  const { login } = useStaff();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'admin@gardensphere.com', password: 'Admin@123' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const session = await login(form.email, form.password);
      const role = ROLE_LABELS[session.role] || 'Staff';
      toast.success(`Welcome to ${role} Dashboard`, `Hi ${session.name.split(' ')[0]}, you are signed in.`);
      navigate('/staff');
    } catch (err) {
      setError(err.message);
      toast.error('Could not sign in', err.message);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=80"
          alt="Garden harvest"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gs-deep/55 p-10 text-white">
          <div className="flex items-center gap-2">
            <Leaf />
            <span className="font-display text-2xl">GardenSphere ERP</span>
          </div>
          <h1 className="mt-16 font-display text-5xl">Staff workspace</h1>
          <p className="mt-4 max-w-md text-emerald-100">
            Role-based dashboards for Admin, Garden Manager, Gardener, Inventory Manager, and Finance Manager.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-md flex-col justify-center px-6 py-12">
          <h1 className="text-3xl font-bold text-slate-900">Staff login</h1>
          <p className="mt-2 text-sm text-slate-500">Use a demo role account to open that dashboard.</p>
        {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <label className="mt-6 text-sm font-medium">
          Email
          <input className="input-field mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label className="mt-4 text-sm font-medium">
          Password
          <div className="relative mt-1">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input-field pr-12"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="button" className="absolute right-3 top-3 text-emerald-600" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </label>
        <button type="submit" className="btn-primary mt-6">
          Login to dashboard
        </button>

        <div className="mt-8 rounded-3xl bg-white p-4 text-sm shadow-sm">
          <p className="font-semibold">Demo accounts</p>
          <div className="mt-3 grid gap-2">
            {staffAccounts.map((account) => (
              <button
                key={account.id}
                type="button"
                className="rounded-xl bg-emerald-50 px-3 py-2 text-left hover:bg-emerald-100"
                onClick={() => setForm({ email: account.email, password: account.password })}
              >
                <span className="font-semibold">{ROLE_LABELS[account.role]}</span>
                <span className="block text-xs text-emerald-700">{account.email}</span>
              </button>
            ))}
          </div>
        </div>
        <Link to="/" className="mt-6 text-sm font-semibold text-gs-primary">
          Back to customer site
        </Link>
      </form>
    </div>
  );
};

export default StaffLogin;
