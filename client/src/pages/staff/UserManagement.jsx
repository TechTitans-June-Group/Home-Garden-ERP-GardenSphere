import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Activity,
  History,
  KeyRound,
  Leaf,
  Pencil,
  Power,
  Search,
  Shield,
  UserPlus,
  Users,
  Wallet,
  Warehouse,
  Sprout,
  X,
} from 'lucide-react';
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

const ROLE_THEME = {
  admin: { tint: 'bg-emerald-100 text-emerald-800', icon: Shield, accent: 'from-[#14532D] to-[#16A34A]' },
  garden_manager: { tint: 'bg-lime-100 text-lime-800', icon: Sprout, accent: 'from-[#3F6212] to-[#84CC16]' },
  gardener: { tint: 'bg-green-100 text-green-800', icon: Leaf, accent: 'from-[#166534] to-[#22C55E]' },
  inventory_manager: { tint: 'bg-teal-100 text-teal-800', icon: Warehouse, accent: 'from-[#115E59] to-[#2DD4BF]' },
  finance_manager: { tint: 'bg-amber-100 text-amber-800', icon: Wallet, accent: 'from-[#92400E] to-[#F59E0B]' },
};

const ACTION_TONE = {
  'Logged in': 'bg-emerald-100 text-emerald-800',
  'Logged out': 'bg-slate-100 text-slate-700',
  'Created user': 'bg-sky-100 text-sky-800',
  'Updated user': 'bg-lime-100 text-lime-800',
  'Assigned role': 'bg-violet-100 text-violet-800',
  'Deactivated user': 'bg-red-100 text-red-700',
  'Activated user': 'bg-emerald-100 text-emerald-800',
  'Reset password': 'bg-amber-100 text-amber-800',
  'Updated permissions': 'bg-teal-100 text-teal-800',
};

