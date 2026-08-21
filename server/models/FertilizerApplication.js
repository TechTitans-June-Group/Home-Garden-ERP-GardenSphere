import mongoose from 'mongoose';

const fertilizerApplicationSchema = new mongoose.Schema(
  {
    fertilizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fertilizer',
      required: [true, 'Associated fertilizer is required'],
    },
    fertilizerName: {
      type: String,
      default: '',
      trim: true,
    },
    crop: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Planting',
      default: null,
    },
    date: {
      type: Date,
      required: [true, 'Application date is required'],
      default: Date.now,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity applied is required'],
      min: [0.001, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      default: 'KG',
      trim: true,
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Cost cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Applied'],
      default: 'Scheduled',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    recordedByName: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

fertilizerApplicationSchema.index({ date: -1 });
fertilizerApplicationSchema.index({ fertilizer: 1 });
fertilizerApplicationSchema.index({ crop: 1 });

const FertilizerApplication = mongoose.model('FertilizerApplication', fertilizerApplicationSchema);

export default FertilizerApplication;
