import { Bug, ClipboardList, Droplets, Leaf, Sprout, Wheat } from 'lucide-react';
import PortalDashboard from '../../components/staff/PortalDashboard.jsx';
import { useStaff } from '../../context/StaffContext.jsx';
import { ROLE_LABELS } from '../../data/staffData.js';
import { isAssignedTo } from '../../utils/tasks.js';

const GardenerDashboard = () => {
  const { staff, tasks, maintenance } = useStaff();
  const open = tasks.items.filter((item) => item.status !== 'Completed' && isAssignedTo(item, staff)).length;
  const overdueCare = maintenance.summary?.overdue || 0;

  return (
    <PortalDashboard
      title="Gardener Dashboard"
      greeting={`Hello ${staff.name.split(' ')[0]}. Check assigned tasks, then log irrigation, care, and harvests.`}
      stats={[
        { label: 'Open tasks', value: String(open) },
        { label: 'Care overdue', value: String(overdueCare) },
        { label: 'Signed in as', value: ROLE_LABELS[staff.role] },
      ]}
      modules={[
        {
          title: 'My tasks',
          description: 'View assigned work and update status from pending to completed.',
          to: '/staff/my-tasks',
          icon: ClipboardList,
          tint: 'bg-emerald-100 text-emerald-700',
        },
        {
          title: 'Crops',
          description: 'Update growth stage and crop status for beds you work on.',
          to: '/staff/crops',
          icon: Sprout,
          tint: 'bg-emerald-100 text-emerald-700',
        },
        {
          title: 'Irrigation',
          description: 'Log watering time, quantity, and completed cycles.',
          to: '/staff/record-irrigation',
          icon: Droplets,
          tint: 'bg-sky-100 text-sky-700',
        },
        {
          title: 'Maintenance',
          description: 'Record mulching, staking, weeding, and other garden care.',
          to: '/staff/maintenance',
          icon: Leaf,
          tint: 'bg-lime-100 text-lime-700',
        },
        {
          title: 'Pest Report',
          description: 'Flag crop issues with severity so the manager can follow up.',
          to: '/staff/report-pest',
          icon: Bug,
          tint: 'bg-orange-100 text-orange-700',
        },
        {
          title: 'Harvest',
          description: 'Save harvest quantity, grade, date, location, and selling price.',
          to: '/staff/record-harvest',
          icon: Wheat,
          tint: 'bg-amber-100 text-amber-700',
        },
      ]}
    />
  );
};

export default GardenerDashboard;
