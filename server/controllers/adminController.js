const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

exports.getAdminStats = async (req, res) => {
  try {
    const [users, companies, jobs, applications] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'company' }),
      Job.countDocuments(),
      Application.countDocuments(),
    ]);

    const popularSkills = await Job.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $project: { skill: '$_id', count: 1, _id: 0 } },
    ]);

    const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(5).populate('companyId', 'name');

    res.json({ users, companies, jobs, applications, popularSkills, recentJobs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Unable to load admin analytics.' });
  }
};
