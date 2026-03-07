const express = require('express');
const router = express.Router();
const appointmentController = require('./appointment.controller');
const { verifyToken: auth } = require('../../shared/middlewares/auth.middleware');

router.post('/', auth, appointmentController.requestAppointment);
router.get('/', auth, appointmentController.getAppointments);
router.put('/:id/status', auth, appointmentController.updateStatus);

module.exports = router;
