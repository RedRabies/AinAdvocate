const Payment = require('./payment.model');
const Invoice = require('../invoices/invoice.model');

// Mock Process Payment
exports.processPayment = async (req, res) => {
    try {
        const { caseId, amount, lawyerId } = req.body;

        // 1. Create Payment Record (Pending)
        const payment = new Payment({
            caseId,
            payerId: req.user.id,
            payeeId: lawyerId,
            amount,
            status: 'COMPLETED', // Mocking instant success
            transactionId: 'MOCK-' + Date.now(),
            paidAt: new Date()
        });

        await payment.save();

        // 2. Auto-generate Invoice (Mock logic for now)
        // In real app, call invoice service
        const invoice = new Invoice({
            paymentId: payment._id,
            invoiceNumber: 'INV-' + Date.now(),
            caseId,
            issuedTo: {
                name: req.user.name,
                email: req.user.email
            },
            amount,
            pdfUrl: '/uploads/invoices/mock.pdf' // Placeholder
        });

        await invoice.save();

        res.json({ payment, invoice });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
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
