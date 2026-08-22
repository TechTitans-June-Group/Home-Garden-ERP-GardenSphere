import Harvest from '../models/Harvest.js';
import Purchase from '../models/Purchase.js';
import { SHOP_CATALOG } from '../config/shop.js';

const matchesCrop = (product, cropName = '') => {
  const crop = String(cropName).toLowerCase();
  return (product.cropKeys || []).some((key) => crop.includes(key));
};

export const listShopProducts = async (req, res, next) => {
  try {
    const harvests = await Harvest.find({ saleStatus: { $in: ['Unlinked', 'Listed'] } });
    const products = SHOP_CATALOG.map((product) => {
      const lots = harvests.filter((row) => matchesCrop(product, row.crop));
      const fromHarvest = lots.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
      const latest = lots.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      const harvestQty = Math.round(fromHarvest * 1000) / 1000;
      const fallback = product.id === 13 ? 0 : 10;
      const availableQuantity = lots.length ? harvestQty : fallback;
      const price = latest?.unitPrice > 0 ? latest.unitPrice : product.price;
      const harvestDate = latest ? new Date(latest.date).toISOString().slice(0, 10) : product.harvestDate;
      const grade = latest?.grade || product.grade;
      return {
        ...product,
        price,
        harvestDate,
        grade,
        availableQuantity,
        available: availableQuantity > 0,
      };
    });
    res.json({ products });
  } catch (error) {
    next(error);
  }
};

export const listShopTestimonials = async (req, res, next) => {
  try {
    const rows = await Purchase.find({
      source: 'customer',
      'feedback.rating': { $gte: 1 },
    })
      .sort({ updatedAt: -1 })
      .limit(9);

    res.json({
      testimonials: rows.map((row) => ({
        name: row.customerName || 'GardenSphere customer',
        role: row.itemName ? `Bought ${row.itemName}` : 'GardenSphere customer',
        rating: row.feedback.rating,
        quote:
          row.feedback.comment ||
          `Rated ${row.itemName || 'this harvest'} ${row.feedback.rating}/5 after delivery.`,
        productName: row.itemName || '',
        image: row.image || '',
      })),
    });
  } catch (error) {
    next(error);
  }
};
