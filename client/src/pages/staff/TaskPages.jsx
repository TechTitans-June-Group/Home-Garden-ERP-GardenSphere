import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Filter,
  Flower2,
  History,
  LayoutGrid,
  Leaf,
  List,
  MessageSquare,
  Plus,
  Search,
  Sparkles,
  Sprout,
  Sun,
  UserRound,
  Wheat,
  X,
} from 'lucide-react';
import { useStaff } from '../../context/StaffContext.jsx';
import { formatDate, formatDateTime } from '../../utils/format.js';
import {
  blankTask,
  dueTone,
  isAssignedTo,
  isTaskManager,
  isTaskOverdue,
  NEXT_TASK_STATUS,
  TASK_PRIORITIES,
  TASK_PRIORITY_STYLES,
  TASK_STATUS_STYLES,
  TASK_STATUSES,
} from '../../utils/tasks.js';

const STATUS_META = {
  Pending: {
    hint: 'Waiting to be planted',
    empty: 'No pending jobs. Create a task to start the bed.',
    icon: Sprout,
    nextLabel: 'Assign gardener',
    column: 'bg-gradient-to-b from-amber-50/90 to-white',
    accent: 'bg-amber-400',
    ring: 'ring-amber-200',
    iconWrap: 'bg-amber-100 text-amber-700',
  },
  Assigned: {
    hint: 'Ready for the gardener',
    empty: 'Nobody has been assigned yet.',
    icon: UserRound,
    nextLabel: 'Start work',
    column: 'bg-gradient-to-b from-sky-50/90 to-white',
    accent: 'bg-sky-400',
    ring: 'ring-sky-200',
    iconWrap: 'bg-sky-100 text-sky-700',
  },
  'In Progress': {
    hint: 'Hands in the soil',
    empty: 'Nothing growing in this column yet.',
    icon: Sun,
    nextLabel: 'Mark complete',
    column: 'bg-gradient-to-b from-orange-50/90 to-white',
    accent: 'bg-orange-400',
    ring: 'ring-orange-200',
    iconWrap: 'bg-orange-100 text-orange-700',
  },
  Completed: {
    hint: 'Harvested and logged',
    empty: 'Finished work will bloom here.',
    icon: Wheat,
    nextLabel: null,
    column: 'bg-gradient-to-b from-emerald-50/90 to-white',
    accent: 'bg-emerald-500',
    ring: 'ring-emerald-200',
    iconWrap: 'bg-emerald-100 text-emerald-700',
  },
};

const PRIORITY_BAR = {
  High: 'border-l-[5px] border-l-rose-400',
  Medium: 'border-l-[5px] border-l-amber-400',
  Low: 'border-l-[5px] border-l-slate-300',
};

const FLOW_STEPS = [
  { label: 'Pending', caption: 'Create', icon: Sprout },
  { label: 'Assigned', caption: 'Hand over', icon: UserRound },
  { label: 'In Progress', caption: 'Grow', icon: Sun },
  { label: 'Completed', caption: 'Harvest', icon: Wheat },
];

const initials = (name) =>
  (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

const dueLabel = (task) => {
  const tone = dueTone(task);
  if (tone === 'overdue') return 'Overdue';
  if (tone === 'today') return 'Due today';
  if (tone === 'tomorrow') return 'Due tomorrow';
  return task.due ? formatDate(task.due) : 'No due date';
};

const dueChip = (task) => {
  const tone = dueTone(task);
  if (tone === 'overdue') return 'bg-rose-50 text-rose-700';
  if (tone === 'today') return 'bg-amber-50 text-amber-800';
  if (tone === 'tomorrow') return 'bg-sky-50 text-sky-700';
  return 'bg-slate-50 text-slate-500';
};

const LeafMark = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 40c2-16 16-28 20-32 4 4 18 16 20 32-4 14-14 20-20 20S16 54 12 40z" />
  </svg>
);

