

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    skills: [{ type: String, trim: true }],
    salary: { type: String, default: 'Negotiable' },
    location: { type: String, trim: true },
    category: { type: String, trim: true },
    jobType: { type: String, trim: true, default: 'Full-time' },
    experienceLevel: { type: String, trim: true, default: 'Entry level' },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
