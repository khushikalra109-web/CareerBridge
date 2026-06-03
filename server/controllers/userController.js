const User = require('../models/User');
const Job = require('../models/Job');
const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const { calculateResumeScore, extractResumeSkills, calculateJobMatch, normalizeSkills } = require('../utils/resumeScoreCalculator');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch profile.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const allowed = ['name', 'email', 'company', 'skills'];
    const updateData = {};

    allowed.forEach((field) => {
      if (updates[field] !== undefined) updateData[field] = updates[field];
    });

    if (Array.isArray(updates.skills)) {
      updateData.skills = updates.skills.map((skill) => skill.trim()).filter(Boolean);
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true }).select('-password');
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not update profile.' });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required.' });
    }

    const resumeUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);

    let resumeScore = 0;
    let scoreData = { score: 0, suggestions: [] };
    let extractedSkills = [];
    let recommendedJobs = [];

    try {
      const fileBuffer = await fs.readFile(filePath);
      const pdfData = await pdfParse(fileBuffer);
      const resumeText = pdfData.text || '';

      console.log('Resume parsed text length:', resumeText.length);
      const currentUser = await User.findById(req.user.id);
      extractedSkills = normalizeSkills(extractResumeSkills(resumeText));
      console.log('Extracted resume skills:', extractedSkills);

      scoreData = calculateResumeScore(resumeText, currentUser.skills || [], extractedSkills);
      resumeScore = scoreData.score;

      const comparisonSkills = extractedSkills.length ? extractedSkills : normalizeSkills(currentUser.skills || []);
      const jobs = await Job.find({}).populate('companyId', 'name company');
      const jobMatches = jobs
        .map((job) => {
          const match = calculateJobMatch(job.skills || [], comparisonSkills);
          console.log(`Job match for ${job.title}:`, match.matchPercentage, 'strongSkills=', match.strongSkills);
          return {
            job,
            matchPercentage: match.matchPercentage,
            missingSkills: match.missingSkills,
            strongSkills: match.strongSkills,
          };
        })
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, 6);

      recommendedJobs = jobMatches;
    } catch (pdfError) {
      console.error('Error parsing PDF:', pdfError);
      resumeScore = 0;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        resumeUrl,
        resumeScore,
        resumeMatchScore: resumeScore,
        resumeSkills: extractedSkills,
        recommendedJobs: recommendedJobs.map((item) => item.job._id),
      },
      { new: true, runValidators: true }
    ).select('-password');

    const missingSkills = Array.from(new Set(recommendedJobs.flatMap((item) => item.missingSkills))).slice(0, 8);

    res.json({
      user: updatedUser,
      resumeScore,
      scoreData,
      insights: {
        extractedSkills,
        strongSkills: scoreData.strongSkills,
        resumeStrength: resumeScore,
        matchPercentage: resumeScore,
        missingSkills,
        recommendedJobs,
      },
      message: 'Resume uploaded and analyzed successfully.',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not upload resume.' });
  }
};

exports.getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedJobs');
    res.json({ savedJobs: user.savedJobs || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch saved jobs.' });
  }
};

exports.toggleSavedJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!jobId || !require('mongoose').Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Invalid job id.' });
    }
    const user = await User.findById(req.user.id);
    const exists = user.savedJobs.map((id) => id.toString()).includes(jobId);
    if (exists) {
      user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
    } else {
      user.savedJobs.push(jobId);
    }
    await user.save();
    res.json({ savedJobs: user.savedJobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to update saved jobs.' });
  }
};

exports.getRecommendedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const skills = normalizeSkills(user.resumeSkills?.length ? user.resumeSkills : user.skills || []);
    if (!skills.length) return res.json({ jobs: [] });

    const jobs = await Job.find({}).populate('companyId', 'name company');
    const matchedJobs = jobs
      .map((job) => {
        const match = calculateJobMatch(job.skills || [], skills);
        return {
          ...job.toObject(),
          matchPercentage: match.matchPercentage,
          missingSkills: match.missingSkills,
          strongSkills: match.strongSkills,
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 6);

    res.json({ jobs: matchedJobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to get recommended jobs.' });
  }
};

exports.getResumeInsights = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const skills = normalizeSkills(user.resumeSkills?.length ? user.resumeSkills : user.skills || []);
    const jobs = await Job.find({}).populate('companyId', 'name company');

    const recommendedJobs = jobs
      .map((job) => {
        const match = calculateJobMatch(job.skills || [], skills);
        return {
          job,
          matchPercentage: match.matchPercentage,
          missingSkills: match.missingSkills,
          strongSkills: match.strongSkills,
        };
      })
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 6);

    const missingSkills = Array.from(new Set(recommendedJobs.flatMap((item) => item.missingSkills))).slice(0, 8);
    const strongSkills = skills.slice(0, 6);

    res.json({
      user,
      insights: {
        extractedSkills: skills,
        strongSkills,
        missingSkills,
        recommendedJobs,
        resumeStrength: user.resumeScore || 0,
        matchPercentage: user.resumeMatchScore || user.resumeScore || 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load AI resume insights.' });
  }
};

exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.query;
    if (!['student', 'company'].includes(role)) {
      return res.status(400).json({ message: 'Role must be student or company.' });
    }

    const users = await User.find({ role, _id: { $ne: req.user.id } }).select('name email role company');
    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch contacts.' });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch notifications.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load users.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete yourself.' });
    }
    const { id } = req.params;
    if (!id || !require('mongoose').Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid user id.' });
    }
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    await user.remove();
    await Job.deleteMany({ companyId: user._id });
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not delete user.' });
  }
};

