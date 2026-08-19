import ResourcePage from '../../components/staff/ResourcePage.jsx';
import { useStaff } from '../../context/StaffContext.jsx';
import { formatPrice } from '../../utils/format.js';

export const CropsPage = () => {
  const { crops } = useStaff();
  return (
    <ResourcePage
      title="Manage Crops"
      subtitle="Plant records, locations, growth stages, and crop status."
      records={crops.items}
      onSave={crops.save}
      onDelete={crops.remove}
      statusKey="status"
      defaults={{ name: '', variety: '', location: '', planted: '', quantity: '', stage: 'Growing', status: 'Active' }}
      columns={[
        { key: 'name', label: 'Crop' },
        { key: 'variety', label: 'Variety' },
        { key: 'location', label: 'Location' },
        { key: 'planted', label: 'Planted' },
        { key: 'quantity', label: 'Qty' },
        { key: 'stage', label: 'Stage' },
        { key: 'status', label: 'Status' },
      ]}
      fields={[
        { name: 'name', label: 'Crop name' },
        { name: 'variety', label: 'Variety' },
        { name: 'location', label: 'Location' },
        { name: 'planted', label: 'Planting date', type: 'date' },
        { name: 'quantity', label: 'Quantity', type: 'number' },
        { name: 'stage', label: 'Growth stage', type: 'select', options: ['Seedling', 'Growing', 'Fruiting', 'Ready', 'Harvesting'] },
        { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
      ]}
    />
  );
};

export const IrrigationPage = () => {
  const { irrigation } = useStaff();
  return (
    <ResourcePage
      title="Manage Irrigation"
      subtitle="Schedules, watering quantity, and completed watering records."
      records={irrigation.items}
      onSave={irrigation.save}
      onDelete={irrigation.remove}
      statusKey="status"
      defaults={{ crop: '', schedule: 'Daily', time: '07:00', quantity: '', lastDone: '', status: 'Due' }}
      columns={[
        { key: 'crop', label: 'Crop' },
        { key: 'schedule', label: 'Schedule' },
        { key: 'time', label: 'Time' },
        { key: 'quantity', label: 'Water qty' },
        { key: 'lastDone', label: 'Last done' },
        { key: 'status', label: 'Status' },
      ]}
      fields={[
        { name: 'crop', label: 'Crop' },
        { name: 'schedule', label: 'Frequency' },
        { name: 'time', label: 'Time', type: 'time' },
        { name: 'quantity', label: 'Quantity' },
        { name: 'lastDone', label: 'Last completed', type: 'date' },
        { name: 'status', label: 'Status', type: 'select', options: ['Due', 'Completed'] },
      ]}
    />
  );
};

export const FertilizersPage = () => {
  const { fertilizers } = useStaff();
  return (
    <ResourcePage
      title="Manage Fertilizers"
      subtitle="Applications, quantities, costs, and crop assignments."
      records={fertilizers.items}
      onSave={fertilizers.save}
      onDelete={fertilizers.remove}
      statusKey="status"
      defaults={{ name: '', crop: '', date: '', quantity: '', cost: '', status: 'Scheduled' }}
      columns={[
        { key: 'name', label: 'Fertilizer' },
        { key: 'crop', label: 'Crop' },
        { key: 'date', label: 'Date' },
        { key: 'quantity', label: 'Qty' },
        { key: 'cost', label: 'Cost' },
        { key: 'status', label: 'Status' },
      ]}
      fields={[
        { name: 'name', label: 'Fertilizer' },
        { name: 'crop', label: 'Crop' },
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'quantity', label: 'Quantity' },
        { name: 'cost', label: 'Cost', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'Applied'] },
      ]}
    />
  );
};

