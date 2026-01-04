const express = require('express');
const router = express.Router();
const invoiceController = require('./invoice.controller');
const { verifyToken: auth } = require('../../shared/middlewares/auth.middleware');

router.get('/', auth, invoiceController.getInvoices);
router.get('/:id', auth, invoiceController.getInvoiceById);
router.get('/:id/download', auth, invoiceController.downloadInvoice);

module.exports = router;