const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const PageHero = ({ kicker, title, subtitle, icon: Icon, action }) => (
  <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#14532D] via-[#15803D] to-[#84CC16] p-6 text-white shadow-[0_20px_50px_rgba(20,83,45,0.22)] sm:p-8">
    <div className="gs-dot-vine pointer-events-none absolute inset-0 opacity-20" />
    <Leaf className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rotate-12 text-white/10" />
    <div className="relative flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-lime-100">
          <Icon size={14} /> {kicker}
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-emerald-50 sm:text-base">{subtitle}</p>
      </div>
      {action}
    </div>
  </section>
);

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-[#14532D]/45 px-4">
    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white shadow-[0_24px_60px_rgba(20,83,45,0.25)]">
      <div className="flex items-start justify-between gap-3 border-b border-emerald-50 bg-gradient-to-r from-emerald-50 to-lime-50 px-6 py-4">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <button type="button" className="rounded-full p-1 text-slate-500 hover:bg-white" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <div className="p-6">{children}</div>
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
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const activeCount = users.items.filter((item) => item.status === 'Active').length;
  const inactiveCount = users.items.length - activeCount;
  const filtered = users.items.filter((user) => {
    const haystack = `${user.name} ${user.email} ${user.role}`.toLowerCase();
    const matchesQuery = haystack.includes(query.trim().toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesQuery && matchesRole;
  });

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
        setNotice(`${form.name} was added to the garden team.`);
      } else {
        updateUser(form);
        setNotice(`${form.name} was updated.`);
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
    setNotice(`Password reset for ${target.name}.`);
    setMode(null);
  };

  const recentFor = (userId) => activity.filter((item) => item.userId === userId).slice(0, 1);

  return (
    <div>
      <PageHero
        kicker="People"
        title="Garden team"
        subtitle="Create staff, assign roles, reset passwords, and keep the right people on the beds."
        icon={Users}
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#14532D] shadow-sm hover:bg-lime-100"
          >
            <UserPlus size={16} /> Create user
          </button>
        }
      />

      {notice && <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p>}
      {error && !mode && <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total users', users.items.length, 'bg-emerald-100 text-emerald-700', Users],
          ['Active', activeCount, 'bg-lime-100 text-lime-700', Shield],
          ['Inactive', inactiveCount, 'bg-red-100 text-red-700', Power],
          ['Roles in use', new Set(users.items.map((item) => item.role)).size, 'bg-amber-100 text-amber-800', Sprout],
        ].map(([label, value, tint, Icon]) => (
          <article key={label} className="rounded-[24px] bg-white p-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
            <span className={`grid h-10 w-10 place-items-center rounded-2xl ${tint}`}>
              <Icon size={18} />
            </span>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3 rounded-[24px] bg-white p-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
        <label className="relative min-w-[220px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input-field pl-10"
            placeholder="Search name, email, or role"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <select className="input-field w-52" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
          <option value="all">All roles</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filtered.length === 0 && (
          <p className="rounded-[28px] bg-white px-5 py-12 text-center text-slate-500 md:col-span-2">No staff match those filters.</p>
        )}
        {filtered.map((user) => {
          const theme = ROLE_THEME[user.role] || ROLE_THEME.gardener;
          const RoleIcon = theme.icon;
          return (
            <article key={user.id} className="overflow-hidden rounded-[28px] bg-white shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
              <div className={`h-2 bg-gradient-to-r ${theme.accent}`} />
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${theme.accent} text-lg font-bold text-white`}>
                    {initials(user.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
                        <p className="break-all text-sm text-slate-500">{user.email}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isActive(user) ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {isActive(user) ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${theme.tint}`}>
                        <RoleIcon size={12} /> {ROLE_LABELS[user.role] || user.role}
                      </span>
                      {user.phone && <span className="text-xs text-slate-500">{user.phone}</span>}
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                      Last login: {user.lastLogin ? formatDateTime(user.lastLogin) : 'Never'}
                      {recentFor(user.id)[0] ? ` · ${recentFor(user.id)[0].action}` : ''}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-emerald-50 pt-4">
                  <button type="button" className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800" onClick={() => openEdit(user)}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button type="button" className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800" onClick={() => openReset(user)}>
                    <KeyRound size={13} /> Reset
                  </button>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      isActive(user) ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'
                    }`}
                    onClick={() => openStatus(user)}
                  >
                    <Power size={13} /> {isActive(user) ? 'Deactivate' : 'Activate'}
                  </button>
                  <Link to={`/staff/activity?user=${user.id}`} className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    <History size={13} /> Activity
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {(mode === 'create' || mode === 'edit') && (
        <Modal title={mode === 'create' ? 'Create user' : 'Update user'} onClose={() => setMode(null)}>
          <form onSubmit={handleSave} className="grid gap-3">
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
          <p className="text-sm leading-6 text-slate-600">
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
          <form onSubmit={handleReset} className="grid gap-3">
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
  const { users, permissions } = useStaff();

  return (
    <div>
      <PageHero
        kicker="Access"
        title="Roles & permissions"
        subtitle="Each garden role has a clear set of doors it can open across GardenSphere."
        icon={Shield}
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        {Object.keys(ROLE_LABELS).map((role) => {
          const theme = ROLE_THEME[role] || ROLE_THEME.gardener;
          const Icon = theme.icon;
          const assigned = users.items.filter((user) => user.role === role);
          const list = permissions?.[role] || ROLE_PERMISSIONS[role] || [];
          return (
            <article key={role} className="overflow-hidden rounded-[28px] bg-white shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
              <div className={`bg-gradient-to-r ${theme.accent} px-6 py-5 text-white`}>
                <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">
                  <Icon size={14} /> {role.replace('_', ' ')}
                </p>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <h2 className="text-2xl font-bold">{ROLE_LABELS[role]}</h2>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                    {assigned.length} staff
                  </span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Permissions</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {list.map((permission) => (
                    <li key={permission} className="rounded-full bg-[#F3F7F1] px-3 py-1.5 text-sm text-slate-700">
                      {permission}
                    </li>
                  ))}
                </ul>
                {assigned.length > 0 && (
                  <div className="mt-5 flex -space-x-2">
                    {assigned.slice(0, 5).map((user) => (
                      <span
                        key={user.id}
                        title={user.name}
                        className={`grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-gradient-to-br ${theme.accent} text-[10px] font-bold text-white`}
                      >
                        {initials(user.name)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </article>
          );
        })}
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
  const selectedUser = users.items.find((user) => user.id === selected);

  return (
    <div>
      <PageHero
        kicker="Audit trail"
        title="User activity"
        subtitle="Follow logins, role changes, password resets, and who touched each account."
        icon={Activity}
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ['Events', filtered.length],
          ['People', new Set(filtered.map((item) => item.actorId || item.userId)).size],
          ['Latest', filtered[0] ? formatDateTime(filtered[0].time) : '—'],
        ].map(([label, value]) => (
          <article key={label} className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-3 rounded-[24px] bg-white p-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)] sm:grid-cols-2">
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

      {selectedUser && (
        <p className="mt-4 text-sm text-emerald-800">
          Showing activity for <span className="font-semibold">{selectedUser.name}</span>
        </p>
      )}

      <div className="relative mt-6 grid gap-3 border-l-2 border-emerald-100 pl-5">
        {filtered.length === 0 && (
          <p className="rounded-[28px] bg-white px-5 py-10 text-center text-slate-500">No activity recorded yet.</p>
        )}
        {filtered.map((item) => (
          <article key={item.id} className="relative rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
            <span className="absolute -left-[29px] top-6 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${ACTION_TONE[item.action] || 'bg-slate-100 text-slate-700'}`}>
                  {item.action}
                </span>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
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
