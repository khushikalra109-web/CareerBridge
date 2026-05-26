
const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    resumeUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'shortlisted', 'accepted', 'rejected'],
      default: 'pending',
    },
    coverLetter: { type: String, default: '' },
    history: [
      {
        status: { type: String, trim: true },
        note: { type: String, trim: true },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);
