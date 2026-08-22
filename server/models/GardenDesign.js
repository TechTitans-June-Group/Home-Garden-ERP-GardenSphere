import mongoose from 'mongoose';

const gardenDesignSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerEmail: { type: String, required: true, lowercase: true, trim: true },
    customerName: { type: String, default: '', trim: true },
    name: { type: String, default: 'My garden', trim: true },
    plots: { type: Array, default: [] },
    photo: { type: String, default: '' },
    notes: { type: String, default: '' },
    cols: { type: Number, default: 0 },
    rows: { type: Number, default: 0 },
  },
  { timestamps: true, strict: false }
);

gardenDesignSchema.index({ user: 1, createdAt: -1 });

const GardenDesign = mongoose.model('GardenDesign', gardenDesignSchema);

export default GardenDesign;
