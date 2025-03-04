require('dotenv').config(); // Load the environment variables

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require('../../models/User');
const nodemailer = require('nodemailer');



// OTP Expiration Time: 5 minutes
const OTP_EXPIRATION_TIME = 5 * 60 * 1000;

// Generate a random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Configure Nodemailer Transporter (Using Gmail)
const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true, // true for port 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});
const sendOTPByEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: `Clinico <${process.env.EMAIL_USER}>`, // Ensure this matches your SMTP account
            to: email,
            subject: 'Your OTP Code',
            html: `<div style="max-width: 500px; margin: auto; font-family: Arial, sans-serif; text-align: center; background: #f4f4f4; padding: 20px; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
    
    <!-- Company Logo -->
    <div style="margin-bottom: 20px;">
        <img src="https://res.cloudinary.com/dtoxsgtel/image/upload/v1741028465/qb247bymzrz0ot4lirpo.png" alt="Clinico Logo" style="max-width: 120px;">
    </div>

    <!-- Company Name -->
    <h2 style="color: #333; margin-bottom: 10px;">Clinico Verification</h2>

    <!-- OTP Message -->
    <p style="font-size: 18px; color: #555; margin-bottom: 15px;">
        Use the OTP below to verify your account and access **Clinico**'s online appointment booking system:
    </p>

    <!-- OTP Code -->
    <div style="display: inline-block; background: #3498db; color: #fff; font-size: 22px; font-weight: bold; padding: 12px 25px; border-radius: 8px; margin-bottom: 20px;">
        ${otp}
    </div>

    <!-- Expiry Notice -->
    <p style="font-size: 14px; color: #777; margin-bottom: 10px;">
        This OTP will expire in <strong>5 minutes</strong>. Please complete the verification process promptly.
    </p>

    <!-- Footer -->
    <p style="font-size: 12px; color: #999; margin-top: 20px;">
        If you did not request this, please ignore this email.<br>
        Need help? Contact <a href="mailto:support@clinico.com" style="color: #3498db; text-decoration: none;">support@clinico.com</a>
    </p>
</div>


      
        `,
        };

        const info = await transporter.sendMail(mailOptions);

    } catch (error) {
        console.error("Error sending email: ", error);
    }
};


const OTPStore = new Map()

const sendingOTP = async (req, res) => {
    const { userName, email, password, role } = req.body;
    console.log(req.body, " this is body")
    try {


        // Generate OTP and set expiration time
        const otp = generateOTP();
        const otpExpiration = Date.now() + OTP_EXPIRATION_TIME;

        // Store OTP in memory (better to use Redis in production)
        OTPStore.set(email, { userName, password, otp, otpExpiration, role });

        // Send OTP via Email
        await sendOTPByEmail(email, otp);



        res.status(200).json({ success: true, message: "OTP sent successfully to email" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error sending OTP" });
    }
};


const verifyOTP = async (req, res) => {
    const { email, otp } = req.body
    try {
        console.log(otp, "this is your otp");


        const storedData = OTPStore.get(email);
        if (!storedData) {
            return res.json({ success: false, message: "OTP expired or not found. Please request again." });
        }

        // Validate OTP
        if (storedData.otp !== otp || Date.now() > storedData.otpExpiration) {
            return res.json({ success: false, message: "Invalid or expired OTP" });
        }

        OTPStore.delete(email);

        res.status(200).json({ success: true, message: "Emial verified!" });


    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Some error occurred" });
    }
}

// for registering the user
const registerUser = async (req, res) => {
    const { userName, email, password, role } = req.body;

    try {
        const checkUser = await User.findOne({ email });
        if (checkUser) {
            return res.json({
                success: false,
                message: "User already exists."
            });
        }

        const hashPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            userName,
            email,
            password: hashPassword,
            role,

        });

        await newUser.save();
        res.status(200).json({
            success: true,
            message: "Registration successful"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Facing some error: " + error
        });
    }
};

// for logging in the user
const loginUser = async (req, res) => {
    const { email, password, loginMethod } = req.body;
    console.log(loginMethod, "its your login method");
    try {
        const checkUser = await User.findOne({ email });
        if (!checkUser) {
            return res.json({
                success: false,
                message: "User doesn't exist"
            });
        }


        if (loginMethod === "password") {

            const checkPassword = await bcrypt.compare(password, checkUser.password);
            if (!checkPassword) {
                return res.json({
                    success: false,
                    message: "Invalid credentials. Please try again."
                });
            }

            // Use the environment variable for the JWT secret key
            const token = jwt.sign({
                id: checkUser._id,
                role: checkUser.role,
                email: checkUser.email,
                userName: checkUser.userName,
                image: checkUser.image

            }, process.env.JWT_SECRET, { expiresIn: '2h' }); // Use environment variable here


            checkUser.isLoggedIn = true;
            await checkUser.save();


            res.cookie('token', token, { httpOnly: true, secure: true, sameSite: "None" }).status(200).json({
                success: true,
                message: "Logged in successfully",
                user: {
                    email: checkUser.email,
                    role: checkUser.role,
                    id: checkUser._id,
                    userName: checkUser.userName,
                    image: checkUser.image

                }
            });
        } else {
            const otp = generateOTP();
            const otpExpiration = Date.now() + OTP_EXPIRATION_TIME;

            OTPStore.set(email, { otp, otpExpiration });



            // Send OTP via Email
            await sendOTPByEmail(email, otp);
            res.status(200).json({ success: true, message: "OTP sent successfully to email" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Some error occurred"
        });
    }
};


const loginwithotp = async (req, res) => {
    const { email, otp } = req.body

    try {
        const storedData = OTPStore.get(email)
        if (!storedData) {
            return res.json({ success: false, message: "OTP expired or not found. Please request again." });
        }

        // Validate OTP
        if (storedData.otp !== otp || Date.now() > storedData.otpExpiration) {
            return res.json({ success: false, message: "Invalid or expired OTP" });
        }
        OTPStore.delete(email);

        const checkUser = await User.findOne({ email });
        if (!checkUser) {
            return res.json({
                success: false,
                message: "User doesn't exist"
            });
        }
        const token = jwt.sign({
            id: checkUser._id,
            role: checkUser.role,
            email: checkUser.email,
            userName: checkUser.userName,
            image: checkUser.image

        }, process.env.JWT_SECRET, { expiresIn: '2h' })

        checkUser.isLoggedIn = true;
        await checkUser.save();
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: "None" }).status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                email: checkUser.email,
                role: checkUser.role,
                id: checkUser._id,
                userName: checkUser.userName,
                image: checkUser.image

            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
}

// logic for logout
const logoutUser = async (req, res) => {
    const userId = req.user._id;

    // Update isLoggedIn to false in the database
    await User.findByIdAndUpdate(userId, { isLoggedIn: false });
    // Clear the token cookie
    res.clearCookie("token").json({
        success: true,
        message: "Logged out successfully."
    });
};

// logic for checking the auth middleware
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token; // Extract token from cookies

        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized. No token provided." });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by decoded ID and attach to req.user
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ success: false, message: "User not found." });
        }

        req.user = user; // Attach user data to request object
        next(); // Proceed to the next middleware or route handler

    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};
module.exports = { registerUser, loginUser, logoutUser, authMiddleware, sendingOTP, verifyOTP, loginwithotp };
