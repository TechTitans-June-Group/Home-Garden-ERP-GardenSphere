import { useState } from 'react';

const FormModal = ({ open, title, fields, values, onChange, onClose, onSubmit }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-gs-deep/40 px-4">
      <form onSubmit={onSubmit} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-card">
        <h2 className="font-display text-2xl">{title}</h2>
        <div className="mt-4 grid gap-3">
          {fields.map((field) => (
            <label key={field.name} className="text-sm font-medium">
              {field.label}
              {field.type === 'select' ? (
                <select
                  className="input-field mt-1"
                  value={values[field.name] || ''}
                  onChange={(event) => onChange(field.name, event.target.value)}
                  required={field.required !== false}
                >
                  <option value="">Select</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  className="input-field mt-1"
                  value={values[field.name] || ''}
                  onChange={(event) => onChange(field.name, event.target.value)}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  className="input-field mt-1"
                  value={values[field.name] || ''}
                  onChange={(event) => onChange(field.name, event.target.value)}
                  required={field.required !== false}
                />
              )}
            </label>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" className="btn-primary flex-1">
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export const useResourceForm = (defaults) => {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(defaults);

  const change = (name, value) => setValues((prev) => ({ ...prev, [name]: value }));
  const startCreate = () => {
    setValues(defaults);
    setOpen(true);
  };
  const startEdit = (record) => {
    setValues(record);
    setOpen(true);
  };

  return { open, setOpen, values, change, startCreate, startEdit };
};

export default FormModal;