export const PestsPage = () => {
  const { pests } = useStaff();
  return (
    <ResourcePage
      title="Manage Pests / Diseases"
      subtitle="Incidents, severity, treatments, and follow-up status."
      records={pests.items}
      onSave={pests.save}
      onDelete={pests.remove}
      statusKey="status"
      defaults={{ issue: '', crop: '', severity: 'Low', date: '', treatment: '', status: 'In Progress' }}
      columns={[
        { key: 'issue', label: 'Issue' },
        { key: 'crop', label: 'Crop' },
        { key: 'severity', label: 'Severity' },
        { key: 'date', label: 'Detected' },
        { key: 'treatment', label: 'Treatment' },
        { key: 'status', label: 'Status' },
      ]}
      fields={[
        { name: 'issue', label: 'Pest / disease' },
        { name: 'crop', label: 'Affected crop' },
        { name: 'severity', label: 'Severity', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
        { name: 'date', label: 'Detection date', type: 'date' },
        { name: 'treatment', label: 'Treatment' },
        { name: 'status', label: 'Status', type: 'select', options: ['In Progress', 'Resolved'] },
      ]}
    />
  );
};

export const TasksPage = () => {
  const { tasks } = useStaff();
  return (
    <ResourcePage
      title="Manage Tasks"
      subtitle="Assign garden work, set priority, and track completion."
      records={tasks.items}
      onSave={tasks.save}
      onDelete={tasks.remove}
      statusKey="status"
      defaults={{ title: '', assignee: 'Lead Gardener', priority: 'Medium', due: '', status: 'Pending' }}
      columns={[
        { key: 'title', label: 'Task' },
        { key: 'assignee', label: 'Assignee' },
        { key: 'priority', label: 'Priority' },
        { key: 'due', label: 'Due date' },
        { key: 'status', label: 'Status' },
      ]}
      fields={[
        { name: 'title', label: 'Task title' },
        { name: 'assignee', label: 'Assignee' },
        { name: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] },
        { name: 'due', label: 'Due date', type: 'date' },
        { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Assigned', 'In Progress', 'Completed'] },
      ]}
    />
  );
};

export const HarvestsPage = () => {
  const { harvests } = useStaff();
  return (
    <ResourcePage
      title="Manage Harvests"
      subtitle="Harvest dates, quantities, grades, and locations."
      records={harvests.items}
      onSave={harvests.save}
      onDelete={harvests.remove}
      defaults={{ crop: '', date: '', quantity: '', unit: 'KG', grade: 'Grade A', location: '' }}
      columns={[
        { key: 'crop', label: 'Crop' },
        { key: 'date', label: 'Date' },
        { key: 'quantity', label: 'Qty' },
        { key: 'unit', label: 'Unit' },
        { key: 'grade', label: 'Grade' },
        { key: 'location', label: 'Location' },
      ]}
      fields={[
        { name: 'crop', label: 'Crop' },
        { name: 'date', label: 'Harvest date', type: 'date' },
        { name: 'quantity', label: 'Quantity', type: 'number' },
        { name: 'unit', label: 'Unit', type: 'select', options: ['KG', 'Bunch', 'Box', 'Pot'] },
        { name: 'grade', label: 'Quality grade', type: 'select', options: ['Premium', 'Grade A', 'Grade B'] },
        { name: 'location', label: 'Location' },
      ]}
    />
  );
};

export const SalesPage = () => {
  const { sales } = useStaff();
  return (
    <ResourcePage
      title="Manage Sales"
      subtitle="Customer harvest sales and order status."
      records={sales.items}
      onSave={sales.save}
      onDelete={sales.remove}
      statusKey="status"
      defaults={{ product: '', customer: '', date: '', quantity: '', amount: '', status: 'Pending' }}
      columns={[
        { key: 'product', label: 'Product' },
        { key: 'customer', label: 'Customer' },
        { key: 'date', label: 'Date' },
        { key: 'quantity', label: 'Qty' },
        { key: 'amount', label: 'Amount' },
        { key: 'status', label: 'Status' },
      ]}
      fields={[
        { name: 'product', label: 'Product' },
        { name: 'customer', label: 'Customer' },
        { name: 'date', label: 'Date', type: 'date' },
        { name: 'quantity', label: 'Quantity', type: 'number' },
        { name: 'amount', label: 'Amount', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: ['Pending', 'Confirmed', 'Completed', 'Cancelled'] },
      ]}
    />
  );
};

export const ManagerReportsPage = () => {
  const { crops, harvests, irrigation, pests, tasks, sales } = useStaff();
  const cards = [
    ['Crop productivity', `${crops.items.filter((c) => c.status === 'Active').length} active crops`],
    ['Harvest volume', `${harvests.items.reduce((sum, item) => sum + Number(item.quantity), 0)} units recorded`],
    ['Irrigation', `${irrigation.items.filter((i) => i.status === 'Due').length} schedules due`],
    ['Pest cases', `${pests.items.filter((p) => p.status !== 'Resolved').length} open`],
    ['Task completion', `${tasks.items.filter((t) => t.status === 'Completed').length}/${tasks.items.length} completed`],
    ['Sales value', formatPrice(sales.items.reduce((sum, item) => sum + Number(item.amount), 0))],
  ];

  return (
    <div>
      <h1 className="font-display text-3xl text-gs-deep">Garden Reports</h1>
      <p className="mt-1 text-emerald-800">Operations overview for crops, harvests, tasks, and sales.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(([title, value]) => (
          <article key={title} className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-emerald-700">{title}</p>
            <p className="mt-2 font-display text-2xl">{value}</p>
          </article>
        ))}
      </div>
    </div>
  );
};
