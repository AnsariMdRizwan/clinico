const express = require('express');
const router = express.Router();
const { createAppointment, getAppointmentsByClinic } = require('../../controllers/users/appointmentcontroller');
const { getAllUsers } = require('../../controllers/users/allusers');

router.post('/appointments', createAppointment);
router.get('/getall', getAppointmentsByClinic);
router.get('/fetchallusers', getAllUsers);



module.exports = router;