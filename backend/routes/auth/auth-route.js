

const express = require("express")
const { registerUser, loginUser, logoutUser, authMiddleware, sendingOTP, verifyOTP, loginwithotp } = require("../../controllers/auth/auth-controller")


const router = express.Router();

router.post('/register', registerUser)
router.post('/sendopt', sendingOTP)
router.post('/loginwithotp', loginwithotp)
router.post('/verifyotp', verifyOTP)
router.post('/login', loginUser)
router.post('/logout', authMiddleware, logoutUser)
router.get('/check-auth', authMiddleware, (req, res) => {
    const user = req.user;
    res.status(200).json({
        success: true,
        message: "Authorized User",
        user,
    })
})


module.exports = router;
