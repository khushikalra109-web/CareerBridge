
const express = require('express');
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getApplicants,
} = require('../controllers/jobController');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', authenticate, authorizeRoles('company', 'admin'), createJob);
router.put('/:id', authenticate, authorizeRoles('company', 'admin'), updateJob);
router.delete('/:id', authenticate, authorizeRoles('company', 'admin'), deleteJob);
router.get('/:id/applicants', authenticate, authorizeRoles('company', 'admin'), getApplicants);

module.exports = router;
