import mongoose from 'mongoose';

const irrigationScheduleSchema = new mongoose.Schema(
  {
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
    frequency: {
      type: String,
      required: [true, 'Watering frequency is required'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Watering time is required'],
      trim: true,
    },
    quantity: {
      type: String,
      required: [true, 'Water quantity is required'],
      trim: true,
    },
    lastDone: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Due', 'Completed', 'Scheduled'],
      default: 'Due',
    },
  },
  { timestamps: true }
);

irrigationScheduleSchema.index({ status: 1 });
irrigationScheduleSchema.index({ crop: 1 });

const IrrigationSchedule = mongoose.model('IrrigationSchedule', irrigationScheduleSchema);

export default IrrigationSchedule;
