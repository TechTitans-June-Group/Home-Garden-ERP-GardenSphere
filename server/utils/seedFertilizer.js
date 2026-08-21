import Fertilizer from '../models/Fertilizer.js';
import FertilizerApplication from '../models/FertilizerApplication.js';

const seedFertilizer = async () => {
  const fertilizerCount = await Fertilizer.countDocuments();
  if (fertilizerCount > 0) {
    console.log(`Fertilizers already exist (${fertilizerCount}). Skipping seed.`);
    return;
  }

  // 1. Seed Fertilizers (Stock)
  const compost = await Fertilizer.create({
    name: 'Compost mix',
    stock: 50,
    unit: 'KG',
    minStock: 10,
    description: 'Organic rich compost mix for soil enrichment',
  });

  const liquid = await Fertilizer.create({
    name: 'Organic liquid feed',
    stock: 20,
    unit: 'L',
    minStock: 5,
    description: 'Concentrated organic liquid seaweed fertilizer',
  });

  const bonemeal = await Fertilizer.create({
    name: 'Bone meal',
    stock: 15,
    unit: 'KG',
    minStock: 5,
    description: 'High phosphorus organic fertilizer to promote root growth',
  });
  console.log('Fertilizers seeded.');

  // 2. Seed Applications
  await FertilizerApplication.insertMany([
    {
      fertilizer: compost._id,
      fertilizerName: compost.name,
      crop: 'Cherry Tomato',
      date: new Date('2026-08-10'),
      quantity: 4,
      unit: compost.unit,
      cost: 800,
      status: 'Applied',
      notes: 'Applied around the root base during flowering/fruiting stage.',
      recordedByName: 'Lead Gardener',
    },
    {
      fertilizer: liquid._id,
      fertilizerName: liquid.name,
      crop: 'Lettuce',
      date: new Date('2026-08-14'),
      quantity: 2,
      unit: liquid.unit,
      cost: 450,
      status: 'Applied',
      notes: 'Diluted foliar spray applied in the morning.',
      recordedByName: 'Lead Gardener',
    },
    {
      fertilizer: bonemeal._id,
      fertilizerName: bonemeal.name,
      crop: 'Carrot',
      date: new Date('2026-08-05'),
      quantity: 1,
      unit: bonemeal.unit,
      cost: 600,
      status: 'Scheduled',
      notes: 'Scheduled for root growth enhancement.',
      recordedByName: 'Garden Manager',
    },
  ]);
  console.log('Fertilizer application logs seeded.');
};

export default seedFertilizer;
