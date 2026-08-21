import mongoose from 'mongoose';

const plantingSchema = new mongoose.Schema(
  {
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
      required: [true, 'Plant is required'],
    },
    variety: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PlantVariety',
      default: null,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GardenLocation',
      required: [true, 'Location is required'],
    },
    plantedDate: {
      type: Date,
      required: [true, 'Planting date is required'],
      default: Date.now,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    stage: {
      type: String,
      enum: ['Seeding', 'Sprouting', 'Growing', 'Flowering', 'Fruiting', 'Ready', 'Harvesting', 'Done'],
      default: 'Growing',
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Harvested', 'Failed'],
      default: 'Active',
    },
    expectedHarvestDate: {
      type: Date,
      default: null,
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

plantingSchema.index({ plantedDate: -1 });
plantingSchema.index({ plant: 1 });
plantingSchema.index({ location: 1 });

const Planting = mongoose.model('Planting', plantingSchema);

export default Planting;
