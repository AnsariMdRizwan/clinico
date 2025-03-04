const mongoose = require('mongoose')
const AppointmentSchema = new mongoose.Schema({
    clinicownerName: { type: String, required: true },
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    userName: { type: String },
    
    availableSlots: [{
        date: { type: Date, required: true }, // Store actual date
        slots: [{ type: String }] // Time slots for that date
    }],
    consultancyFee: { type: Number, required: true } // Fee for consultation
});

module.exports = mongoose.model('Appointment', AppointmentSchema)