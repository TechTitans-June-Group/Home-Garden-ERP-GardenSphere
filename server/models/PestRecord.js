import mongoose from 'mongoose';

const pestRecordSchema = new mongoose.Schema(
  {
    issue: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Pest', 'Disease', 'Deficiency', 'Other'], default: 'Pest' },
    crop: { type: String, required: true, trim: true },
    location: { type: String, trim: true, default: '' },
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
    dateDetected: { type: Date, required: true },
    treatment: { type: String, trim: true, default: '' },
    treatmentDate: { type: Date, default: null },
    status: { type: String, enum: ['Active', 'In Progress', 'Resolved', 'Monitoring'], default: 'Active' },
    notes: { type: String, trim: true, default: '' },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reportedByName: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

const PestRecord = mongoose.model('PestRecord', pestRecordSchema);
export default PestRecord;
