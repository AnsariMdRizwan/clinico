
const Clinics = require("../models/Clinic");
const Users = require("../models/User");

const verifyClinic = async (req, res, next) => {

    try {
        if (!req.user || !req.user.email) {
            return res.status(400).json({
                success: false,
                message: "Invalid request: Email is missing in request"
            });
        }

        const userEmail = req.user.email;

        // Find the user by email
        const user = await Users.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find the clinic by email
        const clinic = await Clinics.findOne({ email: userEmail });
        if (!clinic) {
            return res.status(403).json({
                success: false,
                message: "Access Denied: No matching clinic found"
            });
        }

        // If user and clinic emails match, consider the person the same
        if (user.email !== clinic.email) {
            return res.status(403).json({
                success: false,
                message: "Access Denied: User is not associated with the clinic"
            });
        }

        req.clinic = clinic;
        next(); // Proceed to the next middleware

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error: " + error.message
        });
    }
};


const addNewClinic = async (req, res) => {
    console.log(req.user);

    try {
        const { availableSlots, clinicname, clinicownerName, clinictype, registrationNumber, phone, country, state, city, degree, image, address, email } = req.body;

        const createNewClinic = new Clinics({
            clinicname, clinicownerName, clinictype, registrationNumber, phone, country, state, image, address, email, city, degree, availableSlots
        })





        await createNewClinic.save();
        res.status(201).json({
            success: true,
            data: createNewClinic
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error Occured: ' + error
        })
    }
}

const editclinicdetails = async (req, res) => {
    console.log(req.params)
    console.log("recieving the request", req.body)
    try {
        const { id } = req.params;
        const { availableSlots, clinicname, clinicownerName, clinictype, registrationNumber, phone, country, state, city, degree, image, address, email, fee } = req.body;

        let findClinic = await Clinics.findById(id)

        if (!findClinic) {
            return res.status(404).json({
                success: false,
                message: "Clinic not Found "
            })
        }

        findClinic.clinicname = clinicname || findClinic.clinicname

        findClinic.clinicownerName = clinicownerName || findClinic.clinicownerName

        findClinic.clinictype = clinictype || findClinic.clinictype

        findClinic.registrationNumber = registrationNumber || findClinic.registrationNumber

        findClinic.phone = phone || findClinic.phone

        findClinic.country = country || findClinic.country

        findClinic.state = state || findClinic.state

        findClinic.city = city || findClinic.city

        findClinic.image = image || findClinic.image
        findClinic.address = address || findClinic.address
        findClinic.degree = degree || findClinic.degree
        findClinic.email = email || findClinic.email
        findClinic.fee = fee || findClinic.fee

        await findClinic.save();
        res.status(200).json({
            success: true,
            data: findClinic
        })

    } catch (e) {
        console.log(e)
        res.status(500).json({
            success: false,
            message: 'Error Occured :' + e
        })
    }
}


const fetchingClinic = async (req, res) => {
    try {

        if (!req.user) {
            return res.status(400).json({
                success: false,
                message: "user not Found",
            });
        }

        const userEmail = req.user.email;
        const ClinicId = req.user.email;
        const listOfClinics = await Clinics.find({ email: ClinicId })
        const user = await Users.findOne({ email: userEmail });
        const clinic = await Clinics.findOne({ email: userEmail });

        if (user?.email !== clinic?.email) {
            return res.status(403).json({
                success: false,
                message: "Access Denied: User is not associated with the clinic"
            });
        }

        res.status(200).json({
            success: true,
            data: listOfClinics,
        });
    } catch (e) {
        console.log(e);
        res.status(500).json({
            success: false,
            message: "Error Occurred" + e,
        });
    }
};










module.exports = { verifyClinic, addNewClinic, fetchingClinic, editclinicdetails };
