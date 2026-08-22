import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetAccountPassword } from '../services/customerService.js';
import { toast } from '../context/ToastContext.jsx';

const ForgotPassword = () => {
  const [form, setForm] = useState({ email: '', password: '', confirm: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await resetAccountPassword(form.email, form.password);
      setSent(true);
      toast.success('Password updated', 'You can log in with your new password.');
    } catch (err) {
      setError(err.message);
      toast.error('Could not update password', err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl">Forgot password</h1>
      <p className="mt-2 text-sm text-emerald-800">Enter your account email and choose a new password.</p>
      {error && <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {sent ? (
        <p className="mt-6 rounded-2xl bg-gs-light p-4">Password updated for {form.email}. You can log in now.</p>
      ) : (
        <form className="mt-6" onSubmit={handleSubmit}>
          <input
            type="email"
            className="input-field"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            className="input-field mt-3"
            placeholder="New password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <input
            type="password"
            className="input-field mt-3"
            placeholder="Confirm new password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            required
          />
          <button type="submit" className="btn-primary mt-4 w-full" disabled={busy}>
            {busy ? 'Saving…' : 'Update password'}
          </button>
        </form>
      )}
      <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-gs-primary">
        Back to login
      </Link>
    </div>
  );
};

export default ForgotPassword;
