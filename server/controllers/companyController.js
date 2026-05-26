const Job = require('../models/Job');
const Application = require('../models/Application');

exports.getCompanyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ companyId: req.user.id })
      .populate('companyId', 'name company')
      .sort({ createdAt: -1 });

    console.log(`Company ${req.user.id} requested jobs, found ${jobs.length}`);
    res.json({ jobs });
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    res.status(500).json({ message: 'Unable to fetch company jobs.' });
  }
};

exports.getCompanyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ companyId: req.user.id })
      .populate('applicantId', 'name email resumeUrl')
      .populate('jobId', 'title location')
      .sort({ createdAt: -1 });

    console.log(`Company ${req.user.id} requested applications, found ${applications.length}`);
    res.json({ applications });
  } catch (error) {
    console.error('Error fetching company applications:', error);
    res.status(500).json({ message: 'Unable to fetch company applications.' });
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

    const { status } = req.body;
    if (!['pending', 'under_review', 'shortlisted', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    application.status = status;
    application.history.push({ status, note: `Status changed to ${status}` });
    await application.save();

    await application.populate('applicantId', 'name email resumeUrl');
    await application.populate('jobId', 'title location');

    res.json({ success: true, application });
  } catch (error) {
    console.error('Error updating company application status:', error);
    res.status(500).json({ success: false, message: 'Unable to update application status.' });
  }
};

exports.getCompanyAnalytics = async (req, res) => {
  try {
    const jobs = await Job.find({ companyId: req.user.id });
    const applications = await Application.find({ companyId: req.user.id });
    const accepted = applications.filter((item) => item.status === 'accepted').length;
    const monthly = applications.reduce((acc, app) => {
      const month = app.createdAt.toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const monthlyStats = Object.entries(monthly)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([month, count]) => ({ month, count }));

    res.json({ jobsPosted: jobs.length, totalApplications: applications.length, acceptedCandidates: accepted, monthlyStats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load company analytics.' });
  }
};
