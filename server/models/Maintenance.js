import mongoose from 'mongoose';
import { MAINTENANCE_STATUSES, MAINTENANCE_TYPES } from '../config/maintenance.js';

const maintenanceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: MAINTENANCE_TYPES,
      required: [true, 'Activity type is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    crop: {
      type: String,
      default: '',
      trim: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: MAINTENANCE_STATUSES,
      default: 'Due',
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

maintenanceSchema.index({ date: -1 });
maintenanceSchema.index({ status: 1, date: 1 });
maintenanceSchema.index({ recordedBy: 1, date: -1 });

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

export default Maintenance;
