import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Check,
  Droplets,
  Edit2,
  History,
  Info,
  Leaf,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useStaff } from '../../context/StaffContext.jsx';
import { formatDate } from '../../utils/format.js';

const Hero = ({ kicker, title, subtitle, icon: Icon, action }) => (
  <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0284C7] via-[#0369A1] to-[#0EA5E9] p-6 text-white shadow-[0_20px_50px_rgba(3,105,161,0.22)] sm:p-8">
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent)]" />
    <Droplets className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rotate-12 text-white/10" />
    <div className="relative flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-sky-100">
          <Icon size={14} /> {kicker}
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">{title}</h2>
        <p className="mt-2 text-sm text-sky-50 sm:text-base">{subtitle}</p>
      </div>
      {action}
    </div>
  </section>
);

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 px-4" onClick={onClose} role="presentation">
    <div
      className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[28px] bg-white shadow-xl border border-slate-100"
      onClick={(event) => event.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-start justify-between gap-3 border-b border-sky-50 bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-4">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <button type="button" className="rounded-full p-1 text-slate-500 hover:bg-white" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const Toast = ({ notice }) =>
  notice ? (
    <div className="mb-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-sm">
      {notice}
    </div>
  ) : null;

// ==========================================
// 1. MANAGER VIEW: /staff/irrigation
// ==========================================
export const IrrigationPage = () => {
  const { irrigation, crops, staff } = useStaff();
  const [activeTab, setActiveTab] = useState('schedules');
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [scheduleForm, setScheduleForm] = useState({
    id: '',
    crop: '',
    frequency: 'Daily',
    time: '07:00',
    quantity: '',
    status: 'Due',
  });

  const showNotice = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(''), 3500);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const list = irrigation.items || [];
    const logs = irrigation.records || [];
    const dueCount = list.filter((s) => s.status === 'Due').length;
    
    // Get completed today
    const todayStr = new Date().toISOString().slice(0, 10);
    const completedToday = logs.filter((log) => log.date === todayStr && log.status === 'Completed').length;

    return {
      totalSchedules: list.length,
      dueCount,
      completedToday,
      totalLogs: logs.length,
    };
  }, [irrigation.items, irrigation.records]);

  // Filters
  const filteredSchedules = useMemo(() => {
    const items = irrigation.items || [];
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (s) =>
        s.crop?.toLowerCase().includes(query) ||
        s.frequency?.toLowerCase().includes(query) ||
        s.status?.toLowerCase().includes(query)
    );
  }, [irrigation.items, searchQuery]);

  const filteredRecords = useMemo(() => {
    const items = irrigation.records || [];
    if (!searchQuery) return items;
    const query = searchQuery.toLowerCase();
    return items.filter(
      (r) =>
        r.crop?.toLowerCase().includes(query) ||
        r.notes?.toLowerCase().includes(query) ||
        r.recordedByName?.toLowerCase().includes(query)
    );
  }, [irrigation.records, searchQuery]);

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await irrigation.save(scheduleForm);
      setShowScheduleModal(false);
      showNotice(scheduleForm.id ? 'Irrigation schedule updated successfully.' : 'New irrigation schedule added.');
    } catch (err) {
      setError(err.message || 'Failed to save schedule');
    }
  };

  const handleEditSchedule = (item) => {
    setScheduleForm({
      id: item.id,
      crop: item.crop,
      frequency: item.frequency,
      time: item.time,
      quantity: item.quantity,
      status: item.status,
    });
    setError('');
    setShowScheduleModal(true);
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this irrigation schedule?')) return;
    try {
      await irrigation.remove(id);
      showNotice('Irrigation schedule deleted.');
    } catch (err) {
      alert(err.message || 'Failed to delete schedule');
    }
  };

  const isManager = ['admin', 'garden_manager'].includes(staff?.role);

  return (
    <div className="space-y-6">
      <Hero
        kicker="Water Control"
        title="Irrigation Control Desk"
        subtitle="Manage watering frequency, quantity, schedules, and view complete history logs."
        icon={Droplets}
      />

      <Toast notice={notice} />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_10px_30px_rgba(3,105,161,0.04)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Active Schedules</p>
          <p className="mt-1 text-2xl font-bold text-sky-800">{stats.totalSchedules}</p>
          <p className="mt-1 text-xs text-slate-500">Irrigation schedules in system</p>
        </article>
        <article className="rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_10px_30px_rgba(3,105,161,0.04)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Currently Due</p>
          <p className="mt-1 text-2xl font-bold text-amber-700">{stats.dueCount}</p>
          <p className="mt-1 text-xs text-slate-500">Schedules requiring execution</p>
        </article>
        <article className="rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_10px_30px_rgba(3,105,161,0.04)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Watered Today</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{stats.completedToday}</p>
          <p className="mt-1 text-xs text-slate-500">Watering tasks completed today</p>
        </article>
        <article className="rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_10px_30px_rgba(3,105,161,0.04)]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Watering Logs</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">{stats.totalLogs}</p>
          <p className="mt-1 text-xs text-slate-500">Historical records logged</p>
        </article>
      </div>

      {/* Tabs & Search controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-sky-50 pb-2">
        <div className="flex gap-2">
          {[
            { id: 'schedules', label: 'Watering Schedules', icon: Droplets },
            { id: 'history', label: 'Watering History', icon: History },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-sky-800 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-sky-50/50 hover:text-sky-800'
                }`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
              >
                <TabIcon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 items-center gap-3 justify-end max-w-md w-full">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 grid place-items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full rounded-2xl border border-sky-100 bg-white py-2 pl-10 pr-4 text-sm focus:border-sky-500 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isManager && activeTab === 'schedules' && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-sky-700 hover:to-blue-600 shrink-0"
              onClick={() => {
                setError('');
                const cropsList = crops.items || [];
                setScheduleForm({
                  id: '',
                  crop: cropsList?.[0]?.name || '',
                  frequency: 'Daily',
                  time: '07:00',
                  quantity: '',
                  status: 'Due',
                });
                setShowScheduleModal(true);
              }}
            >
              <Plus size={16} /> Add Schedule
            </button>
          )}
        </div>
      </div>

      {/* Main Table Views */}
      <div className="overflow-hidden rounded-[24px] bg-white border border-sky-50 shadow-[0_10px_40px_rgba(3,105,161,0.03)]">
        {activeTab === 'schedules' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F0F7FA] text-slate-700 font-semibold border-b border-sky-50">
              <tr>
                <th className="px-5 py-3">Crop / Plant</th>
                <th className="px-5 py-3">Frequency</th>
                <th className="px-5 py-3">Watering Time</th>
                <th className="px-5 py-3">Water Quantity</th>
                <th className="px-5 py-3">Last Watered</th>
                <th className="px-5 py-3">Status</th>
                {isManager && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50">
              {filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={isManager ? 7 : 6} className="px-5 py-8 text-center text-slate-500">
                    No watering schedules defined.
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-semibold text-slate-800">{item.crop}</td>
                    <td className="px-5 py-3 text-slate-600">{item.frequency}</td>
                    <td className="px-5 py-3 font-medium text-slate-700">{item.time}</td>
                    <td className="px-5 py-3 font-semibold text-sky-800">{item.quantity}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {item.lastDone ? formatDate(item.lastDone) : 'Never watered'}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${
                          item.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : item.status === 'Due'
                            ? 'bg-amber-100 text-amber-800 border-amber-200 shadow-sm'
                            : 'bg-blue-100 text-blue-800 border-blue-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    {isManager && (
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50"
                            onClick={() => handleEditSchedule(item)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDeleteSchedule(item.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'history' && (
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F0F7FA] text-slate-700 font-semibold border-b border-sky-50">
              <tr>
                <th className="px-5 py-3">Watered Date</th>
                <th className="px-5 py-3">Crop / Plant</th>
                <th className="px-5 py-3">Time</th>
                <th className="px-5 py-3">Water Qty</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Gardener / Actor</th>
                <th className="px-5 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-50">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                    No watering records found in history.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 text-slate-600">{formatDate(item.date)}</td>
                    <td className="px-5 py-3 font-semibold text-slate-800">{item.crop}</td>
                    <td className="px-5 py-3 text-slate-700">{item.time}</td>
                    <td className="px-5 py-3 font-medium text-sky-800">{item.quantity}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-emerald-55 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 font-medium">{item.recordedByName || 'System'}</td>
                    <td className="px-5 py-3 text-xs text-slate-500 max-w-xs truncate" title={item.notes}>
                      {item.notes || '--'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* SCHEDULE MODAL */}
      {showScheduleModal && (
        <Modal
          title={scheduleForm.id ? 'Edit Watering Schedule' : 'Add Irrigation Schedule'}
          onClose={() => setShowScheduleModal(false)}
        >
          <form onSubmit={handleSaveSchedule} className="grid gap-4">
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <label className="text-sm font-medium text-slate-700">
              Crop Name *
              <select
                className="input-field mt-1 w-full"
                value={scheduleForm.crop}
                onChange={(e) => setScheduleForm({ ...scheduleForm, crop: e.target.value })}
                required
              >
                <option value="">Select Crop</option>
                {/* Fallback to text input if no crops exist */}
                {(crops.items || []).map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} {c.variety ? `(${c.variety})` : ''}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Watering Frequency *
                <select
                  className="input-field mt-1 w-full"
                  value={scheduleForm.frequency}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, frequency: e.target.value })}
                  required
                >
                  <option value="Daily">Daily</option>
                  <option value="Every 2 days">Every 2 days</option>
                  <option value="Every 3 days">Every 3 days</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Twice a week">Twice a week</option>
                </select>
              </label>

              <label className="text-sm font-medium text-slate-700">
                Watering Time *
                <input
                  type="time"
                  className="input-field mt-1 w-full"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                  required
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Water Quantity (e.g. 5 L) *
                <input
                  type="text"
                  placeholder="e.g. 5 L"
                  className="input-field mt-1 w-full"
                  value={scheduleForm.quantity}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, quantity: e.target.value })}
                  required
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Status *
                <select
                  className="input-field mt-1 w-full"
                  value={scheduleForm.status}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, status: e.target.value })}
                  required
                >
                  <option value="Due">Due</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                </select>
              </label>
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-sky-600 to-blue-500 py-3 font-semibold text-white shadow-md hover:from-sky-700 hover:to-blue-600"
            >
              Save Schedule
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

