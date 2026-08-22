export const MAINTENANCE_TYPES = [
  'Weeding',
  'Mulching',
  'Staking',
  'Pruning',
  'Bed cleanup',
  'Composting',
  'Tool care',
];

export const MAINTENANCE_STATUSES = ['Due', 'Done'];

export const MAINTENANCE_LOCATIONS = [
  'Bed A1',
  'Bed A2',
  'Bed B2',
  'Bed C1',
  'Bed C2',
  'Bed D1',
  'Herb bed',
  'Fruit bed',
  'Tool shed',
];

export const STATUS_TINTS = {
  Due: 'bg-amber-100 text-amber-800',
  Done: 'bg-emerald-100 text-emerald-800',
};

export const blankMaintenance = () => ({
  id: '',
  type: 'Weeding',
  date: new Date().toISOString().slice(0, 10),
  location: '',
  crop: '',
  notes: '',
  status: 'Due',
});
