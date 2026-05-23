const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');

exports.applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Resume upload is required.' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const existing = await Application.findOne({ jobId, studentId: req.user.id });
    if (existing) {
      return res.status(400).json({ message: 'You already applied for this job.' });
    }

    const application = new Application({
      jobId,
      studentId: req.user.id,
      resumeUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
      status: 'pending',
    });
    await application.save();

    job.applicants.push(req.user.id);
    await job.save();

    res.status(201).json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to apply. Please try again.' });
  }
};

exports.getApplicationsByJob = async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId }).populate('studentId', 'name email resumeUrl');
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not retrieve applications.' });
  }
};

exports.getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.user.id }).populate('jobId', 'title companyId location salary');
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to fetch your applications.' });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('jobId');
    if (!application) return res.status(404).json({ message: 'Application not found.' });
    if (application.jobId.companyId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied.' });
    }

    const { status } = req.body;
    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }
    application.status = status;
    await application.save();
    res.json(application);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not update application status.' });
  }
};
