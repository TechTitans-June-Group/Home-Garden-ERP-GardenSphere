import mongoose from 'mongoose';
import { toAmount } from '../config/finance.js';

const incomeSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 200,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    method: {
      type: String,
      required: [true, 'Payment method is required'],
      trim: true,
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

incomeSchema.pre('save', function syncAmount() {
  this.amount = toAmount(this.amount);
});

incomeSchema.index({ date: -1 });
incomeSchema.index({ category: 1 });

const Income = mongoose.model('Income', incomeSchema);

export default Income;
