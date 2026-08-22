import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    userName: { type: String, default: 'System', trim: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    actorName: { type: String, default: 'System', trim: true },
    action: { type: String, required: true, trim: true },
    detail: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
