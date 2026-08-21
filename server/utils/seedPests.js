import PestRecord from '../models/PestRecord.js';

const seedPests = async () => {
  const count = await PestRecord.countDocuments();
  if (count > 0) {
    console.log(`Pest records already exist (${count}). Skipping seed.`);
    return;
  }

  await PestRecord.insertMany([
    {
      issue: 'Aphids',
      type: 'Pest',
      crop: 'Cherry Tomato',
      location: 'Bed A1',
      severity: 'Medium',
      dateDetected: new Date('2026-08-14'),
      treatment: 'Neem oil spray (diluted 2% solution)',
      treatmentDate: new Date('2026-08-15'),
      status: 'In Progress',
      notes: 'Colonies found on underside of leaves. Repeated neem spray every 3 days.',
      reportedByName: 'Lead Gardener',
    },
    {
      issue: 'Leaf Spot',
      type: 'Disease',
      crop: 'Lettuce',
      location: 'Bed B3',
      severity: 'Low',
      dateDetected: new Date('2026-08-10'),
      treatment: 'Removed affected leaves, improved air circulation',
      treatmentDate: new Date('2026-08-10'),
      status: 'Resolved',
      notes: 'Fungal infection likely from excessive moisture. Drainage improved.',
      reportedByName: 'Lead Gardener',
    },
    {
      issue: 'Whitefly',
      type: 'Pest',
      crop: 'Basil',
      location: 'Herb corner',
      severity: 'High',
      dateDetected: new Date('2026-08-18'),
      treatment: 'Yellow sticky traps placed; insecticidal soap spray applied',
      treatmentDate: new Date('2026-08-19'),
      status: 'In Progress',
      notes: 'Heavy infestation detected. Monitor daily for 5 days.',
      reportedByName: 'Garden Manager',
    },
    {
      issue: 'Nitrogen Deficiency',
      type: 'Deficiency',
      crop: 'Carrot',
      location: 'Bed C2',
      severity: 'Low',
      dateDetected: new Date('2026-08-17'),
      treatment: 'Applied liquid nitrogen fertilizer',
      treatmentDate: new Date('2026-08-17'),
      status: 'Monitoring',
      notes: 'Yellowing of older leaves observed. Recovery expected within a week.',
      reportedByName: 'Garden Manager',
    },
  ]);

  console.log('Pest & disease records seeded.');
};

export default seedPests;
