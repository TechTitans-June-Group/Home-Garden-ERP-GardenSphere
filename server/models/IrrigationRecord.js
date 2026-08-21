import mongoose from 'mongoose';

const irrigationRecordSchema = new mongoose.Schema(
  {
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IrrigationSchedule',
      default: null,
    },
    crop: {
      type: String,
      required: [true, 'Crop is required'],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Irrigation date is required'],
      default: Date.now,
    },
    time: {
      type: String,
      required: [true, 'Irrigation time is required'],
      trim: true,
    },
    quantity: {
      type: String,
      required: [true, 'Quantity watered is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Completed', 'Missed'],
      default: 'Completed',
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

irrigationRecordSchema.index({ date: -1 });
irrigationRecordSchema.index({ crop: 1 });

const IrrigationRecord = mongoose.model('IrrigationRecord', irrigationRecordSchema);

export default IrrigationRecord;
