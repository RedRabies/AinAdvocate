const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { verifyToken: protect } = require('../../shared/middlewares/auth.middleware');
const { roleGuard: authorize } = require('../../shared/middlewares/role.middleware');
const {
    createCase, getMyCases, getAssignedCases, addCaseNote,
    getPublicCases, getPublicCaseById, getAllCasesAdmin,
    searchCases, applyToCase, getCaseApplications, selectLawyer
} = require('./case.controller');



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

// Public Route
router.get('/public', getPublicCases);
router.get('/public/:id', getPublicCaseById);

// Admin Route
router.get('/admin/all', protect, authorize('admin'), getAllCasesAdmin);


// Lawyer Routes - Specific
router.get('/search', protect, authorize('lawyer'), searchCases);
router.post('/:id/apply', protect, authorize('lawyer'), applyToCase);

router.get('/inbox', protect, authorize('lawyer'), require('./case.controller').getCaseInbox); // Legacy/Alternative
router.get('/assigned', protect, authorize('lawyer'), getAssignedCases);

// Client Routes - Specific
router.get('/my', protect, authorize('client'), getMyCases);
router.get('/:id/applications', protect, authorize('client'), getCaseApplications);
router.post('/:caseId/select-lawyer/:lawyerId', protect, authorize('client'), selectLawyer);

// Negotiation Routes
router.get('/lawyer/my-applications', protect, authorize('lawyer'), require('./case.controller').getMyApplications);
router.post('/applications/:id/negotiate', protect, require('./case.controller').negotiateApplication);

// Generic Protected Route (ID) - MUST BE LAST of the GETs
router.get('/:id', protect, require('./case.controller').getCaseById);

router.put('/:id/accept', protect, authorize('lawyer'), require('./case.controller').acceptCase);
router.put('/:id/reject', protect, authorize('lawyer'), require('./case.controller').rejectCase);
router.put('/:id/status', protect, authorize('lawyer'), require('./case.controller').updateCaseStatus);

router.post(
    '/:id/notes',
    protect,
    authorize('lawyer'),
    addCaseNote
);

module.exports = router;
