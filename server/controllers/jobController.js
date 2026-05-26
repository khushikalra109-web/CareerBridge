const Job = require('../models/Job');
const Application = require('../models/Application');

exports.createJob = async (req, res) => {
  try {
    const { title, description, skills, salary, location, category, jobType, experienceLevel } = req.body;
    if (!title || !description || !skills || !location) {
      return res.status(400).json({ message: 'Please provide title, description, skills, and location.' });
    }

    const job = new Job({
      title,
      description,
      skills: Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim()),
      salary: salary || 'Negotiable',
      location,
      category: category || 'General',
      jobType: jobType || 'Full-time',
      experienceLevel: experienceLevel || 'Entry level',
      companyId: req.user.id,
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not create job.' });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      skills,
      jobType,
      experienceLevel,
      salaryRange,
      sort = 'newest',
      page = 1,
      limit = 12,
    } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (skills) {
      query.skills = { $in: skills.split(',').map((s) => s.trim()) };
    }
    if (jobType) query.jobType = jobType;
    if (experienceLevel) query.experienceLevel = experienceLevel;
    if (salaryRange) {
      const [min, max] = salaryRange.split('-').map((value) => parseInt(value, 10));
      query.salary = { $regex: new RegExp('\\d+') };
      query.$expr = { $gte: [{ $toInt: { $arrayElemAt: [{ $split: ['$salary', ' '] }, 0] } }, min] };
      if (!Number.isNaN(max)) {
        query.$expr = {
          $and: [
            query.$expr,
            { $lte: [{ $toInt: { $arrayElemAt: [{ $split: ['$salary', ' '] }, 0] } }, max] },
          ],
        };
      }
    }

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { applicants: -1, createdAt: -1 },
    };
    const jobs = await Job.find(query)
      .populate('companyId', 'name company')
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const count = await Job.countDocuments(query);

    res.json({ jobs, total: count, page: Number(page), pages: Math.ceil(count / limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not fetch jobs.' });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !require('mongoose').Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid job id.' });
    }

    const job = await Job.findById(id).populate('companyId', 'name company');
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not fetch job.' });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !require('mongoose').Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid job id.' });
    }

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    if (job.companyId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Permission denied.' });
    }

    const { title, description, skills, salary, location, category, jobType, experienceLevel } = req.body;
    job.title = title || job.title;
    job.description = description || job.description;
    job.skills = skills ? (Array.isArray(skills) ? skills : skills.split(',').map((s) => s.trim())) : job.skills;
    job.salary = salary || job.salary;
    job.location = location || job.location;
    job.category = category || job.category;
    job.jobType = jobType || job.jobType;
    job.experienceLevel = experienceLevel || job.experienceLevel;

    await job.save();
    res.json(job);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not update job.' });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !require('mongoose').Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid job id.' });
    }

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    if (job.companyId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied.' });
    }

    await job.remove();
    await Application.deleteMany({ jobId: job._id });
    res.json({ message: 'Job removed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not delete job.' });
  }
};

exports.getApplicants = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !require('mongoose').Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid job id.' });
    }

    const job = await Job.findById(id);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    if (job.companyId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied.' });
    }

    const applications = await Application.find({ jobId: job._id })
      .populate('applicantId', 'name email resumeUrl')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch applicants.' });
  }
};
