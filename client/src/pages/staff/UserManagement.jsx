import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { KeyRound, Pencil, Power, Shield, UserPlus } from 'lucide-react';
import { useStaff } from '../../context/StaffContext.jsx';
import { ROLE_LABELS, ROLE_PERMISSIONS } from '../../data/staffData.js';
import { formatDateTime } from '../../utils/format.js';

const emptyUser = {
  name: '',
  email: '',
  phone: '',
  role: 'gardener',
  password: '',
  status: 'Active',
};

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-[#14532D]/40 px-4">
    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <button type="button" className="text-sm font-semibold text-slate-500" onClick={onClose}>
          Close
        </button>
      </div>
      {children}
    </div>
  </div>
);

export const UsersPage = () => {
  const { users, createUser, updateUser, setUserStatus, resetPassword, activity } = useStaff();
  const [mode, setMode] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const [target, setTarget] = useState(null);
  const [password, setPassword] = useState({ next: '', confirm: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const activeCount = users.items.filter((item) => item.status === 'Active').length;
  const inactiveCount = users.items.length - activeCount;

  const openCreate = () => {
    setError('');
    setForm(emptyUser);
    setMode('create');
  };

  const openEdit = (user) => {
    setError('');
    setForm({ ...user });
    setMode('edit');
  };

  const openReset = (user) => {
    setError('');
    setTarget(user);
    setPassword({ next: '', confirm: '' });
    setMode('reset');
  };

  const handleSave = (event) => {
    event.preventDefault();
    setError('');
    try {
      if (mode === 'create') {
        if (!form.password || form.password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        createUser(form);
      } else {
        updateUser(form);
      }
      setMode(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const isActive = (user) => (user.status || 'Active') !== 'Inactive';

  const openStatus = (user) => {
    setError('');
    setTarget(user);
    setMode('status');
  };

  const handleStatus = (user) => {
    try {
      const nextStatus = isActive(user) ? 'Inactive' : 'Active';
      setUserStatus(user.id, nextStatus);
      setNotice(
        nextStatus === 'Inactive'
          ? `${user.name} was deactivated and can no longer sign in.`
          : `${user.name} was activated.`
      );
      setMode(null);
      setTarget(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReset = (event) => {
    event.preventDefault();
    setError('');
    if (password.next.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password.next !== password.confirm) {
      setError('Passwords do not match.');
      return;
    }
    resetPassword(target.id, password.next);
    setMode(null);
  };

  const recentFor = (userId) => activity.filter((item) => item.userId === userId).slice(0, 3);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Users</h1>
          <p className="mt-1 text-sm text-slate-500">Create, update, deactivate, assign roles, and reset passwords.</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#16A34A] to-[#84CC16] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <UserPlus size={16} /> Create user
        </button>
      </div>
      {notice && <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p>}
      {error && !mode && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ['Total users', users.items.length],
          ['Active', activeCount],
          ['Inactive', inactiveCount],
        ].map(([label, value]) => (
          <article key={label} className="rounded-2xl bg-white px-5 py-4 shadow-[0_8px_24px_rgba(20,83,45,0.04)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-[28px] bg-white shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-[#F3F7F1] text-slate-700">
            <tr>
              {['Name', 'Email', 'Role', 'Status', 'Last login', 'Actions'].map((label) => (
                <th key={label} className="px-4 py-3 font-semibold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.items.map((user) => (
              <tr key={user.id} className="border-t border-emerald-50 align-top">
                <td className="px-4 py-3 break-words">
                  <p className="font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.phone}</p>
                </td>
                <td className="px-4 py-3 break-all">{user.email}</td>
                <td className="px-4 py-3">{ROLE_LABELS[user.role] || user.role}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isActive(user) ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {isActive(user) ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-500">{user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="inline-flex items-center gap-1 font-semibold text-emerald-700" onClick={() => openEdit(user)}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button type="button" className="inline-flex items-center gap-1 font-semibold text-amber-700" onClick={() => openReset(user)}>
                      <KeyRound size={14} /> Reset
                    </button>
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1 font-semibold ${
                        isActive(user) ? 'text-red-600' : 'text-emerald-700'
                      }`}
                      onClick={() => openStatus(user)}
                    >
                      <Power size={14} /> {isActive(user) ? 'Deactivate' : 'Activate'}
                    </button>
                    <Link to={`/staff/activity?user=${user.id}`} className="font-semibold text-slate-600">
                      Activity
                    </Link>
                  </div>
                  {recentFor(user.id).length > 0 && (
                    <p className="mt-2 text-[11px] text-slate-400">Last: {recentFor(user.id)[0].action}</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(mode === 'create' || mode === 'edit') && (
        <Modal title={mode === 'create' ? 'Create user' : 'Update user'} onClose={() => setMode(null)}>
          <form onSubmit={handleSave} className="mt-4 grid gap-3">
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <label className="text-sm font-medium">
              Full name
              <input className="input-field mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label className="text-sm font-medium">
              Email
              <input type="email" className="input-field mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label className="text-sm font-medium">
              Phone
              <input className="input-field mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
            <label className="text-sm font-medium">
              Assign role
              <select className="input-field mt-1" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {mode === 'create' && (
              <label className="text-sm font-medium">
                Temporary password
                <input
                  type="text"
                  className="input-field mt-1"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </label>
            )}
            <div className="mt-2 flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setMode(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                {mode === 'create' ? 'Create user' : 'Save changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {mode === 'status' && target && (
        <Modal title={isActive(target) ? 'Deactivate user' : 'Activate user'} onClose={() => setMode(null)}>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {isActive(target)
              ? `${target.name} will be set to Inactive and will not be able to sign in.`
              : `${target.name} will be set to Active and can sign in again.`}
          </p>
          {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <div className="mt-6 flex gap-3">
            <button type="button" className="btn-secondary flex-1" onClick={() => setMode(null)}>
              Cancel
            </button>
            <button
              type="button"
              className={`flex-1 rounded-full px-5 py-2.5 text-sm font-semibold text-white ${
                isActive(target) ? 'bg-red-600 hover:bg-red-700' : 'bg-[#16A34A] hover:bg-[#14532D]'
              }`}
              onClick={() => handleStatus(target)}
            >
              {isActive(target) ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </Modal>
      )}
      {mode === 'reset' && target && (
        <Modal title={`Reset password · ${target.name}`} onClose={() => setMode(null)}>
          <form onSubmit={handleReset} className="mt-4 grid gap-3">
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <label className="text-sm font-medium">
              New password
              <input
                type="text"
                className="input-field mt-1"
                value={password.next}
                onChange={(e) => setPassword({ ...password, next: e.target.value })}
                required
              />
            </label>
            <label className="text-sm font-medium">
              Confirm password
              <input
                type="text"
                className="input-field mt-1"
                value={password.confirm}
                onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                required
              />
            </label>
            <div className="mt-2 flex gap-3">
              <button type="button" className="btn-secondary flex-1" onClick={() => setMode(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                Reset password
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export const RolesPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">Manage Permissions</h1>
      <p className="mt-1 text-slate-500">Permissions assigned to each GardenSphere staff role.</p>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {Object.keys(ROLE_LABELS).map((role) => (
          <article key={role} className="rounded-[28px] bg-white p-6 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
              <Shield size={14} /> {role}
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">{ROLE_LABELS[role]}</h2>
            <ul className="mt-4 grid gap-2">
              {(ROLE_PERMISSIONS[role] || []).map((permission) => (
                <li key={permission} className="rounded-2xl bg-[#F3F7F1] px-3 py-2 text-sm text-slate-700">
                  {permission}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
};

export const ActivityPage = () => {
  const { activity, users } = useStaff();
  const [params, setParams] = useSearchParams();
  const selected = params.get('user') || 'all';
  const [action, setAction] = useState('all');

  const actions = useMemo(() => ['all', ...new Set(activity.map((item) => item.action))], [activity]);
  const filtered = activity.filter((item) => {
    const userOk = selected === 'all' || item.userId === selected || item.actorId === selected;
    const actionOk = action === 'all' || item.action === action;
    return userOk && actionOk;
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">User Activity</h1>
      <p className="mt-1 text-slate-500">Logins, profile changes, role updates, deactivations, and password resets.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium">
          User
          <select
            className="input-field mt-1"
            value={selected}
            onChange={(event) => {
              const value = event.target.value;
              if (value === 'all') setParams({});
              else setParams({ user: value });
            }}
          >
            <option value="all">All users</option>
            {users.items.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium">
          Action
          <select className="input-field mt-1" value={action} onChange={(event) => setAction(event.target.value)}>
            {actions.map((item) => (
              <option key={item} value={item}>
                {item === 'all' ? 'All actions' : item}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-6 grid gap-3">
        {filtered.length === 0 && (
          <p className="rounded-[28px] bg-white px-5 py-10 text-center text-slate-500">No activity recorded yet.</p>
        )}
        {filtered.map((item) => (
          <article key={item.id} className="rounded-[28px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{item.action}</p>
                <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                <p className="mt-2 text-xs text-emerald-700">
                  Actor: {item.actorName || 'System'}
                  {item.userName ? ` · User: ${item.userName}` : ''}
                </p>
              </div>
              <p className="text-xs font-semibold text-slate-400">{formatDateTime(item.time)}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
