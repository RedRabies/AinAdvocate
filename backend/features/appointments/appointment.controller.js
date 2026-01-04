const Appointment = require('./appointment.model');
const Case = require('../cases/case.model');

// Request an appointment
exports.requestAppointment = async (req, res) => {
    try {
        let { caseId, lawyerId, date, reason } = req.body;

        // If lawyerId not provided, fetch from Case
        if (!lawyerId) {
            const caseItem = await Case.findById(caseId);
            if (!caseItem) {
                return res.status(404).json({ msg: 'Case not found' });
            }
            lawyerId = caseItem.assignedLawyerId;
        }

        if (!lawyerId) {
            return res.status(400).json({ msg: 'No lawyer assigned to this case yet.' });
        }

        const appointment = new Appointment({
            caseId,
            clientId: req.user.id,
            lawyerId,
            date,
            reason
        });

        const savedAppointment = await appointment.save();
        res.json(savedAppointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get appointments (Client or Lawyer view)
exports.getAppointments = async (req, res) => {
    try {
        const { role, id } = req.user;
        let query = {};

        if (role === 'lawyer') {
            query.lawyerId = id; // Assuming lawyerId is linked to user.id or stored in user
            // NOTE: In this system, 'Lawyer' is a separate model but linked to User.
            // We need to resolve the Lawyer ID if req.user.id is the User ID.
            // For now, assuming middleware helps or we check by user ID if schemas align.
            // Let's assume req.user.id works for now or we query by user
        } else {
            query.clientId = id;
        }

        // If filtering by case
        if (req.query.caseId) {
            query.caseId = req.query.caseId;
        }

        const appointments = await Appointment.find(query)
            .populate('clientId', 'name email')
            .populate('lawyerId', 'name') // Adjust based on Lawyer model
            .sort({ date: 1 });

        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Update status (Confirm/Reject)
exports.updateStatus = async (req, res) => {
    try {
        const { status, date, reason } = req.body;
        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ msg: 'Appointment not found' });
        }

        // Only lawyer can confirm/reject? Or maybe admin.
        // For now, allow lawyer.

        if (status) appointment.status = status;
        if (date) appointment.date = date;
        if (reason) appointment.reason = reason;

        await appointment.save();
        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
