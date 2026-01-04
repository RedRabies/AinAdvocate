const Payment = require('./payment.model');
const Invoice = require('../invoices/invoice.model');

const Notification = require('../notifications/notification.model');

// Mock Process Payment
exports.processPayment = async (req, res) => {
    try {
        const { caseId, amount, method, phone, lawyerId } = req.body; // lawyerId optional if we fetch from case

        // Validation
        if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

        const Case = require('../cases/case.model');
        const caseItem = await Case.findById(caseId);
        if (!caseItem) return res.status(404).json({ message: 'Case not found' });

        // Ensure one-time payment
        const existingPayment = await Payment.findOne({ caseId, status: 'COMPLETED' });
        if (existingPayment) {
            return res.status(400).json({ message: 'Payment already completed for this case.' });
        }

        const targetLawyerId = lawyerId || caseItem.assignedLawyerId;
        if (!targetLawyerId) return res.status(400).json({ message: 'No lawyer assigned to this case to pay.' });

        // 1. Create Payment Record
        const payment = new Payment({
            caseId,
            payerId: req.user.id,
            payeeId: targetLawyerId,
            amount,
            currency: 'BDT',
            platformFee: amount * 0.15, // 15% Admin Share
            lawyerEarn: amount * 0.85, // 85% Lawyer Share
            status: 'COMPLETED',
            method: method || 'Bkash',
            transactionId: 'TXN-' + Date.now() + Math.floor(Math.random() * 1000),
            paidAt: new Date()
        });

        await payment.save();

        // 2. Generate Invoice
        // Fetch Lawyer Name
        const Lawyer = require('../lawyers/lawyer.model'); // Ensure Lawyer model is available
        const lawyerObj = await Lawyer.findById(targetLawyerId);

        const invoice = new Invoice({
            paymentId: payment._id,
            invoiceNumber: 'INV-' + Date.now(),
            caseId,
            issuedTo: {
                name: req.user.name,
                email: req.user.email
            },
            payee: {
                name: lawyerObj ? lawyerObj.name : 'Lawyer',
                email: lawyerObj ? lawyerObj.email : ''
            },
            amount,
            pdfUrl: '#' // Placeholder
        });

        await invoice.save();

        // 3. Notify Lawyer
        await Notification.create({
            userId: targetLawyerId,
            type: 'SUCCESS',
            message: `You received a payment of ৳${amount} for case "${caseItem.title}"`,
            relatedId: caseId,
            link: `/cases/${caseId}`
        });

        // 4. Update Case Status to IN_PROGRESS
        caseItem.status = 'IN_PROGRESS';
        caseItem.statusHistory.push({
            status: 'IN_PROGRESS',
            changedAt: new Date(),
            changedBy: req.user.id
        });
        await caseItem.save();

        res.json({ payment, invoice });
    } catch (err) {
        console.error("Payment Error:", err);
        res.status(500).json({ message: 'Payment processing failed. ' + err.message });
    }
};

exports.getPayments = async (req, res) => {
    try {
        // Simple get for now
        const payments = await Payment.find({ payerId: req.user.id });
        res.json(payments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
