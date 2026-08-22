import mongoose from 'mongoose';

const customerNotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    key: { type: String, default: '', trim: true },
    type: { type: String, default: 'info', trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    read: { type: Boolean, default: false },
    time: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

customerNotificationSchema.index({ user: 1, createdAt: -1 });

const CustomerNotification = mongoose.model('CustomerNotification', customerNotificationSchema);

export default CustomerNotification;
