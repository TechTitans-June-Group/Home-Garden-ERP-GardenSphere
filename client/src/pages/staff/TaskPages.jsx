import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  Flag,
  History,
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
  isAssignedTo,
  isTaskManager,
  isTaskOverdue,
  NEXT_TASK_STATUS,
  TASK_PRIORITIES,
  TASK_PRIORITY_STYLES,
  TASK_STATUS_STYLES,
  TASK_STATUSES,
} from '../../utils/tasks.js';

const TaskWorkspace = ({ mineOnly = false }) => {
  const { staff, users, tasks } = useStaff();
  const manager = isTaskManager(staff.role);
  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null);
  const [tab, setTab] = useState('details');
  const [comment, setComment] = useState('');

  const assignees = users.items.filter(
    (user) => ['gardener', 'garden_manager', 'admin'].includes(user.role) && user.status !== 'Inactive'
  );

  const records = useMemo(() => {
    return tasks.items.filter((task) => {
      if (mineOnly && !isAssignedTo(task, staff)) return false;
      if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;
      const haystack = `${task.title} ${task.description} ${task.assignee}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });
  }, [mineOnly, priorityFilter, query, staff, tasks.items]);

  const stored = selectedId && selectedId !== 'new' ? tasks.items.find((task) => task.id === selectedId) : null;
  const selected = selectedId === 'new' ? draft : draft || stored;
  const canEditDetails = manager && Boolean(selected);
  const nextStatus = stored ? NEXT_TASK_STATUS[stored.status] : null;
  const canAdvance = Boolean(stored && nextStatus && (manager || isAssignedTo(stored, staff)));

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

  const openCreate = () => {
    setDraft({ ...blankTask(), createdAt: new Date().toISOString() });
    setSelectedId('new');
    setTab('details');
    setComment('');
  };

  const openTask = (task) => {
    setDraft(null);
    setSelectedId(task.id);
    setTab('details');
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
  };

  const submitComment = (event) => {
    event.preventDefault();
    if (!selected || selectedId === 'new' || !comment.trim()) return;
    tasks.addComment(selected.id, comment);
    setComment('');
    setTab('comments');
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{mineOnly ? 'My Tasks' : 'Task Management'}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {mineOnly
              ? 'View assigned garden work, add comments, and move tasks from assigned to completed.'
              : 'Create, assign, and track daily gardening tasks from pending through completion.'}
          </p>
        </div>
        {manager && !mineOnly && (
          <button type="button" className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Create task
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {TASK_STATUSES.map((status) => (
          <article key={status} className="rounded-[24px] bg-white px-5 py-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{status}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {records.filter((task) => task.status === status).length}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <label className="relative min-w-[220px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input-field pl-10"
            placeholder="Search tasks, descriptions, or assignees"
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
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-4">
        {TASK_STATUSES.map((status) => {
          const column = records.filter((task) => task.status === status);
          return (
            <section key={status} className="rounded-[28px] bg-white p-4 shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
              <div className="mb-3 flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TASK_STATUS_STYLES[status]}`}>{status}</span>
                <span className="text-xs font-semibold text-slate-400">{column.length}</span>
              </div>
              <div className="grid gap-3">
                {column.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-emerald-100 px-3 py-6 text-center text-sm text-slate-400">
                    No tasks
                  </p>
                )}
                {column.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => openTask(task)}
                    className={`rounded-2xl border p-4 text-left transition hover:border-emerald-200 hover:shadow-sm ${
                      selected?.id === task.id ? 'border-emerald-400 bg-emerald-50/70' : 'border-emerald-50 bg-[#F8FBF6]'
                    }`}
                  >
                    <p className="font-semibold text-slate-900">{task.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{task.description || 'No description yet.'}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${TASK_PRIORITY_STYLES[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                        <UserRound size={12} />
                        {task.assignee || 'Unassigned'}
                      </span>
                      {task.due && (
                        <span className={`inline-flex items-center gap-1 text-[11px] ${isTaskOverdue(task) ? 'font-semibold text-red-600' : 'text-slate-500'}`}>
                          <Calendar size={12} />
                          {formatDate(task.due)}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-gs-deep/40">
          <aside className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-emerald-50 px-6 py-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                  {selectedId === 'new' ? 'New task' : selected.status}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">{selected.title || 'Create a garden task'}</h2>
              </div>
              <button type="button" className="rounded-full p-2 text-slate-500 hover:bg-slate-50" onClick={closeDrawer}>
                <X size={18} />
              </button>
            </div>

            <div className="flex gap-2 border-b border-emerald-50 px-6 py-3">
              {[
                ['details', 'Details', ClipboardList],
                ['comments', 'Comments', MessageSquare],
                ['history', 'History', History],
              ].map(([key, label, Icon]) => (
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
                  <div className="grid gap-3">
                    {(stored?.comments || []).length === 0 && (
                      <p className="rounded-2xl border border-dashed border-emerald-100 px-4 py-8 text-center text-sm text-slate-400">
                        No comments yet.
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
                      placeholder="Add a comment about this task"
                      value={comment}
                      onChange={(event) => setComment(event.target.value)}
                    />
                    <button type="submit" className="btn-primary justify-self-end">
                      Add comment
                    </button>
                  </form>
                </div>
              )}

              {tab === 'history' && selectedId !== 'new' && (
                <ol className="grid gap-3">
                  {(stored?.history || selected.history || []).length === 0 && (
                    <p className="rounded-2xl border border-dashed border-emerald-100 px-4 py-8 text-center text-sm text-slate-400">
                      No history recorded yet.
                    </p>
                  )}
                  {(stored?.history || selected.history || []).map((entry) => (
                    <li key={entry.id} className="rounded-2xl border border-emerald-50 p-4">
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
                  <button type="button" className="btn-primary" onClick={() => tasks.setStatus(selected.id, nextStatus)}>
                    <Flag size={16} /> Mark {nextStatus}
                  </button>
                )}
                {manager && (
                  <button
                    type="button"
                    className="btn-secondary text-red-600 hover:bg-red-50"
                    onClick={() => {
                      tasks.remove(selected.id);
                      closeDrawer();
                    }}
                  >
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
