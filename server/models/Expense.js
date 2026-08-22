import mongoose from 'mongoose';
import { toAmount } from '../config/finance.js';

const expenseSchema = new mongoose.Schema(
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
    source: {
      type: String,
      default: 'manual',
      trim: true,
    },
    sourceId: {
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

expenseSchema.index({ source: 1, sourceId: 1 });

expenseSchema.pre('save', function syncAmount() {
  this.amount = toAmount(this.amount);
});

expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
