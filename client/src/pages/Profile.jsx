import { useState } from 'react';
import { useCustomer } from '../context/CustomerContext.jsx';

const Profile = () => {
  const { user, updateProfile, logout } = useCustomer();
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    updateProfile(form);
    setSaved(true);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-4xl">Manage Profile</h1>
      <p className="mt-2 text-emerald-800">Update your customer details for harvest orders.</p>
      {saved && <p className="mt-4 rounded-2xl bg-gs-light px-4 py-3 text-sm">Profile updated.</p>}
      <form onSubmit={handleSubmit} className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        {['name', 'email', 'phone', 'address'].map((key) => (
          <label key={key} className="mt-4 block text-sm font-medium capitalize">
            {key}
            <input
              className="input-field mt-1"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
        <div className="mt-6 flex gap-3">
          <button type="submit" className="btn-primary">
            Save changes
          </button>
          <button type="button" onClick={logout} className="btn-secondary">
            Logout
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
