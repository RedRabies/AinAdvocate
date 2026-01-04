const Case = require('./case.model');
// Ensure models are registered for populate
require('../users/client.model');
const Lawyer = require('../lawyers/lawyer.model');

const { validationResult } = require('express-validator');


// Create new case (Client)
exports.createCase = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
        const { title, description, category, urgency } = req.body;

        const newCase = await Case.create({
            title,
            description,
            category,
            urgency,
            clientId: req.user.id,
            status: 'OPEN',
            statusHistory: [{
                status: 'OPEN',
                changedAt: new Date(),
                changedBy: req.user.id
            }]
        });

        res.status(201).json(newCase);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Client's own cases
exports.getMyCases = async (req, res) => {
    try {
        const cases = await Case.find({ clientId: req.user.id })
            .sort({ createdAt: -1 });
        res.json(cases);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get Single Case by ID
exports.getCaseById = async (req, res) => {
    try {
        const caseItem = await Case.findById(req.params.id)
            .populate('assignedLawyerId', 'name email phone specialization');

        if (!caseItem) return res.status(404).json({ message: 'Case not found' });

        // Security Check: Only Owner or Assigned Lawyer (or Admin)
        const isOwner = caseItem.clientId.toString() === req.user.id;

        const assignedId = caseItem.assignedLawyerId ? caseItem.assignedLawyerId._id.toString() : null;
        const isAssigned = assignedId === req.user.id;

        if (!isOwner && !isAssigned && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(caseItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update Case (Client only, PENDING only)
exports.updateCase = async (req, res) => {
    try {
        const { title, description, category, urgency } = req.body;
        const caseItem = await Case.findById(req.params.id);

        if (!caseItem) return res.status(404).json({ message: 'Case not found' });

        if (caseItem.clientId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (caseItem.status !== 'PENDING') {
            return res.status(400).json({ message: 'Cannot edit case that is not PENDING' });
        }

        caseItem.title = title || caseItem.title;
        caseItem.description = description || caseItem.description;
        caseItem.category = category || caseItem.category;
        caseItem.urgency = urgency || caseItem.urgency;

        await caseItem.save();
        res.json(caseItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Cancel Case (Client only, PENDING only)
exports.cancelCase = async (req, res) => {
    try {
        const caseItem = await Case.findById(req.params.id);

        if (!caseItem) return res.status(404).json({ message: 'Case not found' });

        if (caseItem.clientId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (caseItem.status !== 'PENDING') {
            return res.status(400).json({ message: 'Cannot cancel case that is not PENDING' });
        }

        caseItem.status = 'CANCELLED';
        caseItem.statusHistory.push({
            status: 'CANCELLED',
            changedAt: new Date(),
            changedBy: req.user.id
        });

        await caseItem.save();
        res.json({ message: 'Case cancelled successfully', case: caseItem });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Lawyer Inbox (Pending cases)
exports.getCaseInbox = async (req, res, next) => {
    try {
        const query = { status: 'OPEN' };
        if (req.query.specialization) {
            query.category = req.query.specialization;
        }

        const cases = await Case.find(query)
            .populate('clientId', 'name')
            .sort({ createdAt: -1 });

        res.json(cases);
    } catch (err) {
        next(err);
    }
};

const CaseApplication = require('./application.model');
const Notification = require('../notifications/notification.model');

// SEARCH CASES (Lawyer)
exports.searchCases = async (req, res, next) => {
    try {
        const { category, keyword } = req.query;
        const query = { status: 'OPEN' };

        if (category) {
            query.category = category;
        }

        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }

        const lawyerId = req.user.id;

        // Find cases explicitly rejected or applied by this lawyer
        const myApplications = await CaseApplication.find({ lawyerId }).select('caseId');
        const appliedCaseIds = myApplications.map(app => app.caseId);

        query._id = { $nin: appliedCaseIds };

        const cases = await Case.find(query)
            .populate('clientId', 'name')
            .sort({ createdAt: -1 });

        res.json(cases);
    } catch (err) {
        next(err);
    }
};

// APPLY TO CASE (Lawyer)
exports.applyToCase = async (req, res, next) => {
    try {
        const { proposedFee, message } = req.body;
        const caseId = req.params.id;
        const lawyerId = req.user.id;

        const caseItem = await Case.findById(caseId);
        if (!caseItem) return res.status(404).json({ message: 'Case not found' });
        if (caseItem.status !== 'OPEN') return res.status(400).json({ message: 'Case is not open for applications' });

        // Check if already applied
        const existingApp = await CaseApplication.findOne({ caseId, lawyerId });
        if (existingApp) return res.status(400).json({ message: 'You have already applied to this case' });

        // Check Category Match (Categories OR Legacy Specialization)
        const lawyer = await Lawyer.findById(lawyerId);

        if (!lawyer.isVerified) {
            return res.status(403).json({ message: 'You must be a verified lawyer to apply for cases.' });
        }

        const hasCategory = lawyer.categories.includes(caseItem.category);

        // Fallback: Check if any specialization string loosely matches the category
        const hasSpecialization = lawyer.specialization.some(s =>
            s.toLowerCase().includes(caseItem.category.toLowerCase()) ||
            caseItem.category.toLowerCase().includes(s.toLowerCase())
        );

        if (!hasCategory && !hasSpecialization) {
            return res.status(400).json({ message: 'Your specialization does not match this case category' });
        }

        // Create Application
        const application = await CaseApplication.create({
            caseId,
            lawyerId,
            proposedFee,
            message
        });

        // Notify Client
        await Notification.create({
            userId: caseItem.clientId,
            type: 'INFO',
            message: `New application for case "${caseItem.title}"`,
            relatedId: caseId,
            link: `/cases/${caseId}`
        });

        res.status(201).json(application);
    } catch (err) {
        next(err);
    }
};

// NEGOTIATE APPLICATION (Client or Lawyer)
exports.negotiateApplication = async (req, res, next) => {
    try {
        const { amount, message } = req.body;
        const appId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role; // 'client' or 'lawyer'

        const application = await CaseApplication.findById(appId).populate('caseId');
        if (!application) return res.status(404).json({ message: 'Application not found' });

        // Verify authorization
        const isLawyer = application.lawyerId.toString() === userId;
        const isClient = application.caseId.clientId.toString() === userId;

        if (!isLawyer && !isClient) {
            return res.status(403).json({ message: 'Not authorized to negotiate this application' });
        }

        const senderRole = isLawyer ? 'LAWYER' : 'CLIENT';

        // Update application
        application.proposedFee = amount; // Current active fee
        application.negotiationHistory.push({
            sender: senderRole,
            amount: amount,
            message: message
        });

        await application.save();

        // Notify counter-party
        const recipientId = isLawyer ? application.caseId.clientId : application.lawyerId;
        await Notification.create({
            userId: recipientId,
            type: 'INFO',
            message: `New negotiation offer (৳${amount}) from ${senderRole === 'LAWYER' ? 'Lawyer' : 'Client'}`,
            relatedId: application.caseId._id,
            link: isLawyer ? `/cases/${application.caseId._id}` : `/lawyer/applications`
        });

        res.json(application);
    } catch (err) {
        next(err);
    }
};

// GET LAWYER'S APPLICATIONS (Lawyer)
exports.getMyApplications = async (req, res, next) => {
    try {
        const lawyerId = req.user.id;
        const applications = await CaseApplication.find({ lawyerId })
            .populate('caseId', 'title category status')
            .sort({ updatedAt: -1 });

        res.json(applications);
    } catch (err) {
        next(err);
    }
};

// GET CASE APPLICATIONS (Client)
exports.getCaseApplications = async (req, res, next) => {
    try {
        const caseId = req.params.id;
        // Verify ownership
        const caseItem = await Case.findById(caseId);
        if (!caseItem) return res.status(404).json({ message: 'Case not found' });
        if (caseItem.clientId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

        const applications = await CaseApplication.find({ caseId })
            .populate('lawyerId', 'name email rating profileImage specialization')
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (err) {
        next(err);
    }
};

// SELECT LAWYER (Client)
exports.selectLawyer = async (req, res, next) => {
    try {
        const { caseId, lawyerId } = req.params;

        const caseItem = await Case.findById(caseId);
        if (!caseItem) return res.status(404).json({ message: 'Case not found' });
        if (caseItem.clientId.toString() !== req.user.id) return res.status(403).json({ message: 'Not authorized' });
        if (caseItem.status !== 'OPEN') return res.status(400).json({ message: 'Case is not open' });

        // 2. Update Applications
        await CaseApplication.updateMany({ caseId }, { status: 'REJECTED' });
        const winningApp = await CaseApplication.findOneAndUpdate(
            { caseId, lawyerId },
            { status: 'ACCEPTED' },
            { new: true }
        );

        // 1. Update Case
        caseItem.status = 'ASSIGNED';
        caseItem.assignedLawyerId = lawyerId;
        if (winningApp) {
            caseItem.budget = winningApp.proposedFee;
        }
        caseItem.statusHistory.push({
            status: 'ASSIGNED',
            changedAt: new Date(),
            changedBy: req.user.id
        });
        await caseItem.save();

        // 3. Notify Lawyer
        await Notification.create({
            userId: lawyerId,
            type: 'SUCCESS',
            message: `You have been selected for case "${caseItem.title}"`,
            relatedId: caseId,
            link: `/cases/${caseId}` // Or chat/inbox
        });

        res.json({ message: 'Lawyer selected successfully', case: caseItem });
    } catch (err) {
        next(err);
    }
};

// ... (existing imports)

// Accept Case (Lawyer)
exports.acceptCase = async (req, res, next) => {
    try {
        const caseItem = await Case.findById(req.params.id);
        if (!caseItem) return res.status(404).json({ message: 'Case not found' });

        if (caseItem.status !== 'PENDING') {
            return res.status(400).json({ message: 'Case is not pending' });
        }

        caseItem.status = 'ACCEPTED';
        caseItem.assignedLawyerId = req.user._id; // Use _id explicitly
        caseItem.statusHistory.push({
            status: 'ACCEPTED',
            changedAt: new Date(),
            changedBy: req.user._id
        });

        await caseItem.save();

        // Notify Client
        await Notification.create({
            userId: caseItem.clientId,
            type: 'SUCCESS',
            message: `Lawyer ${req.user.name} has accepted your case: "${caseItem.title}"`,
            relatedId: caseItem._id,
            link: `/cases/${caseItem._id}`
        });

        res.json(caseItem);
    } catch (err) {
        next(err);
    }
};

// ...

// Get Lawyer's assigned cases
exports.getAssignedCases = async (req, res, next) => {
    try {
        const cases = await Case.find({ assignedLawyerId: req.user._id })
            .populate('clientId', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(cases);
    } catch (err) {
        next(err);
    }
};

// Public Cases List
exports.getPublicCases = async (req, res, next) => {
    try {
        const cases = await Case.find({ status: 'OPEN' })
            .select('title description category urgency createdAt')
            .sort({ createdAt: -1 });
        res.json(cases);
    } catch (err) {
        next(err);
    }
};

// Public Case Details
exports.getPublicCaseById = async (req, res, next) => {
    try {
        const caseItem = await Case.findById(req.params.id)
            .select('title description category urgency createdAt status');

        if (!caseItem) return res.status(404).json({ message: 'Case not found' });
        if (caseItem.status !== 'OPEN') {
            return res.status(404).json({ message: 'Case not available' });
        }

        res.json(caseItem);
    } catch (err) {
        next(err);
    }
};

// Reject Case (Lawyer)
exports.rejectCase = async (req, res, next) => {
    try {
        const caseItem = await Case.findById(req.params.id);
        if (!caseItem) return res.status(404).json({ message: 'Case not found' });
        if (caseItem.status !== 'PENDING') return res.status(400).json({ message: 'Case is not pending' });

        caseItem.status = 'REJECTED';
        caseItem.statusHistory.push({
            status: 'REJECTED',
            changedAt: new Date(),
            changedBy: req.user._id
        });

        await caseItem.save();
        res.json(caseItem);
    } catch (err) {
        next(err);
    }
};

// Update Case Status (Lawyer)
exports.updateCaseStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['IN_PROGRESS', 'CLOSED'];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status transition' });
        }

        const caseItem = await Case.findById(req.params.id);
        if (!caseItem) return res.status(404).json({ message: 'Case not found' });

        if (caseItem.assignedLawyerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        caseItem.status = status;
        caseItem.statusHistory.push({
            status: status,
            changedAt: new Date(),
            changedBy: req.user._id
        });

        await caseItem.save();

        // Notify Client
        await Notification.create({
            userId: caseItem.clientId,
            type: 'INFO',
            message: `Case "${caseItem.title}" status updated to ${status.replace('_', ' ')}`,
            relatedId: caseItem._id,
            link: `/cases/${caseItem._id}`
        });

        res.json(caseItem);
    } catch (err) {
        next(err);
    }
};

// Add note (Lawyer only)
exports.addCaseNote = async (req, res) => {
    const { noteText } = req.body;
    if (!noteText) return res.status(400).json({ message: 'Note text is required' });

    try {
        const caseId = req.params.id;
        const caseItem = await Case.findById(caseId);

        if (!caseItem) return res.status(404).json({ message: 'Case not found' });

        // Ensure only assigned lawyer (or admin?) can add notes
        if (caseItem.assignedLawyerId && caseItem.assignedLawyerId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to add notes to this case' });
        }

        caseItem.notes.push({
            noteText,
            createdBy: req.user.id
        });

        await caseItem.save();
        res.json(caseItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// Get ALL Cases (Admin)
exports.getAllCasesAdmin = async (req, res) => {
    try {
        const cases = await Case.find()
            .populate('clientId', 'name email')
            .populate('assignedLawyerId', 'name email')
            .sort({ createdAt: -1 });
        res.json(cases);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
