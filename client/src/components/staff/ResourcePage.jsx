import FormModal, { useResourceForm } from './FormModal.jsx';

const ResourcePage = ({ title, subtitle, columns, records, fields, defaults, onSave, onDelete, statusKey }) => {
  const form = useResourceForm(defaults);
  const palette = {
    Active: 'bg-emerald-100 text-emerald-800',
    Completed: 'bg-emerald-100 text-emerald-800',
    Done: 'bg-emerald-100 text-emerald-800',
    Received: 'bg-emerald-100 text-emerald-800',
    Resolved: 'bg-emerald-100 text-emerald-800',
    Applied: 'bg-emerald-100 text-emerald-800',
    Confirmed: 'bg-sky-100 text-sky-800',
    Assigned: 'bg-sky-100 text-sky-800',
    Ordered: 'bg-sky-100 text-sky-800',
    Pending: 'bg-yellow-100 text-yellow-800',
    Due: 'bg-yellow-100 text-yellow-800',
    Scheduled: 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-orange-100 text-orange-800',
    Inactive: 'bg-red-100 text-red-700',
    Cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center rounded-full bg-gradient-to-r from-[#16A34A] to-[#84CC16] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(22,163,74,0.25)]"
          onClick={form.startCreate}
        >
          + Add record
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-[28px] bg-white shadow-[0_10px_40px_rgba(20,83,45,0.06)]">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-[#F3F7F1] text-slate-700">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-semibold">
                  {column.label}
                </th>
              ))}
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="border-t border-emerald-50">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3">
                    {column.key === statusKey && record[column.key] ? (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${palette[record[column.key]] || 'bg-slate-100'}`}>
                        {record[column.key]}
                      </span>
                    ) : (
                      record[column.key]
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" className="font-semibold text-gs-primary" onClick={() => form.startEdit(record)}>
                      Edit
                    </button>
                    {onDelete && (
                      <button type="button" className="font-semibold text-red-600" onClick={() => onDelete(record.id)}>
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormModal
        open={form.open}
        title={form.values.id ? `Edit ${title}` : `Add ${title}`}
        fields={fields}
        values={form.values}
        onChange={form.change}
        onClose={() => form.setOpen(false)}
        onSubmit={(event) => {
          event.preventDefault();
          onSave(form.values);
          form.setOpen(false);
        }}
      />
    </div>
  );
};

export default ResourcePage;
