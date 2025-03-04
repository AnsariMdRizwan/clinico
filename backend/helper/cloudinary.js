const cloudinary = require('cloudinary').v2

const multer = require('multer')

cloudinary.config({
    cloud_name:'dtoxsgtel',
    api_key:'653828187886374',
    api_secret:'0vJNxHeBIQnd5WZJD0D9R3cqwx0'
})


const storage = new multer.memoryStorage();
const upload = multer({storage});


const imageUploadutils = async(file)=>{
    console.log(file);
    const result = await cloudinary.uploader.upload
    (file,{
        resource_type:'auto'
    })
    return result;
}

module.exports ={upload,imageUploadutils}