const express= require('express');

const {handleImageUpload} =require('../../common/images');
const { upload } = require('../../helper/cloudinary');
const { authMiddleware } = require('../../controllers/auth/auth-controller');

const router = express.Router();

router.post("/upload_image", authMiddleware, upload.single("my_file"), handleImageUpload);

module.exports= router;