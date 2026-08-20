import mongoose from 'mongoose';
import { PURCHASE_SOURCES, PURCHASE_STATUSES, toQty } from '../config/inventory.js';

const purchaseSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: PURCHASE_SOURCES,
      default: 'supplier',
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
    },
    itemName: {
      type: String,
      default: '',
      trim: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
    },
    supplierName: {
      type: String,
      default: '',
      trim: true,
    },
    customerName: {
      type: String,
      default: '',
      trim: true,
    },
    customerEmail: {
      type: String,
      default: '',
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    orderRef: {
      type: String,
      default: '',
      trim: true,
    },
    unit: {
      type: String,
      default: '',
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitCost: {
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
      enum: PURCHASE_STATUSES,
      default: 'Ordered',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: undefined,
      },
      comment: {
        type: String,
        default: '',
        trim: true,
      },
    },
  },
  { timestamps: true }
);

purchaseSchema.pre('save', function syncAmount() {
  this.quantity = toQty(this.quantity);
  this.unitCost = toQty(this.unitCost);
  this.amount = Math.round(this.quantity * this.unitCost);
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

export default Purchase;
