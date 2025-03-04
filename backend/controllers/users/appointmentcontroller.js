const Appointment = require('../../models/Appointment');
const Clinic = require('../../models/Clinic'); // Import the Clinic model


const nodemailer = require("nodemailer");


// Function to send email
const sendAppointmentEmail = async (email, userName, availableSlots, clinicname, consultancyFee) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 465,
            secure: true, // true for port 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
        });

        const mailOptions = {
            from: `Clinico <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Appointment Confirmation",
            html: `
             <div style="max-width: 600px; margin: auto; font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); text-align: center;">
    
    <!-- Logo Section -->
    <div style="margin-bottom: 20px;">
        <img src="https://res.cloudinary.com/dtoxsgtel/image/upload/v1741028465/qb247bymzrz0ot4lirpo.png" alt="Clinico Logo" style="max-width: 120px;">
    </div>

    <!-- Welcome Message -->
    <h2 style="color: #007bff; margin-bottom: 10px;">Hello, ${userName}!</h2>
    <p style="font-size: 16px; color: #555;">Thank you for booking an appointment with <strong>Clinico</strong>. We’re here to take care of your health needs!</p>

    <!-- Appointment Details -->
    <div style="background: #ffffff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); margin: 20px 0;">
        <h3 style="color: #007bff; margin-bottom: 10px;">Appointment Details</h3>

        <!-- Display Date -->
        <p style="margin: 8px 0; font-size: 16px;"><strong>📅 Date:</strong> ${new Date(availableSlots[0].date).toLocaleDateString("en-GB")}</p>
        <p style="margin: 8px 0; font-size: 16px;"><strong>Clinic Name </strong> ${clinicname}</p>
        <p style="margin: 8px 0; font-size: 16px;"><strong>Cunsultency Fee: ₹</strong> ${consultancyFee}</p>

        <!-- Display Slots -->
        <p style="margin: 8px 0; font-size: 16px;"><strong>🕒 Booking slots:</strong></p>
        <ul style="list-style: none; padding: 0; font-size: 16px; color: #555;">
            ${availableSlots[0].slots.map(slot => `<li>⏰ ${slot}</li>`).join('')}
        </ul>
    </div>

    <!-- Contact Information -->
    <p style="font-size: 16px; color: #555;">We will contact you soon with further details.</p>
    <p style="font-size: 16px; color: #555;">If you have any questions, feel free to <a href="mailto:support@clinico.com" style="color: #007bff; text-decoration: none;">contact us</a>.</p>

    <!-- Footer -->
    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
        <p style="font-size: 14px; color: #777;">Best regards,</p>
        <p style="font-size: 16px; font-weight: bold; color: #333;">Clinico Team</p>
    </div>
</div>


`
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully.");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};



const createAppointment = async (req, res) => {
    try {
        const { email, userName, clinicname, clinicownerName, clinicId, availableSlots, consultancyFee } = req.body;


        console.log("Consultancy Fee:", consultancyFee);


        console.log("this is Params", req.params);
        console.log("this is body", req.body);

        // Fetch clinic details
        const clinic = await Clinic.findById(clinicId);
        if (!clinic) {
            return res.status(404).json({ success: false, message: "Clinic not found" });
        }

        // Remove the matched slot from clinic's availableSlots
        availableSlots.forEach(appointmentSlot => {
            clinic.availableSlots.forEach((clinicSlot, index) => {
                if (new Date(clinicSlot.date).toISOString() === new Date(appointmentSlot.date).toISOString()) {
                    // Find and remove the slot from clinic's availableSlots
                    clinic.availableSlots[index].slots = clinicSlot.slots.filter(slot => !appointmentSlot.slots.includes(slot));
                }
            });
        });

        // Save updated clinic data
        await clinic.save();

        // Create a new appointment
        const newAppointment = new Appointment({
            clinicname,
            email,
            userName,
            clinicownerName,
            clinicId,
            availableSlots,
            consultancyFee
        });

        await newAppointment.save();


        if (email) {
            sendAppointmentEmail(email, userName, availableSlots, clinicname, consultancyFee);
        }

        res.status(201).json({
            success: true,
            message: 'Appointment slot created successfully and removed from clinic slots',
            data: newAppointment
        });

    } catch (error) {
        res.status(500).json({ message: 'Error creating appointment', error: error.message });
    }
};



// Get all appointments for a clinic
const getAppointmentsByClinic = async (req, res) => {
    try {

        const appointments = await Appointment.find();

        res.status(200).json({
            message: true,
            data: appointments,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
};

module.exports = { createAppointment, getAppointmentsByClinic };