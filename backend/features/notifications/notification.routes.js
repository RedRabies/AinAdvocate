const express = require('express');
const router = express.Router();
const notificationController = require('./notification.controller');
const { verifyToken } = require('../../shared/middlewares/auth.middleware');

router.use(verifyToken);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

module.exports = router;
