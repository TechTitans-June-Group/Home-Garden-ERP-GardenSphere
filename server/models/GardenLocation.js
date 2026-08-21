import mongoose from 'mongoose';

const gardenLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

gardenLocationSchema.index({ name: 1 });

const GardenLocation = mongoose.model('GardenLocation', gardenLocationSchema);

export default GardenLocation;
