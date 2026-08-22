import Harvest from '../models/Harvest.js';
import HarvestSale from '../models/HarvestSale.js';
import Purchase from '../models/Purchase.js';
import { harvestValue, saleStatusFromHarvest } from '../config/harvest.js';

const seedHarvest = async () => {
  const harvestCount = await Harvest.countDocuments();
  if (harvestCount === 0) {
    await Harvest.insertMany([
      {
        crop: 'Tomato',
        variety: 'Roma',
        date: '2026-10-15',
        quantity: 25,
        unit: 'KG',
        grade: 'Grade A',
        location: 'Bed A2',
        unitPrice: 350,
        totalValue: harvestValue(25, 350),
        notes: 'Morning pick, firm fruit, ready for market.',
        recordedByName: 'Garden Manager',
      },
      {
        crop: 'Cherry Tomato',
        variety: 'Sweet 100',
        date: '2026-08-18',
        quantity: 8,
        unit: 'KG',
        grade: 'Grade A',
        location: 'Bed A1',
        unitPrice: 350,
        totalValue: harvestValue(8, 350),
        recordedByName: 'Lead Gardener',
      },
      {
        crop: 'Strawberry',
        variety: 'Albion',
        date: '2026-08-16',
        quantity: 4,
        unit: 'Box',
        grade: 'Premium',
        location: 'Fruit bed',
        unitPrice: 890,
        totalValue: harvestValue(4, 890),
        recordedByName: 'Lead Gardener',
      },
      {
        crop: 'Mint',
        variety: 'Spearmint',
        date: '2026-08-19',
        quantity: 12,
        unit: 'Bunch',
        grade: 'Grade A',
        location: 'Herb bed',
        unitPrice: 80,
        totalValue: harvestValue(12, 80),
        recordedByName: 'Lead Gardener',
      },
      {
        crop: 'Lettuce',
        variety: 'Butterhead',
        date: '2026-07-12',
        quantity: 20,
        unit: 'Bunch',
        grade: 'Grade A',
        location: 'Bed C1',
        unitPrice: 180,
        totalValue: harvestValue(20, 180),
        recordedByName: 'Garden Manager',
      },
      {
        crop: 'Mint',
        variety: 'Spearmint',
        date: '2025-12-20',
        quantity: 9,
        unit: 'Bunch',
        grade: 'Grade B',
        location: 'Herb bed',
        unitPrice: 60,
        totalValue: harvestValue(9, 60),
        recordedByName: 'Lead Gardener',
      },
    ]);
    console.log('Harvest records seeded.');
  } else {
    console.log(`Harvests already exist (${harvestCount}). Skipping harvest seed.`);
  }

  const saleCount = await HarvestSale.countDocuments();
  if (saleCount > 0) {
    await HarvestSale.updateMany(
      { customer: 'Ayesha Silva', $or: [{ customerEmail: '' }, { customerEmail: { $exists: false } }] },
      { $set: { customerEmail: 'customer@gardensphere.com' } }
    );
    console.log(`Harvest sales already exist (${saleCount}). Skipping sale seed.`);
    return;
  }

  const cherry = await Harvest.findOne({ crop: 'Cherry Tomato' });
  const lettuce = await Harvest.findOne({ crop: 'Lettuce' });
  const berry = await Harvest.findOne({ crop: 'Strawberry' });
  if (!cherry || !lettuce || !berry) return;

  const sales = await HarvestSale.insertMany([
    {
      harvestId: cherry._id,
      crop: cherry.crop,
      customer: 'Ayesha Silva',
      customerEmail: 'customer@gardensphere.com',
      date: '2026-08-18',
      quantity: 2,
      unit: cherry.unit,
      unitPrice: cherry.unitPrice,
      amount: harvestValue(2, cherry.unitPrice),
      status: 'Pending',
    },
    {
      harvestId: lettuce._id,
      crop: lettuce.crop,
      customer: 'Kasun Fernando',
      date: '2026-08-16',
      quantity: 3,
      unit: lettuce.unit,
      unitPrice: lettuce.unitPrice,
      amount: harvestValue(3, lettuce.unitPrice),
      status: 'Confirmed',
    },
    {
      harvestId: berry._id,
      crop: berry.crop,
      customer: 'Ishara Jayawardena',
      date: '2026-08-12',
      quantity: 1,
      unit: berry.unit,
      unitPrice: berry.unitPrice,
      amount: harvestValue(1, berry.unitPrice),
      status: 'Completed',
    },
  ]);

  await Promise.all(
    sales.map(async (sale) => {
      await Harvest.findByIdAndUpdate(sale.harvestId, {
        saleId: sale._id,
        saleStatus: saleStatusFromHarvest(sale.status),
      });
    })
  );

  console.log('Harvest sales seeded.');
};

const seedReviews = async () => {
  const existing = await Purchase.countDocuments({ source: 'customer', 'feedback.rating': { $gte: 1 } });
  if (existing > 0) {
    console.log(`Customer reviews already exist (${existing}). Skipping review seed.`);
    return;
  }

  await Purchase.insertMany([
    {
      source: 'customer',
      itemName: 'Cherry Tomatoes',
      customerName: 'Ayesha Silva',
      customerEmail: 'customer@gardensphere.com',
      image: '/products/tomato.jpg',
      orderRef: 'GS-REV-2401',
      unit: 'KG',
      quantity: 2,
      unitCost: 350,
      date: '2026-08-10',
      status: 'Completed',
      feedback: {
        rating: 5,
        comment: 'The cherry tomatoes tasted like they were picked that morning. Quality grade was accurate.',
      },
    },
    {
      source: 'customer',
      itemName: 'Fresh Carrots',
      customerName: 'Kasun Fernando',
      customerEmail: 'kasun@gardensphere.com',
      image: '/products/carrot.jpg',
      orderRef: 'GS-REV-2402',
      unit: 'KG',
      quantity: 3,
      unitCost: 220,
      date: '2026-08-12',
      status: 'Completed',
      feedback: {
        rating: 5,
        comment: 'Harvest date was on the label and the carrots were sweet and neatly packed.',
      },
    },
    {
      source: 'customer',
      itemName: 'Fresh Mint',
      customerName: 'Ishara Jayawardena',
      customerEmail: 'ishara@gardensphere.com',
      image: '/products/mint.jpg',
      orderRef: 'GS-REV-2403',
      unit: 'Bunch',
      quantity: 2,
      unitCost: 120,
      date: '2026-08-14',
      status: 'Completed',
      feedback: {
        rating: 4,
        comment: 'Mint arrived healthy and lasted all week in the kitchen. Will order again.',
      },
    },
  ]);
  console.log('Customer harvest reviews seeded.');
};

export default async function seedHarvestAndReviews() {
  await seedHarvest();
  await seedReviews();
}
