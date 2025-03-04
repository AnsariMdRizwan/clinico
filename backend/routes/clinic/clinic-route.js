const express = require("express")
const router = express.Router();
const { verifyClinic, addNewClinic, fetchingClinic, editclinicdetails } = require("../../common/clinicVerification");
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const { getAllClinics, updateAvailableSlots, deleteAvailableSlot } = require("../../controllers/doctors/clinic-controller")

router.get('/clinic-details', authMiddleware, verifyClinic, (req, res) => {
    res.status(200).json({
        success: req.clinic ? true : false,
        message: req.clinic ? "Clinic verified" : "No matching clinic found",
        clinic: req.clinic || null  // ✅ Always return something to prevent frontend retry loops
    });
});

router.post('/add', addNewClinic);
router.put('/edit/:id', editclinicdetails);
router.get('/get', authMiddleware, fetchingClinic);
router.get('/getall', getAllClinics);
router.put('/update-slots/:clinicId', updateAvailableSlots);
router.delete('/:clinicId/slots', deleteAvailableSlot);


module.exports = router;
