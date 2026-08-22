import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { useStaff } from '../context/StaffContext.jsx';
import { toast } from '../context/ToastContext.jsx';
import { ROLE_LABELS } from '../data/staffData.js';

const Login = () => {
  const { login: customerLogin } = useCustomer();
  const { login: staffLogin } = useStaff();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: '',
    password: '',
    remember: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }

    try {
      const session = await staffLogin(form.email, form.password);
      const role = ROLE_LABELS[session.role] || 'Staff';
      toast.success(`Welcome to ${role} Dashboard`, `Hi ${session.name.split(' ')[0]}, you are signed in.`);
      navigate('/staff');
      return;
    } catch (err) {
      const message = err.message || '';
      if (message.includes('server') || message.includes('authorized') || message.includes('deactivated')) {
        setError(message);
        toast.error('Could not sign in', message);
        return;
      }
    }

    try {
      await customerLogin(form.email, form.password, form.remember);
      toast.success('Welcome back', 'You are signed in to GardenSphere.');
      navigate(location.state?.from || '/');
    } catch {
      setError('Invalid email or password.');
      toast.error('Could not sign in', 'Invalid email or password.');
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div
        className="relative hidden min-h-screen bg-cover bg-center lg:block"
        style={{ backgroundImage: 'url(/login-garden.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#14532D]/80 via-[#14532D]/25 to-transparent" />
        <div className="absolute bottom-10 left-10 right-10 text-white">
          <p className="font-display text-4xl">Fresh from our garden</p>
          <p className="mt-2 max-w-md text-emerald-50">
            Vegetables, fruits, and herbs harvested with care through GardenSphere.
          </p>
        </div>
      </div>

      <div className="flex min-h-screen flex-col justify-center bg-white px-6 py-10">
        <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-gs-deep">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#14532D] text-white">
              <Leaf size={18} />
            </span>
            <span className="font-display text-xl">GardenSphere</span>
          </Link>
          <h1 className="font-display text-3xl text-gs-deep">Welcome back</h1>
          <p className="mt-2 mb-6 text-sm text-emerald-800">
            {location.state?.from === '/garden-design'
              ? 'Log in with a customer account to design your home garden.'
              : 'Customers and garden team members can sign in from this page.'}
          </p>
          {error && <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <label className="text-sm font-medium">
            Email
            <input
              type="email"
              className="input-field mt-1"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
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
          <div className="mt-4 flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} />
              Remember me
            </label>
            <Link to="/forgot-password" className="font-semibold text-gs-primary">
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="btn-primary mt-6 w-full">
            Login
          </button>
          <p className="mt-4 text-sm">
            New customer?{' '}
            <Link
              to="/register"
              state={location.state}
              className="font-semibold text-gs-primary"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
