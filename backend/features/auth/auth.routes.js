// routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('./auth.controller');

router.post('/register',
  body('name').notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  authController.register
);

router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  authController.login
);

router.post('/verify-otp',
  body('email').isEmail(),
  body('otp').notEmpty(),
  authController.verifyOTP
);

// Profile Image Upload
router.post('/upload-profile-image',
  require('../../shared/middlewares/auth.middleware').verifyToken,
  (req, res, next) => {
    const upload = require('../../shared/middlewares/upload.middleware').single('image');
    upload(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  authController.uploadProfileImage
);

router.delete('/profile-image',
  require('../../shared/middlewares/auth.middleware').verifyToken,
  authController.deleteProfileImage
);

router.delete('/profile-image',
  require('../../shared/middlewares/auth.middleware').verifyToken,
  authController.deleteProfileImage
);

router.get('/me', require('../../shared/middlewares/auth.middleware').verifyToken, authController.getMe);
router.put('/me', require('../../shared/middlewares/auth.middleware').verifyToken, authController.updateMe);

// Admin: get all users
router.get('/users',
  require('../../shared/middlewares/auth.middleware').verifyToken,
  require('../../shared/middlewares/role.middleware').roleGuard(['admin']),
  authController.getAllUsers
);

router.delete('/admin/:type/:id',
  require('../../shared/middlewares/auth.middleware').verifyToken,
  require('../../shared/middlewares/role.middleware').roleGuard(['admin']),
  authController.deleteUser
);

router.put('/admin/:type/:id/ban',
  require('../../shared/middlewares/auth.middleware').verifyToken,
  require('../../shared/middlewares/role.middleware').roleGuard(['admin']),
  authController.banUser
);

module.exports = router;
