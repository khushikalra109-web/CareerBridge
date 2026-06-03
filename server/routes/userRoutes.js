
const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { resumeUpload } = require('../middleware/uploadMiddleware');
const {
  getProfile,
  updateProfile,
  uploadResume,
  getSavedJobs,
  toggleSavedJob,
  getRecommendedJobs,
  getResumeInsights,
  getUsersByRole,
  getNotifications,
  getAllUsers,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);
router.put('/me/resume', authenticate, resumeUpload, uploadResume);
router.post('/me/resume', authenticate, resumeUpload, uploadResume);
router.get('/me/ai-insights', authenticate, getResumeInsights);
router.get('/me/saved-jobs', authenticate, getSavedJobs);
router.post('/me/save-job/:jobId', authenticate, toggleSavedJob);
router.get('/me/recommended', authenticate, getRecommendedJobs);
router.get('/contacts', authenticate, getUsersByRole);
router.get('/notifications', authenticate, getNotifications);
router.get('/', authenticate, authorizeRoles('admin'), getAllUsers);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteUser);

module.exports = router;
