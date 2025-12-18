const express = require('express');
const router = express.Router();
const lawyerController = require('./lawyer.controller');
const { verifyToken, roleGuard } = require('../../shared/middlewares/auth.middleware');
const { roleGuard: roleCheck } = require('../../shared/middlewares/role.middleware');

// Public
router.get('/', lawyerController.getAllLawyers);
router.get('/:id', lawyerController.getLawyerById);

// Protected (Lawyer)
router.post('/profile', verifyToken, roleCheck(['lawyer']), lawyerController.createOrUpdateProfile);
router.get('/profile/me', verifyToken, roleCheck(['lawyer']), lawyerController.getProfile);

// Admin
router.put('/:id/verify', verifyToken, roleCheck(['admin']), lawyerController.verifyLawyer);
router.get('/admin/list', verifyToken, roleCheck(['admin']), lawyerController.getAllLawyersAdmin);

module.exports = router;
