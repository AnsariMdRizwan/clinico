const mongoose = require('mongoose')
const clinicSchema = new mongoose.Schema({
    clinicname: {
        type: String,
        required: true,
    },
    clinicownerName: {
        type: String,
        required: true,
    },
    registrationNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    clinictype: {
        type: String,
    },
    address: {
        type: String,
    },
    country: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: null
    },
    degree: {
        type: String,
    },
    city: {
        type: String,
    },
    fee: {
        type: Number,
        default: 0
    },
    availableSlots: [{
        date: { type: Date, required: true }, // Store actual date
        slots: [{ type: String }] // Time slots for that date
    }]


})

module.exports = mongoose.model('Clinic', clinicSchema)