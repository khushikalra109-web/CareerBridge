const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const {
  applyToJob,
  getApplicationsByJob,
  getStudentApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');
const { resumeUpload } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/', authenticate, authorizeRoles('student'), resumeUpload, applyToJob);
router.get('/student', authenticate, authorizeRoles('student'), getStudentApplications);
router.get('/job/:jobId', authenticate, authorizeRoles('company', 'admin'), getApplicationsByJob);
router.put('/:id/status', authenticate, authorizeRoles('company', 'admin'), updateApplicationStatus);

module.exports = router;
