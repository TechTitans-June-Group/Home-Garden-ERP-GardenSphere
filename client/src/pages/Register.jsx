import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext.jsx';
import { toast } from '../context/ToastContext.jsx';

const Register = () => {
  const { register } = useCustomer();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
    remember: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.phone || !form.address || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const { confirmPassword, remember, ...payload } = form;
      await register(payload, remember);
      toast.success('Account created', 'Welcome to GardenSphere.');
      navigate(location.state?.from || '/');
    } catch (err) {
      setError(err.message);
      toast.error('Could not create account', err.message);
    }
  };

  return (
    <div className="grid min-h-[80vh] lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-md flex-col justify-center px-6 py-12">
        <h1 className="font-display text-4xl">Create your customer account</h1>
        <p className="mt-2 text-sm text-emerald-800">Order fresh harvests from GardenSphere.</p>
        {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {[
          ['name', 'Full Name'],
          ['email', 'Email', 'email'],
          ['phone', 'Phone Number'],
          ['address', 'Address'],
        ].map(([key, label, type = 'text']) => (
          <label key={key} className="mt-4 text-sm font-medium">
            {label}
            <input
              type={type}
              className="input-field mt-1"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
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
        <label className="mt-4 text-sm font-medium">
          Confirm Password
          <input
            type={showPassword ? 'text' : 'password'}
            className="input-field mt-1"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
        </label>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} />
          Remember me
        </label>
        <button type="submit" className="btn-primary mt-6">
          Register
        </button>
        <p className="mt-4 text-sm">
          Already have an account? <Link to="/login" className="font-semibold text-gs-primary">Login</Link>
        </p>
      </form>
      <div className="relative hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80"
          alt="Home garden"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gs-primary/30" />
      </div>
    </div>
  );
};

export default Register;
