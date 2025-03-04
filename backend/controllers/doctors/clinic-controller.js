const Clinics = require('../../models/Clinic'); // Adjust the path as per your project structure

// Get all clinics
const getAllClinics = async (req, res) => {
    try {
        const clinics = await Clinics.find(); // Fetch all clinics
        res.status(200).json({ success: true, data: clinics });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

const updateAvailableSlots = async (req, res) => {
    try {
        const { clinicId } = req.params; // Get clinic ID from params
        const { slots } = req.body; // Get slots array from request body

        if (!slots || !Array.isArray(slots) || slots.length === 0) {
            return res.status(400).json({ message: 'Invalid slots data provided' });
        }

        const { date } = slots[0]; // Extract date from first slot
        const formattedDate = new Date(date).toISOString().split('T')[0];

        // Extract only slot timings as strings
        const newSlotTimes = slots.map(slot => slot.slot);

        if (!date || isNaN(new Date(date).getTime())) {
            return res.status(400).json({ message: 'Invalid date provided' });
        }

        // Find the clinic
        const clinic = await Clinics.findById(clinicId);
        if (!clinic) {
            return res.status(404).json({ message: 'Clinic not found' });
        }

        // Check if the date already exists
        const existingSlot = clinic.availableSlots.find(slot =>
            new Date(slot.date).toISOString().split('T')[0] === formattedDate
        );

        if (existingSlot) {
            // Append new slots to existing ones, ensuring uniqueness
            existingSlot.slots = [...new Set([...existingSlot.slots, ...newSlotTimes])];
        } else {
            // If date doesn't exist, add new entry
            clinic.availableSlots.push({ date: formattedDate, slots: newSlotTimes });
        }

        // Save the updated clinic document
        await clinic.save();

        return res.status(200).json({ message: 'Slots updated successfully', clinic });
    } catch (error) {
        console.error("Error in updateAvailableSlots:", error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const deleteAvailableSlot = async (req, res) => {
    try {
        const { clinicId } = req.params; // Get clinic ID from params
        const { date, slot } = req.body; // Get date and slot from request body

        if (!date || !slot) {
            return res.status(400).json({ message: 'Date and slot are required' });
        }

        const formattedDate = new Date(date).toISOString().split('T')[0];

        // Find the clinic
        const clinic = await Clinics.findById(clinicId);
        if (!clinic) {
            return res.status(404).json({ message: 'Clinic not found' });
        }

        // Find the existing slot by date
        const existingSlot = clinic.availableSlots.find(
            (slotData) => new Date(slotData.date).toISOString().split('T')[0] === formattedDate
        );

        if (!existingSlot) {
            return res.status(404).json({ message: 'No slots found for the given date' });
        }

        // Filter out the slot to be deleted
        existingSlot.slots = existingSlot.slots.filter((time) => time !== slot);

        // If no slots remain for the date, remove the date entry entirely
        if (existingSlot.slots.length === 0) {
            clinic.availableSlots = clinic.availableSlots.filter(
                (slotData) => new Date(slotData.date).toISOString().split('T')[0] !== formattedDate
            );
        }

        // Save the updated clinic document
        await clinic.save();

        return res.status(200).json({ message: 'Slot deleted successfully', clinic });
    } catch (error) {
        console.error("Error in deleteAvailableSlot:", error);
        return res.status(500).json({ message: 'Server error' });
    }
};


module.exports = { getAllClinics, updateAvailableSlots, deleteAvailableSlot };
