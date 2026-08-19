import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-4xl">Forgot password</h1>
      <p className="mt-2 text-sm text-emerald-800">This is a demo reset form. No email is sent.</p>
      {sent ? (
        <p className="mt-6 rounded-2xl bg-gs-light p-4">If an account exists for {email}, a reset link would appear here.</p>
      ) : (
        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <input type="email" className="input-field" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" className="btn-primary mt-4 w-full">
            Send reset link
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
