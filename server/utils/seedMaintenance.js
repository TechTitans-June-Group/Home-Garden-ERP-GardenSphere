import User from '../models/User.js';
import Maintenance from '../models/Maintenance.js';

const seedMaintenance = async () => {
  const count = await Maintenance.countDocuments();
  if (count > 0) {
    console.log(`Maintenance records already exist (${count}). Skipping seed.`);
    return;
  }

  const gardener = await User.findOne({ email: 'gardener@gardensphere.com' });
  const manager = await User.findOne({ email: 'garden.manager@gardensphere.com' });

  await Maintenance.insertMany([
    {
      type: 'Mulching',
      date: new Date('2026-08-15'),
      location: 'Bed A1',
      crop: 'Cherry Tomato',
      notes: 'Used dry leaves and compost around tomato beds.',
      status: 'Done',
      recordedBy: gardener?._id || null,
      recordedByName: gardener?.name || 'Lead Gardener',
    },
    {
      type: 'Staking',
      date: new Date('2026-08-17'),
      location: 'Bed D1',
      crop: 'Chili',
      notes: 'Added bamboo stakes to chili plants.',
      status: 'Done',
      recordedBy: gardener?._id || null,
      recordedByName: gardener?.name || 'Lead Gardener',
    },
    {
      type: 'Weeding',
      date: new Date('2026-08-20'),
      location: 'Bed C1',
      crop: 'Lettuce',
      notes: 'Clear weeds along the lettuce rows before they seed.',
      status: 'Due',
      recordedBy: gardener?._id || null,
      recordedByName: gardener?.name || 'Lead Gardener',
    },
    {
      type: 'Bed cleanup',
      date: new Date('2026-08-23'),
      location: 'Bed B2',
      crop: 'Carrot',
      notes: 'Remove spent foliage and tidy the carrot bed.',
      status: 'Due',
      recordedBy: manager?._id || null,
      recordedByName: manager?.name || 'Garden Manager',
    },
  ]);

  console.log('Maintenance records seeded.');
};

export default seedMaintenance;
