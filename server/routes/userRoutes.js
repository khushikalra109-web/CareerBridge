const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { resumeUpload } = require('../middleware/uploadMiddleware');
const {
  getProfile,
  updateProfile,
  uploadResume,
  getAllUsers,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);
router.put('/me/resume', authenticate, resumeUpload, uploadResume);
router.get('/', authenticate, authorizeRoles('admin'), getAllUsers);
router.delete('/:id', authenticate, authorizeRoles('admin'), deleteUser);

module.exports = router;
