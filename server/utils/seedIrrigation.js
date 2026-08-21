import IrrigationSchedule from '../models/IrrigationSchedule.js';
import IrrigationRecord from '../models/IrrigationRecord.js';

const seedIrrigation = async () => {
  const scheduleCount = await IrrigationSchedule.countDocuments();
  if (scheduleCount > 0) {
    console.log(`Irrigation schedules already exist (${scheduleCount}). Skipping seed.`);
    return;
  }

  // 1. Seed schedules
  const schedules = await IrrigationSchedule.insertMany([
    {
      crop: 'Cherry Tomato',
      frequency: 'Every 2 days',
      time: '06:30',
      quantity: '8 L',
      lastDone: new Date('2026-08-18'),
      status: 'Completed',
    },
    {
      crop: 'Lettuce',
      frequency: 'Daily',
      time: '07:00',
      quantity: '5 L',
      lastDone: new Date('2026-08-19'),
      status: 'Completed',
    },
    {
      crop: 'Carrot',
      frequency: 'Every 3 days',
      time: '17:30',
      quantity: '10 L',
      lastDone: new Date('2026-08-17'),
      status: 'Due',
    },
  ]);
  console.log('Irrigation schedules seeded.');

  const tomatoSched = schedules.find((s) => s.crop === 'Cherry Tomato');
  const lettuceSched = schedules.find((s) => s.crop === 'Lettuce');
  const carrotSched = schedules.find((s) => s.crop === 'Carrot');

  // 2. Seed past records
  await IrrigationRecord.insertMany([
    {
      schedule: tomatoSched ? tomatoSched._id : null,
      crop: 'Cherry Tomato',
      date: new Date('2026-08-18'),
      time: '06:30',
      quantity: '8 L',
      status: 'Completed',
      notes: 'Morning drip irrigation completed, line pressure checked.',
      recordedByName: 'Lead Gardener',
    },
    {
      schedule: lettuceSched ? lettuceSched._id : null,
      crop: 'Lettuce',
      date: new Date('2026-08-19'),
      time: '07:00',
      quantity: '5 L',
      status: 'Completed',
      notes: 'Watered lettuce beds manually, soil moisture is adequate.',
      recordedByName: 'Lead Gardener',
    },
    {
      schedule: carrotSched ? carrotSched._id : null,
      crop: 'Carrot',
      date: new Date('2026-08-14'),
      time: '17:30',
      quantity: '10 L',
      status: 'Completed',
      notes: 'Watered Bed B2.',
      recordedByName: 'Garden Manager',
    },
  ]);
  console.log('Irrigation history records seeded.');
};

export default seedIrrigation;
