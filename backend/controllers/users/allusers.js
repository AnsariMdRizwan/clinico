const user = require("../../models/User"); // Import the User model

// Controller to fetch all users
const getAllUsers = async (req, res) => {
    try {
        const users = await user.find(); // Fetch all users
        console.log(users)
        res.status(200).json({ success: true, data: users });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error", error });
    }
};

module.exports = { getAllUsers };
