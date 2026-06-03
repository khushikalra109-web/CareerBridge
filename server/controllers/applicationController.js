const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Resume upload is required.' });
    }

    if (!jobId || !require('mongoose').Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Invalid job id.' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const existing = await Application.findOne({ jobId, applicantId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'You already applied for this job.' });
    }

    const application = new Application({
      jobId,
      applicantId: req.user.id,
      companyId: job.companyId,
      resumeUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
      status: 'pending',
    });
    await application.save();

    job.applicants = Array.from(new Set([...job.applicants.map((id) => id.toString()), req.user.id]));
    job.applications.push(application._id);
    await job.save();

    res.status(201).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to apply. Please try again.' });
  }
};

exports.getApplicationsByJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!jobId || !require('mongoose').Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: 'Invalid job id.' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found.' });
    if (job.companyId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied.' });
    }

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('applicantId', 'name email resumeUrl')
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not retrieve applications.' });
  }
};

exports.getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicantId: req.user.id })
      .populate('jobId', 'title companyId location salary')
      .populate('companyId', 'name company');
    res.json({ success: true, applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch your applications.' });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !require('mongoose').Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid application id.' });
    }

    const application = await Application.findById(id).populate('jobId');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    if (application.jobId.companyId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Permission denied.' });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Application already processed' });
    }

    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    application.status = status;
    await application.save();
    res.json({ success: true, application });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Could not update application status.' });
  }
};
