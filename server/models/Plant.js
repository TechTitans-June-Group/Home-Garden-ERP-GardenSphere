import mongoose from 'mongoose';

const plantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plant name is required'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Vegetable', 'Fruit', 'Herb', 'Flower', 'Other'],
      default: 'Vegetable',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

plantSchema.index({ name: 1 });

const Plant = mongoose.model('Plant', plantSchema);

export default Plant;
