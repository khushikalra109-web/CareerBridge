

const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  website: { type: String, trim: true },
  location: { type: String, trim: true },
  description: { type: String, trim: true },
  logoUrl: { type: String, trim: true },
  verified: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'company', 'admin'], default: 'student' },
    resumeUrl: { type: String, default: '' },
    resumeScore: { type: Number, default: 0, min: 0, max: 100 },
    resumeSkills: [{ type: String, trim: true }],
    resumeMatchScore: { type: Number, default: 0, min: 0, max: 100 },
    recommendedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    skills: [{ type: String, trim: true }],
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    company: companySchema,
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);


