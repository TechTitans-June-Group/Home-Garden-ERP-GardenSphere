import mongoose from 'mongoose';

const fertilizerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Fertilizer name is required'],
      unique: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: [true, 'Stock level is required'],
      default: 0,
      min: [0, 'Stock cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Measurement unit is required'],
      default: 'KG',
      trim: true,
    },
    minStock: {
      type: Number,
      default: 0,
      min: [0, 'Minimum stock cannot be negative'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

fertilizerSchema.index({ name: 1 });

const Fertilizer = mongoose.model('Fertilizer', fertilizerSchema);

export default Fertilizer;
