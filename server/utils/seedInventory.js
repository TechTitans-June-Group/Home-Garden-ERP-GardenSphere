import Supplier from '../models/Supplier.js';
import InventoryItem from '../models/InventoryItem.js';
import Purchase from '../models/Purchase.js';
import StockMovement from '../models/StockMovement.js';

const seedInventory = async () => {
  const count = await InventoryItem.countDocuments();
  if (count > 0) {
    console.log(`Inventory items already exist (${count}). Skipping seed.`);
    return;
  }

  const suppliers = await Supplier.insertMany([
    { name: 'GreenSeed Lanka', contact: '0712223344', email: 'sales@greenseed.lk', category: 'Seeds', address: 'Peradeniya Road, Kandy', status: 'Active' },
    { name: 'Eco Compost Co.', contact: '0778899001', email: 'hello@ecocompost.lk', category: 'Compost', address: 'Gampola', status: 'Active' },
    { name: 'Farm Tools Kandy', contact: '0812221111', email: 'tools@ftk.lk', category: 'Gardening Tools', address: 'Katugastota', status: 'Active' },
    { name: 'Lanka Agro Inputs', contact: '0112558899', email: 'orders@lankaagro.lk', category: 'Fertilizers', address: 'Colombo 10', status: 'Active' },
  ]);

  const [greenSeed, ecoCompost, farmTools, lankaAgro] = suppliers;

  const items = await InventoryItem.create([
    { item: 'Tomato Seeds', category: 'Seeds', stock: 500, damaged: 0, minStock: 100, unit: 'Packets', unitCost: 150, supplier: greenSeed._id, location: 'Seed cabinet A', notes: 'Cherry and beefsteak mix for the next planting cycle.', image: '/products/tomato.jpg' },
    { item: 'Basil Seeds', category: 'Seeds', stock: 80, damaged: 0, minStock: 40, unit: 'Packets', unitCost: 90, supplier: greenSeed._id, location: 'Seed cabinet A', image: '/inventory/basil.png' },
    { item: 'Organic NPK 10-10-10', category: 'Fertilizers', stock: 36, damaged: 2, minStock: 15, unit: 'Kg', unitCost: 420, supplier: lankaAgro._id, location: 'Fertilizer bay', image: '/inventory/npk.png' },
    { item: 'Garden Soil Mix', category: 'Soil', stock: 22, damaged: 0, minStock: 10, unit: 'Bags', unitCost: 850, supplier: ecoCompost._id, location: 'Compost yard', image: '/inventory/soil.png' },
    { item: 'Organic Compost', category: 'Compost', stock: 8, damaged: 1, minStock: 12, unit: 'Bags', unitCost: 800, supplier: ecoCompost._id, location: 'Compost yard', notes: 'Reorder before tomato transplant week.', image: '/inventory/compost.png' },
    { item: 'Neem Oil', category: 'Pesticides', stock: 6, damaged: 0, minStock: 4, unit: 'Bottles', unitCost: 450, supplier: lankaAgro._id, location: 'Chem locker', image: '/inventory/neem.png' },
    { item: 'Garden Trowel', category: 'Gardening Tools', stock: 5, damaged: 1, minStock: 3, unit: 'Pcs', unitCost: 500, supplier: farmTools._id, location: 'Tool shed', image: '/inventory/trowel.png' },
    { item: 'Drip Irrigation Kit', category: 'Irrigation Equipment', stock: 4, damaged: 0, minStock: 2, unit: 'Sets', unitCost: 3200, supplier: farmTools._id, location: 'Irrigation rack', image: '/inventory/drip.png' },
    { item: 'Nursery Pots 8 inch', category: 'Plant Containers', stock: 120, damaged: 8, minStock: 50, unit: 'Pcs', unitCost: 45, supplier: farmTools._id, location: 'Potting bench', image: '/inventory/pots.png' },
    { item: 'Garden Twine', category: 'Other Materials', stock: 0, damaged: 0, minStock: 6, unit: 'Rolls', unitCost: 180, supplier: farmTools._id, location: 'Tool shed', notes: 'Used for staking tomatoes and beans.', image: '/inventory/twine.png' },
  ]);

  const byName = Object.fromEntries(items.map((row) => [row.item, row]));

  await Purchase.insertMany([
    { item: byName['Tomato Seeds']._id, itemName: 'Tomato Seeds', supplier: greenSeed._id, supplierName: 'GreenSeed Lanka', date: '2026-08-04', quantity: 200, unitCost: 150, status: 'Received' },
    { item: byName['Organic Compost']._id, itemName: 'Organic Compost', supplier: ecoCompost._id, supplierName: 'Eco Compost Co.', date: '2026-08-11', quantity: 6, unitCost: 800, status: 'Received' },
    { item: byName['Drip Irrigation Kit']._id, itemName: 'Drip Irrigation Kit', supplier: farmTools._id, supplierName: 'Farm Tools Kandy', date: '2026-08-17', quantity: 2, unitCost: 3200, status: 'Ordered' },
    { item: byName['Garden Twine']._id, itemName: 'Garden Twine', supplier: farmTools._id, supplierName: 'Farm Tools Kandy', date: '2026-08-19', quantity: 12, unitCost: 180, status: 'Ordered' },
  ]);

  await StockMovement.insertMany([
    { item: byName['Tomato Seeds']._id, itemName: 'Tomato Seeds', type: 'Stock In', quantity: 200, date: '2026-08-04', note: 'Purchase received from GreenSeed Lanka', actorName: 'Inventory Manager' },
    { item: byName['Organic Compost']._id, itemName: 'Organic Compost', type: 'Stock Out', quantity: 4, date: '2026-08-15', note: 'Used in Bed B2', actorName: 'Lead Gardener' },
    { item: byName['Neem Oil']._id, itemName: 'Neem Oil', type: 'Stock Out', quantity: 1, date: '2026-08-16', note: 'Aphid treatment', actorName: 'Lead Gardener' },
    { item: byName['Organic NPK 10-10-10']._id, itemName: 'Organic NPK 10-10-10', type: 'Damaged', quantity: 2, date: '2026-08-12', note: 'Torn bags after rain', actorName: 'Inventory Manager' },
    { item: byName['Nursery Pots 8 inch']._id, itemName: 'Nursery Pots 8 inch', type: 'Damaged', quantity: 8, date: '2026-08-14', note: 'Cracked in transit', actorName: 'Inventory Manager' },
  ]);

  console.log(`Seeded ${items.length} inventory items, ${suppliers.length} suppliers, purchases, and stock movements.`);
};

export default seedInventory;
