const express = require('express');
const router = express.Router();
const reviewController = require('./review.controller');
const { verifyToken } = require('../../shared/middlewares/auth.middleware');
const { roleGuard } = require('../../shared/middlewares/role.middleware');

router.post('/', verifyToken, roleGuard(['client']), reviewController.createReview);
router.get('/lawyer/:lawyerId', verifyToken, reviewController.getLawyerReviews);
router.get('/admin/all', verifyToken, roleGuard(['admin']), reviewController.getAllReviews);

module.exports = router;
