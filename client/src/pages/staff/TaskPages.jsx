import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ClipboardList,
  History,
  LayoutGrid,
  List,
  MessageSquare,
  Plus,
  Search,
  UserRound,
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

const COLUMN_HINT = {
  Pending: 'Create and assign work',
  Assigned: 'Ready for the gardener',
  'In Progress': 'Being done in the garden',
  Completed: 'Finished and recorded',
};

const dueLabel = (task) => {
  const tone = dueTone(task);
  if (tone === 'overdue') return 'Overdue';
  if (tone === 'today') return 'Due today';
  if (tone === 'tomorrow') return 'Due tomorrow';
  return task.due ? formatDate(task.due) : 'No due date';
};

const dueClass = (task) => {
  const tone = dueTone(task);
  if (tone === 'overdue') return 'font-semibold text-red-600';
  if (tone === 'today') return 'font-semibold text-amber-700';
  return 'text-slate-500';
};

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
    flash(selectedId === 'new' ? 'Task created' : 'Task updated');
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
    flash('Comment added');
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

  return (
    <div>
      {notice && (
        <div className="mb-4 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm">
          {notice}
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            {mineOnly
              ? 'Open a card to comment, then tap the next step when the work is done.'
              : 'Create work, assign a gardener, then move it Pending → Assigned → In Progress → Completed.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full bg-white p-1 shadow-sm">
            <button
              type="button"
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${view === 'board' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500'}`}
              onClick={() => setView('board')}
            >
              <LayoutGrid size={14} /> Board
            </button>
            <button
              type="button"
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold ${view === 'list' ? 'bg-emerald-100 text-emerald-800' : 'text-slate-500'}`}
              onClick={() => setView('list')}
            >
              <List size={14} /> List
            </button>
          </div>
          {manager && !mineOnly && (
            <button type="button" className="btn-primary" onClick={openCreate}>
              <Plus size={16} /> Create task
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['All', counts.all, 'All tasks'],
          ...TASK_STATUSES.map((status) => [status, counts[status], COLUMN_HINT[status]]),
        ].map(([status, value, hint]) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter((prev) => (prev === status ? 'All' : status))}
            className={`rounded-[24px] bg-white px-5 py-4 text-left shadow-[0_10px_40px_rgba(20,83,45,0.06)] transition ${
              statusFilter === status ? 'ring-2 ring-emerald-400' : 'hover:ring-1 hover:ring-emerald-200'
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{status}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{hint}</p>
          </button>
        ))}
      </div>

      {counts.overdue > 0 && (
        <button
          type="button"
          onClick={() => setDueFilter((prev) => (prev === 'Overdue' ? 'All' : 'Overdue'))}
          className={`mt-4 w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
            dueFilter === 'Overdue' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          {counts.overdue} overdue task{counts.overdue === 1 ? '' : 's'} — click to {dueFilter === 'Overdue' ? 'show all' : 'focus on them'}
        </button>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <label className="relative min-w-[220px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
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

      {records.length === 0 && (
        <div className="mt-6 rounded-[28px] bg-white px-6 py-12 text-center shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <ClipboardList className="mx-auto text-emerald-500" size={32} />
          <p className="mt-3 text-lg font-semibold text-slate-900">No tasks match these filters</p>
          <p className="mt-1 text-sm text-slate-500">Clear a filter or create a new garden task to get started.</p>
          {manager && !mineOnly && (
            <button type="button" className="btn-primary mt-4" onClick={openCreate}>
              <Plus size={16} /> Create task
            </button>
          )}
        </div>
      )}

      {view === 'board' && records.length > 0 && (
        <div className="mt-6 grid gap-4 xl:grid-cols-4">
          {TASK_STATUSES.filter((status) => statusFilter === 'All' || statusFilter === status).map((status) => {
            const column = records.filter((task) => task.status === status);
            return (
              <section key={status} className="flex min-h-[280px] flex-col rounded-[28px] bg-white p-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
                <div className="mb-3">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TASK_STATUS_STYLES[status]}`}>{status}</span>
                    <span className="text-xs font-semibold text-slate-400">{column.length}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{COLUMN_HINT[status]}</p>
                </div>
                <div className="grid flex-1 content-start gap-3">
                  {column.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-emerald-100 px-3 py-8 text-center text-sm text-slate-400">
                      Nothing here yet
                    </p>
                  )}
                  {column.map((task) => (
                    <article
                      key={task.id}
                      className={`rounded-2xl border p-4 transition hover:border-emerald-200 hover:shadow-sm ${
                        selected?.id === task.id ? 'border-emerald-400 bg-emerald-50/70' : 'border-emerald-50 bg-[#F8FBF6]'
                      }`}
                    >
                      <button type="button" className="w-full text-left" onClick={() => openTask(task)}>
                        <p className="font-semibold text-slate-900">{task.title}</p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {task.description || 'No description yet. Open to add one.'}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TASK_PRIORITY_STYLES[task.priority]}`}>
                            {task.priority}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                            <UserRound size={12} />
                            {task.assignee || 'Unassigned'}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[11px] ${dueClass(task)}`}>
                            <Calendar size={12} />
                            {dueLabel(task)}
                          </span>
                        </div>
                      </button>
                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-emerald-100/80 pt-3">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-emerald-50"
                          onClick={() => openTask(task, 'comments')}
                        >
                          <MessageSquare size={12} />
                          {task.comments?.length || 0} comments
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-emerald-50"
                          onClick={() => openTask(task, 'history')}
                        >
                          <History size={12} />
                          History
                        </button>
                        {canQuickAdvance(task) && (
                          <button
                            type="button"
                            className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#16A34A] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#14532D]"
                            onClick={(event) => advanceTask(task, event)}
                          >
                            {NEXT_TASK_STATUS[task.status]}
                            <ArrowRight size={12} />
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {view === 'list' && records.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-[28px] bg-white shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#F3F7F1] text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Task</th>
                <th className="px-4 py-3 font-semibold">Assignee</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Due</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Comments</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((task) => (
                <tr key={task.id} className="border-t border-emerald-50">
                  <td className="px-4 py-3">
                    <button type="button" className="text-left font-semibold text-slate-900 hover:text-emerald-700" onClick={() => openTask(task)}>
                      {task.title}
                    </button>
                    <p className="mt-1 line-clamp-1 text-xs text-slate-500">{task.description || 'No description'}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{task.assignee || 'Unassigned'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TASK_PRIORITY_STYLES[task.priority]}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className={`px-4 py-3 ${dueClass(task)}`}>{dueLabel(task)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TASK_STATUS_STYLES[task.status]}`}>{task.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" className="font-semibold text-emerald-700" onClick={() => openTask(task, 'comments')}>
                      {task.comments?.length || 0}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className="font-semibold text-gs-primary" onClick={() => openTask(task)}>
                        Open
                      </button>
                      {canQuickAdvance(task) && (
                        <button type="button" className="font-semibold text-emerald-700" onClick={(event) => advanceTask(task, event)}>
                          {NEXT_TASK_STATUS[task.status]}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-gs-deep/40" onClick={closeDrawer} role="presentation">
          <aside className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <div className="flex items-start justify-between gap-3 border-b border-emerald-50 px-6 py-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                  {selectedId === 'new' ? 'New task' : selected.status}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">{selected.title || 'Create a garden task'}</h2>
              </div>
              <button type="button" className="rounded-full p-2 text-slate-500 hover:bg-slate-50" onClick={closeDrawer} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            {selectedId !== 'new' && (
              <div className="grid grid-cols-4 gap-2 border-b border-emerald-50 px-6 py-4">
                {TASK_STATUSES.map((status, index) => {
                  const currentIndex = TASK_STATUSES.indexOf(stored?.status || selected.status);
                  const reached = index <= currentIndex;
                  return (
                    <div key={status} className="text-center">
                      <div className={`mx-auto h-2 rounded-full ${reached ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                      <p className={`mt-2 text-[10px] font-semibold ${status === stored?.status ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {status}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-2 border-b border-emerald-50 px-6 py-3">
              {[
                ['details', 'Details', ClipboardList, null],
                ['comments', 'Comments', MessageSquare, commentCount],
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
                    <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">This task is overdue.</p>
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
                      <p className="rounded-2xl border border-dashed border-emerald-100 px-4 py-8 text-center text-sm text-slate-400">
                        No comments yet. Add the first update below.
                      </p>
                    )}
                    {(stored?.comments || []).map((entry) => (
                      <article key={entry.id} className="rounded-2xl bg-[#F8FBF6] p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">{entry.authorName}</p>
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
                      Add comment
                    </button>
                  </form>
                </div>
              )}

              {tab === 'history' && selectedId !== 'new' && (
                <ol className="relative grid gap-3 border-l-2 border-emerald-100 pl-4">
                  {(stored?.history || selected.history || []).length === 0 && (
                    <p className="rounded-2xl border border-dashed border-emerald-100 px-4 py-8 text-center text-sm text-slate-400">
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
              <div className="flex flex-wrap gap-3 border-t border-emerald-50 px-6 py-4">
                {canAdvance && (
                  <button type="button" className="btn-primary" onClick={() => advanceTask(stored)}>
                    Move to {nextStatus} <ArrowRight size={16} />
                  </button>
                )}
                <button type="button" className="btn-secondary" onClick={() => setTab('comments')}>
                  <MessageSquare size={16} /> Comment
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
