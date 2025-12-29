const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { verifyToken: protect } = require('../../shared/middlewares/auth.middleware');
const { roleGuard: authorize } = require('../../shared/middlewares/role.middleware');
const { createCase, getMyCases, getAssignedCases, addCaseNote } = require('./case.controller');

// Client Routes
router.post(
    '/',
    protect,
    authorize('client'),
    [
        check('title', 'Title is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty(),
        check('category', 'Category is required').not().isEmpty()
    ],
    createCase
);

router.get('/my', protect, authorize('client'), getMyCases);

// Generic Protected Route (Role checks handled in controller)
router.get('/:id', protect, require('./case.controller').getCaseById);

// Client Actions
router.put('/:id', protect, authorize('client'), require('./case.controller').updateCase);
router.delete('/:id', protect, authorize('client'), require('./case.controller').cancelCase);

// Lawyer Routes
router.get('/assigned', protect, authorize('lawyer'), getAssignedCases);

router.post(
    '/:id/notes',
    protect,
    authorize('lawyer'),
    addCaseNote
);

module.exports = router;
