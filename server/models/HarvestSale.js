import mongoose from 'mongoose';
import { HARVEST_SALE_STATUSES, harvestValue, toAmount, toQty } from '../config/harvest.js';

const harvestSaleSchema = new mongoose.Schema(
  {
    harvestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Harvest',
      required: true,
      unique: true,
    },
    crop: {
      type: String,
      required: true,
      trim: true,
    },
    customer: {
      type: String,
      required: [true, 'Customer is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.001, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      default: 'KG',
      trim: true,
    },
    unitPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: HARVEST_SALE_STATUSES,
      default: 'Pending',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

harvestSaleSchema.pre('save', function syncAmount() {
  this.quantity = toQty(this.quantity);
  this.unitPrice = toAmount(this.unitPrice);
  this.amount = harvestValue(this.quantity, this.unitPrice);
});

harvestSaleSchema.index({ date: -1 });
harvestSaleSchema.index({ status: 1 });

const HarvestSale = mongoose.model('HarvestSale', harvestSaleSchema);

export default HarvestSale;