// ==========================================
// 2. GARDENER VIEW: /staff/record-irrigation
// ==========================================
export const RecordIrrigationPage = () => {
  const { irrigation, crops } = useStaff();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);

  const [logForm, setLogForm] = useState({
    scheduleId: '',
    crop: '',
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    quantity: '',
    notes: '',
  });

  const showNotice = (text) => {
    setNotice(text);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleWaterNow = (schedule) => {
    setLogForm({
      scheduleId: schedule.id,
      crop: schedule.crop,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      quantity: schedule.quantity,
      notes: '',
    });
    setError('');
    setShowLogModal(true);
  };

  const handleLogExtra = () => {
    const cropsList = crops.items || [];
    setLogForm({
      scheduleId: '',
      crop: cropsList?.[0]?.name || '',
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toTimeString().slice(0, 5),
      quantity: '5 L',
      notes: '',
    });
    setError('');
    setShowLogModal(true);
  };

  const handleSubmitWatering = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await irrigation.recordWatering(logForm);
      setShowLogModal(false);
      showNotice(`Successfully recorded watering for ${logForm.crop}!`);
    } catch (err) {
      setError(err.message || 'Failed to record watering');
    }
  };

  // Divide schedules into Due and others
  const dueSchedules = useMemo(() => {
    return (irrigation.items || []).filter((s) => s.status === 'Due');
  }, [irrigation.items]);

  const otherSchedules = useMemo(() => {
    return (irrigation.items || []).filter((s) => s.status !== 'Due');
  }, [irrigation.items]);

  return (
    <div className="space-y-6">
      <Hero
        kicker="Gardening Operations"
        title="Watering Logs & Execution"
        subtitle="View irrigation jobs due for today, check them off, or log extra waterings."
        icon={Droplets}
        action={
          <button
            type="button"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-sky-950 shadow-md hover:bg-sky-50"
            onClick={handleLogExtra}
          >
            + Log Extra Watering
          </button>
        }
      />

      <Toast notice={notice} />

      {/* Due Tasks section */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Info size={18} className="text-amber-500" />
          Watering Tasks Currently Due
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">Please check these off as you complete watering each crop area.</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dueSchedules.length === 0 ? (
            <div className="col-span-full rounded-2xl bg-sky-50 border border-sky-100 p-6 text-center text-sky-850">
              <Leaf className="mx-auto text-sky-400 mb-2" size={32} />
              <p className="font-semibold text-slate-800">All caught up!</p>
              <p className="text-sm text-slate-500 mt-1">No irrigation schedules are currently flagged as Due.</p>
            </div>
          ) : (
            dueSchedules.map((item) => (
              <article
                key={item.id}
                className="rounded-[24px] border border-amber-100 bg-gradient-to-br from-amber-50/45 to-white p-5 shadow-[0_10px_30px_rgba(245,158,11,0.03)] hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-slate-800 text-lg">{item.crop}</h3>
                    <span className="rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                      Due
                    </span>
                  </div>
                  <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-slate-400">Frequency:</span> {item.frequency}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-slate-400">Quantity:</span> {item.quantity}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium text-slate-400">Schedule Time:</span> {item.time}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 py-2.5 text-sm font-semibold text-white shadow-sm"
                  onClick={() => handleWaterNow(item)}
                >
                  <Check size={16} /> Water & Log
                </button>
              </article>
            ))
          )}
        </div>
      </div>

      {/* Other Schedules section */}
      <div className="pt-4">
        <h2 className="text-lg font-bold text-slate-850">Other Irrigation Schedules</h2>
        <div className="mt-3 overflow-hidden rounded-[20px] bg-white border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Crop</th>
                <th className="px-5 py-3">Frequency</th>
                <th className="px-5 py-3">Planned Time</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3">Last Completed</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {otherSchedules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-slate-500">
                    No other schedules defined.
                  </td>
                </tr>
              ) : (
                otherSchedules.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3 font-semibold text-slate-800">{item.crop}</td>
                    <td className="px-5 py-3 text-slate-500">{item.frequency}</td>
                    <td className="px-5 py-3 text-slate-600 font-medium">{item.time}</td>
                    <td className="px-5 py-3 text-slate-700 font-semibold">{item.quantity}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {item.lastDone ? formatDate(item.lastDone) : 'Never watered'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        className="text-xs font-semibold text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100/70 px-3 py-1.5 rounded-lg transition"
                        onClick={() => handleWaterNow(item)}
                      >
                        Water Again
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD WATERING DIALOG */}
      {showLogModal && (
        <Modal title={`Log Watering Execution`} onClose={() => setShowLogModal(false)}>
          <form onSubmit={handleSubmitWatering} className="grid gap-4">
            {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <label className="text-sm font-medium text-slate-700">
              Crop / Plant *
              <select
                className="input-field mt-1 w-full"
                value={logForm.crop}
                onChange={(e) => setLogForm({ ...logForm, crop: e.target.value })}
                required
                disabled={!!logForm.scheduleId}
              >
                <option value="">Select Crop</option>
                {(crops.items || []).map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} {c.variety ? `(${c.variety})` : ''}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Watering Date *
                <input
                  type="date"
                  className="input-field mt-1 w-full"
                  value={logForm.date}
                  onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                  required
                />
              </label>

              <label className="text-sm font-medium text-slate-700">
                Watering Time *
                <input
                  type="time"
                  className="input-field mt-1 w-full"
                  value={logForm.time}
                  onChange={(e) => setLogForm({ ...logForm, time: e.target.value })}
                  required
                />
              </label>
            </div>

            <label className="text-sm font-medium text-slate-700">
              Quantity Watered (e.g. 5 L) *
              <input
                type="text"
                placeholder="e.g. 5 L"
                className="input-field mt-1 w-full"
                value={logForm.quantity}
                onChange={(e) => setLogForm({ ...logForm, quantity: e.target.value })}
                required
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Watering Notes
              <textarea
                className="input-field mt-1 w-full h-20"
                placeholder="Soil moisture status, general observations, or issues with drip lines."
                value={logForm.notes}
                onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
              />
            </label>

            <button
              type="submit"
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-sky-600 to-blue-500 py-3 font-semibold text-white shadow-md hover:from-sky-700 hover:to-blue-600"
            >
              Submit Watering Record
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};
