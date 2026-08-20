import mongoose from 'mongoose';
import { INVENTORY_CATEGORIES, INVENTORY_UNITS, ITEM_STATUSES, computeItemStatus, toQty } from '../config/inventory.js';

const inventoryItemSchema = new mongoose.Schema(
  {
    item: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: 120,
    },
    category: {
      type: String,
      enum: INVENTORY_CATEGORIES,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    damaged: {
      type: Number,
      default: 0,
      min: 0,
    },
    minStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      enum: INVENTORY_UNITS,
      default: 'Packets',
    },
    unitCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    value: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ITEM_STATUSES,
      default: 'Available',
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      default: null,
    },
    location: {
      type: String,
      default: 'Main shed',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

inventoryItemSchema.pre('save', function syncComputed() {
  this.stock = toQty(this.stock);
  this.damaged = toQty(this.damaged);
  this.minStock = toQty(this.minStock);
  this.unitCost = toQty(this.unitCost);
  this.value = Math.round(this.stock * this.unitCost);
  this.status = computeItemStatus(this);
});

inventoryItemSchema.index({ item: 1 });
inventoryItemSchema.index({ category: 1, status: 1 });

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

export default InventoryItem;
