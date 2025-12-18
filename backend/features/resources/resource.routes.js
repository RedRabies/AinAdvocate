const express = require('express');
const router = express.Router();
const resourceController = require('./resource.controller');
const { verifyToken } = require('../../shared/middlewares/auth.middleware');
const { roleGuard } = require('../../shared/middlewares/role.middleware');

// Public
router.get('/', resourceController.getAllResources);
router.get('/:id', resourceController.getResourceById);

// Admin only (Create/Delete)
router.post('/', verifyToken, roleGuard(['admin']), resourceController.createResource);
router.delete('/:id', verifyToken, roleGuard(['admin']), resourceController.deleteResource);

module.exports = router;
