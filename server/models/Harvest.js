import mongoose from 'mongoose';
import { HARVEST_GRADES, HARVEST_LINK_STATUSES, HARVEST_UNITS, harvestValue, toAmount, toQty } from '../config/harvest.js';

const harvestSchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: [true, 'Crop is required'],
      trim: true,
    },
    cropId: {
      type: String,
      default: '',
      trim: true,
    },
    variety: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Harvest date is required'],
      default: Date.now,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.001, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      enum: HARVEST_UNITS,
      default: 'KG',
    },
    grade: {
      type: String,
      enum: HARVEST_GRADES,
      default: 'Grade A',
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    unitPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HarvestSale',
      default: null,
    },
    saleStatus: {
      type: String,
      enum: HARVEST_LINK_STATUSES,
      default: 'Unlinked',
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    recordedByName: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

harvestSchema.pre('save', function syncTotals() {
  this.quantity = toQty(this.quantity);
  this.unitPrice = toAmount(this.unitPrice);
  this.totalValue = harvestValue(this.quantity, this.unitPrice);
});

harvestSchema.index({ date: -1 });
harvestSchema.index({ crop: 1 });
harvestSchema.index({ grade: 1 });

const Harvest = mongoose.model('Harvest', harvestSchema);

export default Harvest;
