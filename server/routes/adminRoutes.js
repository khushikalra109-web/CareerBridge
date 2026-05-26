const express = require('express');
const { authenticate, authorizeRoles } = require('../middleware/authMiddleware');
const { getAdminStats } = require('../controllers/adminController');

const router = express.Router();

router.get('/stats', authenticate, authorizeRoles('admin'), getAdminStats);

module.exports = router;
