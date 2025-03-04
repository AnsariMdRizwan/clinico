const User = require("../models/User"); // Import User model
const Clinic = require("../models/Clinic"); // Import Clinic model
const { imageUploadutils } = require("../helper/cloudinary.js"); // Cloudinary upload utility

const handleImageUpload = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized User" });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        console.log("🟢 File received:", req.file.originalname);

        // Convert image to base64
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        const url = "data:" + req.file.mimetype + ";base64," + b64;

        // Upload image to Cloudinary
        const result = await imageUploadutils(url);
        if (!result || !result.url) {
            return res.status(500).json({ success: false, message: "Image upload failed" });
        }

        console.log("🟢 Image uploaded to Cloudinary:", result.url);

        // ✅ Update user image in the database
        const updatedUser = await User.findOneAndUpdate(
            { email: req.user.email }, // Find user by email
            { image: result.url }, // Update image field
            { new: true } // Return updated user
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log("🟢 User image updated in DB:", updatedUser.image);

        // ✅ Update clinic image in the database (assuming clinic is linked to the user)
        const updatedClinic = await Clinic.findOneAndUpdate(
            { email: req.user.email }, // Find clinic by owner ID
            { image: result.url }, // Update clinic image field
            { new: true } // Return updated clinic
        );

        if (!updatedClinic) {
            console.log("⚠️ Clinic not found for this user");
        } else {
            console.log("🟢 Clinic image updated in DB:", updatedClinic.image);
        }

        // ✅ Send updated user & clinic data to the frontend
        res.json({
            success: true,
            message: "Profile and clinic image updated successfully",
            imageUrl: result.url,
            user: updatedUser,
            clinic: updatedClinic || null, // If no clinic, return null
        });

    } catch (error) {
        console.error("🔴 Upload Error:", error);
        res.status(500).json({
            success: false,
            message: "Error Occurred: " + error.message,
        });
    }
};

module.exports = { handleImageUpload };