const TaskWorkspace = ({ mineOnly = false }) => {
  const { staff, users, tasks } = useStaff();
  const manager = isTaskManager(staff.role);
  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dueFilter, setDueFilter] = useState('All');
  const [view, setView] = useState('board');
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [tab, setTab] = useState('details');
  const [comment, setComment] = useState('');
  const [notice, setNotice] = useState('');

  const assignees = users.items.filter(
    (user) => ['gardener', 'garden_manager', 'admin'].includes(user.role) && user.status !== 'Inactive'
  );

  const scoped = useMemo(
    () => (mineOnly ? tasks.items.filter((task) => isAssignedTo(task, staff)) : tasks.items),
    [mineOnly, staff, tasks.items]
  );

  const records = useMemo(() => {
    return scoped.filter((task) => {
      if (statusFilter !== 'All' && task.status !== statusFilter) return false;
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;
      if (assigneeFilter === 'Unassigned' && task.assigneeId) return false;
      if (assigneeFilter !== 'All' && assigneeFilter !== 'Unassigned' && task.assigneeId !== assigneeFilter) return false;
      if (dueFilter === 'Overdue' && dueTone(task) !== 'overdue') return false;
      if (dueFilter === 'Today' && dueTone(task) !== 'today') return false;
      const haystack = `${task.title} ${task.description} ${task.assignee}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });
  }, [assigneeFilter, dueFilter, priorityFilter, query, scoped, statusFilter]);

  const counts = useMemo(
    () => ({
      all: scoped.length,
      overdue: scoped.filter((task) => dueTone(task) === 'overdue').length,
      ...Object.fromEntries(TASK_STATUSES.map((status) => [status, scoped.filter((task) => task.status === status).length])),
    }),
    [scoped]
  );

  const stored = selectedId && selectedId !== 'new' ? tasks.items.find((task) => task.id === selectedId) : null;
  const selected = selectedId === 'new' ? draft : draft || stored;
  const canEditDetails = manager && Boolean(selected);
  const nextStatus = stored ? NEXT_TASK_STATUS[stored.status] : null;
  const canAdvance = Boolean(stored && nextStatus && (manager || isAssignedTo(stored, staff)));
  const commentCount = stored?.comments?.length || 0;
  const historyCount = stored?.history?.length || 0;
  const donePct = counts.all ? Math.round((counts.Completed / counts.all) * 100) : 0;
  const filtersOn =
    query || priorityFilter !== 'All' || assigneeFilter !== 'All' || statusFilter !== 'All' || dueFilter !== 'All';

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 2200);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!selectedId || selectedId === 'new') return;
    const current = tasks.items.find((task) => task.id === selectedId);
    if (!current) {
      setSelectedId(null);
      setDraft(null);
      return;
    }
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            status: current.status,
            completedAt: current.completedAt,
            assignee: current.assignee,
            comments: current.comments,
            history: current.history,
          }
        : current
    );
  }, [selectedId, tasks.items]);

  const flash = (message) => setNotice(message);

  const openCreate = () => {
    setDraft({ ...blankTask(), createdAt: new Date().toISOString() });
    setSelectedId('new');
    setTab('details');
    setComment('');
  };

  const openTask = (task, nextTab = 'details') => {
    setDraft({ ...task });
    setSelectedId(task.id);
    setTab(nextTab);
    setComment('');
  };

  const closeDrawer = () => {
    setSelectedId(null);
    setDraft(null);
    setComment('');
  };

  const updateDraftField = (name, value) => {
    if (selectedId !== 'new' && !manager) return;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  const saveDetails = (event) => {
    event.preventDefault();
    if (!manager || !draft?.title.trim()) return;
    const saved = tasks.save(draft);
    setSelectedId(saved.id);
    setDraft(saved);
    flash(selectedId === 'new' ? 'Task planted in the board' : 'Task updated');
  };

  const advanceTask = (task, event) => {
    event?.stopPropagation();
    const next = NEXT_TASK_STATUS[task.status];
    if (!next) return;
    if (!manager && !isAssignedTo(task, staff)) return;
    tasks.setStatus(task.id, next);
    flash(`Moved to ${next}`);
  };

  const submitComment = (event) => {
    event.preventDefault();
    if (!selected || selectedId === 'new' || !comment.trim()) return;
    tasks.addComment(selected.id, comment);
    setComment('');
    setTab('comments');
    flash('Note added');
  };

  const removeSelected = () => {
    if (!selected || selectedId === 'new') return;
    if (!window.confirm(`Delete “${selected.title}”? This cannot be undone.`)) return;
    tasks.remove(selected.id);
    closeDrawer();
    flash('Task deleted');
  };

  const canQuickAdvance = (task) =>
    Boolean(NEXT_TASK_STATUS[task.status] && (manager || isAssignedTo(task, staff)));

  const clearFilters = () => {
    setQuery('');
    setPriorityFilter('All');
    setAssigneeFilter('All');
    setStatusFilter('All');
    setDueFilter('All');
  };

  const renderTaskCard = (task) => {
    const meta = STATUS_META[task.status];
    return (
      <article
        key={task.id}
        className={`group rounded-2xl border border-white/80 bg-white p-4 shadow-[0_8px_24px_rgba(20,83,45,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(20,83,45,0.12)] ${
          PRIORITY_BAR[task.priority]
        } ${selected?.id === task.id ? 'ring-2 ring-emerald-400' : ''}`}
      >
        <button type="button" className="w-full text-left" onClick={() => openTask(task)}>
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold leading-5 text-slate-900">{task.title}</p>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TASK_PRIORITY_STYLES[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">
            {task.description || 'No description yet — tap to add one.'}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#14532D] text-[10px] font-bold text-white">
                {initials(task.assignee)}
              </span>
              {task.assignee || 'Unassigned'}
            </span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${dueChip(task)}`}>
              <Calendar size={11} />
              {dueLabel(task)}
            </span>
          </div>
        </button>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-emerald-50 pt-3">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-[#F3F7F1] px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-emerald-50"
            onClick={() => openTask(task, 'comments')}
          >
            <MessageSquare size={12} />
            {task.comments?.length || 0}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-[#F3F7F1] px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-emerald-50"
            onClick={() => openTask(task, 'history')}
          >
            <History size={12} />
            Log
          </button>
          {canQuickAdvance(task) && (
            <button
              type="button"
              className="ml-auto inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-[#16A34A] to-[#84CC16] px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:from-[#14532D] hover:to-[#15803D]"
              onClick={(event) => advanceTask(task, event)}
            >
              {meta.nextLabel}
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="relative pb-8">
      <LeafMark className="pointer-events-none absolute -right-4 top-8 h-24 w-24 text-emerald-400/15" />
      <LeafMark className="pointer-events-none absolute left-8 top-40 hidden h-16 w-16 text-lime-500/20 lg:block" />

      {notice && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(22,163,74,0.28)]">
          <CheckCircle2 size={16} />
          {notice}
        </div>
      )}

      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#14532D] via-[#15803D] to-[#84CC16] p-5 text-white shadow-[0_18px_40px_rgba(20,83,45,0.22)] sm:p-6">
        <div className="gs-dot-vine pointer-events-none absolute inset-0 opacity-20" />
        <LeafMark className="pointer-events-none absolute -bottom-6 -right-4 h-28 w-28 text-white/10" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em]">
              <Sparkles size={12} /> {mineOnly ? 'My garden jobs' : 'Garden task board'}
            </p>
            <h2 className="mt-3 font-display text-2xl leading-tight sm:text-3xl">
              {mineOnly ? `Hello ${staff.name.split(' ')[0]}, here’s your plot.` : 'Plan, assign, and watch the work bloom.'}
            </h2>
            <p className="mt-2 text-sm text-emerald-50/90">
              {mineOnly
                ? 'Open a card to leave a note, then tap the next step when the job is done.'
                : 'Create a job, hand it to a gardener, then move it through the beds until harvest.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-full bg-white/15 p-1 backdrop-blur">
              <button
                type="button"
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${
                  view === 'board' ? 'bg-white text-emerald-800' : 'text-white/80 hover:text-white'
                }`}
                onClick={() => setView('board')}
              >
                <LayoutGrid size={14} /> Board
              </button>
              <button
                type="button"
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${
                  view === 'list' ? 'bg-white text-emerald-800' : 'text-white/80 hover:text-white'
                }`}
                onClick={() => setView('list')}
              >
                <List size={14} /> List
              </button>
            </div>
            {manager && !mineOnly && (
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm hover:bg-lime-50"
                onClick={openCreate}
              >
                <Plus size={16} /> Create task
              </button>
            )}
          </div>
        </div>

        <div className="relative mt-5 grid gap-2 sm:grid-cols-4">
          {FLOW_STEPS.map((step, index) => {
            const Icon = step.icon;
            const active = statusFilter === step.label || statusFilter === 'All';
            return (
              <button
                key={step.label}
                type="button"
                onClick={() => setStatusFilter((prev) => (prev === step.label ? 'All' : step.label))}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition ${
                  statusFilter === step.label ? 'bg-white text-emerald-800' : 'bg-white/10 hover:bg-white/20'
                } ${!active && statusFilter !== 'All' ? 'opacity-60' : ''}`}
              >
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${statusFilter === step.label ? 'bg-emerald-100 text-emerald-700' : 'bg-white/15'}`}>
                  <Icon size={16} />
                </span>
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] opacity-70">
                    {index + 1}. {step.caption}
                  </span>
                  <span className="text-sm font-semibold">{step.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative mt-5">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-50/90">
            <span className="inline-flex items-center gap-1">
              <Flower2 size={12} /> Garden progress
            </span>
            <span>
              {counts.Completed}/{counts.all} complete · {donePct}%
            </span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-gradient-to-r from-lime-200 to-white transition-all"
              style={{ width: `${donePct}%` }}
            />
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['All', counts.all, 'Every bed', ClipboardList, 'bg-white', 'bg-emerald-100 text-emerald-700'],
          ...TASK_STATUSES.map((status) => [
            status,
            counts[status],
            STATUS_META[status].hint,
            STATUS_META[status].icon,
            'bg-white',
            STATUS_META[status].iconWrap,
          ]),
        ].map(([status, value, hint, Icon, bg, iconWrap]) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter((prev) => (prev === status ? 'All' : status))}
            className={`rounded-[24px] ${bg} px-4 py-4 text-left shadow-[0_10px_40px_rgba(20,83,45,0.06)] transition hover:-translate-y-0.5 ${
              statusFilter === status ? `ring-2 ring-emerald-400 ${STATUS_META[status]?.ring || 'ring-emerald-300'}` : 'hover:ring-1 hover:ring-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`grid h-9 w-9 place-items-center rounded-2xl ${iconWrap}`}>
                <Icon size={16} />
              </span>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{status}</p>
            <p className="mt-0.5 text-xs text-slate-500">{hint}</p>
          </button>
        ))}
      </div>

      {counts.overdue > 0 && (
        <button
          type="button"
          onClick={() => setDueFilter((prev) => (prev === 'Overdue' ? 'All' : 'Overdue'))}
          className={`mt-4 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold shadow-sm ${
            dueFilter === 'Overdue'
              ? 'bg-gradient-to-r from-rose-600 to-orange-500 text-white'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
          }`}
        >
          <span className={`grid h-9 w-9 place-items-center rounded-2xl ${dueFilter === 'Overdue' ? 'bg-white/20' : 'bg-white'}`}>
            <AlertTriangle size={16} />
          </span>
          <span>
            {counts.overdue} overdue task{counts.overdue === 1 ? '' : 's'} need attention.
            <span className="ml-1 font-medium opacity-80">
              {dueFilter === 'Overdue' ? 'Click to show all again.' : 'Click to focus on them.'}
            </span>
          </span>
        </button>
      )}

      <div className="mt-5 rounded-[24px] border border-emerald-50 bg-white/90 p-3 shadow-[0_10px_40px_rgba(20,83,45,0.05)] backdrop-blur sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            <Filter size={12} /> Find a job
          </p>
          {filtersOn && (
            <button type="button" className="text-xs font-semibold text-emerald-700 hover:underline" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="relative min-w-[220px] flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" />
            <input
              className="input-field pl-10"
              placeholder="Search by title, description, or person"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select className="input-field w-40" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
            <option value="All">All priorities</option>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          {!mineOnly && (
            <select className="input-field w-48" value={assigneeFilter} onChange={(event) => setAssigneeFilter(event.target.value)}>
              <option value="All">All people</option>
              <option value="Unassigned">Unassigned</option>
              {assignees.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          )}
          <select className="input-field w-40" value={dueFilter} onChange={(event) => setDueFilter(event.target.value)}>
            <option value="All">Any due date</option>
            <option value="Today">Due today</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {records.length === 0 && (
        <div className="relative mt-6 overflow-hidden rounded-[28px] bg-white px-6 py-14 text-center shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <div className="gs-dot-vine pointer-events-none absolute inset-0 opacity-40" />
          <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-emerald-50 text-emerald-600">
            <Leaf size={28} />
          </span>
          <p className="relative mt-4 text-lg font-semibold text-slate-900">This bed is empty</p>
          <p className="relative mt-1 text-sm text-slate-500">Clear a filter or plant a new garden task to get started.</p>
          {manager && !mineOnly && (
            <button type="button" className="btn-primary relative mt-5" onClick={openCreate}>
              <Plus size={16} /> Create task
            </button>
          )}
        </div>
      )}

      {view === 'board' && records.length > 0 && (
        <div className="-mx-1 mt-6 flex gap-4 overflow-x-auto pb-3 xl:grid xl:grid-cols-4 xl:overflow-visible">
          {TASK_STATUSES.filter((status) => statusFilter === 'All' || statusFilter === status).map((status) => {
            const column = records.filter((task) => task.status === status);
            const meta = STATUS_META[status];
            const Icon = meta.icon;
            return (
              <section
                key={status}
                className={`flex min-h-[300px] min-w-[260px] flex-1 flex-col rounded-[28px] p-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)] ${meta.column}`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`grid h-9 w-9 place-items-center rounded-2xl ${meta.iconWrap}`}>
                      <Icon size={16} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{status}</p>
                      <p className="text-[11px] text-slate-500">{meta.hint}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${TASK_STATUS_STYLES[status]}`}>{column.length}</span>
                </div>
                <div className={`mb-3 h-1 rounded-full ${meta.accent}`} />
                <div className="grid flex-1 content-start gap-3">
                  {column.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-emerald-200/80 bg-white/60 px-3 py-10 text-center text-sm text-slate-400">
                      {meta.empty}
                    </p>
                  )}
                  {column.map(renderTaskCard)}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {view === 'list' && records.length > 0 && (
        <div className="mt-6 grid gap-3">
          {records.map((task) => (
            <article
              key={task.id}
              className={`flex flex-col gap-3 rounded-[24px] border border-white bg-white p-4 shadow-[0_8px_24px_rgba(20,83,45,0.06)] sm:flex-row sm:items-center ${PRIORITY_BAR[task.priority]}`}
            >
              <button type="button" className="min-w-0 flex-1 text-left" onClick={() => openTask(task)}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-900">{task.title}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TASK_STATUS_STYLES[task.status]}`}>
                    {task.status}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">{task.description || 'No description'}</p>
              </button>
              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-[#14532D] text-[10px] font-bold text-white">
                    {initials(task.assignee)}
                  </span>
                  {task.assignee || 'Unassigned'}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TASK_PRIORITY_STYLES[task.priority]}`}>
                  {task.priority}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${dueChip(task)}`}>{dueLabel(task)}</span>
                <button type="button" className="text-xs font-semibold text-emerald-700" onClick={() => openTask(task, 'comments')}>
                  {task.comments?.length || 0} notes
                </button>
                {canQuickAdvance(task) && (
                  <button
                    type="button"
                    className="rounded-full bg-[#16A34A] px-3 py-1.5 text-[11px] font-semibold text-white"
                    onClick={(event) => advanceTask(task, event)}
                  >
                    {STATUS_META[task.status].nextLabel}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-[#14331f]/45 backdrop-blur-[2px]" onClick={closeDrawer} role="presentation">
          <aside
            className="flex h-full w-full max-w-xl flex-col bg-[#F8FBF6] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-[#14532D] via-[#15803D] to-[#84CC16] px-6 py-5 text-white">
              <LeafMark className="pointer-events-none absolute -right-4 -top-6 h-24 w-24 text-white/10" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-lime-100">
                    <Leaf size={12} />
                    {selectedId === 'new' ? 'New garden task' : selected.status}
                  </p>
                  <h2 className="mt-1 font-display text-2xl leading-tight">{selected.title || 'Plant a new job'}</h2>
                </div>
                <button type="button" className="rounded-full bg-white/15 p-2 hover:bg-white/25" onClick={closeDrawer} aria-label="Close">
                  <X size={18} />
                </button>
              </div>
            </div>

            {selectedId !== 'new' && (
              <div className="grid grid-cols-4 gap-2 bg-white px-6 py-4">
                {TASK_STATUSES.map((status, index) => {
                  const currentIndex = TASK_STATUSES.indexOf(stored?.status || selected.status);
                  const reached = index <= currentIndex;
                  const Icon = STATUS_META[status].icon;
                  return (
                    <div key={status} className="text-center">
                      <span
                        className={`mx-auto grid h-8 w-8 place-items-center rounded-full ${
                          reached ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <Icon size={14} />
                      </span>
                      <div className={`mx-auto mt-2 h-1.5 w-full rounded-full ${reached ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      <p className={`mt-2 text-[10px] font-semibold ${status === stored?.status ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {status}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-2 bg-white px-6 py-3">
              {[
                ['details', 'Details', ClipboardList, null],
                ['comments', 'Notes', MessageSquare, commentCount],
                ['history', 'History', History, historyCount],
              ].map(([key, label, Icon, count]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  disabled={selectedId === 'new' && key !== 'details'}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${
                    tab === key ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500 hover:bg-slate-50'
                  } disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  <Icon size={14} /> {label}
                  {count ? <span className="rounded-full bg-white px-1.5 text-[11px]">{count}</span> : null}
                </button>
              ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {tab === 'details' && (
                <form className="grid gap-3" onSubmit={saveDetails}>
                  <label className="text-sm font-medium">
                    Task title
                    <input
                      className="input-field mt-1"
                      value={selected.title}
                      onChange={(event) => updateDraftField('title', event.target.value)}
                      required
                      readOnly={!canEditDetails && selectedId !== 'new'}
                      placeholder="e.g. Water Bed A1"
                    />
                  </label>
                  <label className="text-sm font-medium">
                    Description
                    <textarea
                      className="input-field mt-1 min-h-28"
                      value={selected.description}
                      onChange={(event) => updateDraftField('description', event.target.value)}
                      readOnly={!canEditDetails && selectedId !== 'new'}
                      placeholder="What should be done in the garden?"
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-medium">
                      Assign to
                      <select
                        className="input-field mt-1"
                        value={selected.assigneeId}
                        onChange={(event) => updateDraftField('assigneeId', event.target.value)}
                        disabled={!canEditDetails && selectedId !== 'new'}
                      >
                        <option value="">Unassigned</option>
                        {assignees.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm font-medium">
                      Priority
                      <select
                        className="input-field mt-1"
                        value={selected.priority}
                        onChange={(event) => updateDraftField('priority', event.target.value)}
                        disabled={!canEditDetails && selectedId !== 'new'}
                      >
                        {TASK_PRIORITIES.map((priority) => (
                          <option key={priority} value={priority}>
                            {priority}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm font-medium">
                      Due date
                      <input
                        type="date"
                        className="input-field mt-1"
                        value={selected.due}
                        onChange={(event) => updateDraftField('due', event.target.value)}
                        readOnly={!canEditDetails && selectedId !== 'new'}
                      />
                    </label>
                    <label className="text-sm font-medium">
                      Status
                      <select
                        className="input-field mt-1"
                        value={selected.status}
                        onChange={(event) => updateDraftField('status', event.target.value)}
                        disabled={!canEditDetails && selectedId !== 'new'}
                      >
                        {TASK_STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {selected.status === 'Completed' && selected.completedAt && (
                    <p className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                      <CheckCircle2 size={16} /> Completed {formatDateTime(selected.completedAt)}
                    </p>
                  )}
                  {isTaskOverdue(selected) && (
                    <p className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                      <AlertTriangle size={16} /> This task is overdue.
                    </p>
                  )}

                  {canEditDetails && (
                    <div className="mt-2 flex gap-3">
                      <button type="button" className="btn-secondary flex-1" onClick={closeDrawer}>
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary flex-1">
                        {selectedId === 'new' ? 'Save task' : 'Save changes'}
                      </button>
                    </div>
                  )}
                </form>
              )}

              {tab === 'comments' && selectedId !== 'new' && (
                <div>
                  <p className="mb-3 text-sm text-slate-500">Leave a note for the gardener or manager. Everyone on this task can see it.</p>
                  <div className="grid gap-3">
                    {(stored?.comments || []).length === 0 && (
                      <p className="rounded-2xl border border-dashed border-emerald-100 bg-white px-4 py-8 text-center text-sm text-slate-400">
                        No notes yet. Add the first update below.
                      </p>
                    )}
                    {(stored?.comments || []).map((entry) => (
                      <article key={entry.id} className="rounded-2xl bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#14532D] text-[10px] font-bold text-white">
                              {initials(entry.authorName)}
                            </span>
                            {entry.authorName}
                          </p>
                          <p className="text-xs text-slate-400">{formatDateTime(entry.createdAt)}</p>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{entry.text}</p>
                      </article>
                    ))}
                  </div>
                  <form className="mt-4 grid gap-3" onSubmit={submitComment}>
                    <textarea
                      className="input-field min-h-24"
                      placeholder="Example: Bed A1 is watered. A3 still needs work."
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                    />
                    <button type="submit" className="btn-primary justify-self-end" disabled={!comment.trim()}>
                      Add note
                    </button>
                  </form>
                </div>
              )}

              {tab === 'history' && selectedId !== 'new' && (
                <ol className="relative grid gap-3 border-l-2 border-emerald-100 pl-4">
                  {(stored?.history || selected.history || []).length === 0 && (
                    <p className="rounded-2xl border border-dashed border-emerald-100 bg-white px-4 py-8 text-center text-sm text-slate-400">
                      History will appear here after the task is created, assigned, or updated.
                    </p>
                  )}
                  {(stored?.history || selected.history || []).map((entry) => (
                    <li key={entry.id} className="relative rounded-2xl border border-emerald-50 bg-white p-4">
                      <span className="absolute -left-[23px] top-5 h-3 w-3 rounded-full bg-emerald-500" />
                      <p className="text-sm font-semibold text-slate-900">{entry.action}</p>
                      <p className="mt-1 text-sm text-slate-600">{entry.detail}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        {entry.actorName} · {formatDateTime(entry.at)}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {selectedId !== 'new' && (
              <div className="flex flex-wrap gap-3 border-t border-emerald-100 bg-white px-6 py-4">
                {canAdvance && (
                  <button type="button" className="btn-primary" onClick={() => advanceTask(stored)}>
                    {STATUS_META[stored.status].nextLabel} <ArrowRight size={16} />
                  </button>
                )}
                <button type="button" className="btn-secondary" onClick={() => setTab('comments')}>
                  <MessageSquare size={16} /> Note
                </button>
                {manager && (
                  <button type="button" className="btn-secondary text-red-600 hover:bg-red-50" onClick={removeSelected}>
                    Delete
                  </button>
                )}
                <button type="button" className="btn-secondary ml-auto" onClick={closeDrawer}>
                  Close
                </button>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};

export const TasksPage = () => <TaskWorkspace />;

export const MyTasksPage = () => <TaskWorkspace mineOnly />;
