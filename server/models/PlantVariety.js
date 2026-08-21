import mongoose from 'mongoose';

const plantVarietySchema = new mongoose.Schema(
  {
    plant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
      required: [true, 'Associated plant is required'],
    },
    name: {
      type: String,
      required: [true, 'Variety name is required'],
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

plantVarietySchema.index({ plant: 1, name: 1 });

const PlantVariety = mongoose.model('PlantVariety', plantVarietySchema);

export default PlantVariety;
