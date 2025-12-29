const Case = require('./case.model');
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
            status: 'PENDING',
            statusHistory: [{
                status: 'PENDING',
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

// Get Lawyer's assigned cases
exports.getAssignedCases = async (req, res) => {
    try {
        const cases = await Case.find({ assignedLawyerId: req.user.id })
            .populate('clientId', 'name email phone') // Populate client details
            .sort({ createdAt: -1 });
        res.json(cases);
    } catch (err) {
        res.status(500).json({ message: err.message });
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
