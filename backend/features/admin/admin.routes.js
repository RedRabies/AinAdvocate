const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { verifyToken } = require('../../shared/middlewares/auth.middleware');
const { roleGuard } = require('../../shared/middlewares/role.middleware');

// Protect all routes
router.use(verifyToken, roleGuard(['admin']));

router.get('/analytics', adminController.getAnalytics);
router.get('/earnings', adminController.getEarnings);
router.put('/cases/:id/close', adminController.forceCloseCase);
router.put('/users/:id/suspend', adminController.suspendUser);
router.get('/reports', adminController.getReports);

module.exports = router;
