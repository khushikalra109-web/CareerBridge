const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { getCompanyJobs, getCompanyApplications, getCompanyAnalytics, updateApplicationStatus } = require('../controllers/companyController');

const router = express.Router();

router.get('/jobs', authenticate, authorizeRoles('company', 'admin'), getCompanyJobs);
router.get('/applications', authenticate, authorizeRoles('company', 'admin'), getCompanyApplications);
router.get('/analytics', authenticate, authorizeRoles('company', 'admin'), getCompanyAnalytics);
router.put('/applications/:id/status', authenticate, authorizeRoles('company', 'admin'), updateApplicationStatus);

module.exports = router;
