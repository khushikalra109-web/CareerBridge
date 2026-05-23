const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  website: { type: String, trim: true },
  location: { type: String, trim: true },
  description: { type: String, trim: true },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'company', 'admin'], default: 'student' },
    resumeUrl: { type: String, default: '' },
    company: companySchema,
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
