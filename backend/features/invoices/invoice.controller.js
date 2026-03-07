const Invoice = require('./invoice.model');

exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
        res.json(invoice);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getInvoices = async (req, res) => {
    try {
        // If lawyer -> issuedBy, if client -> issuedTo... slightly complex query if by ID
        // For now, simplify: query by paymentId or caseId via query params
        const { caseId } = req.query;
        let query = {};
        if (caseId) query.caseId = caseId;

        const invoices = await Invoice.find(query);
        res.json(invoices);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.downloadInvoice = async (req, res) => {
    // Return the PDF file or generate on fly
    // For now, return mock
    res.send("PDF Download Mock");
};
