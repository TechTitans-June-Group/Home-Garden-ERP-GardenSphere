import mongoose from 'mongoose';
import { CATEGORY_KINDS } from '../config/finance.js';

const financeCategorySchema = new mongoose.Schema(
  {
    kind: {
      type: String,
      enum: CATEGORY_KINDS,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    locked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

financeCategorySchema.index({ kind: 1, name: 1 }, { unique: true });

const FinanceCategory = mongoose.model('FinanceCategory', financeCategorySchema);

export default FinanceCategory;
