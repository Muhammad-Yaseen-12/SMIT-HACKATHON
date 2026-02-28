// Cloudinary configuration
import { v2 as cloudinary } from "cloudinary";
import { ENV } from "../constants/index.js";

cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
});

const uploadFileToCloudinary = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath, {
            folder: ENV.CLOUDINARY_FOLDER_NAME,
        });
        return result;
    } catch (error) {
        console.log(error);
    }
}
const deleteFileFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.log(error);
    }
}

export  {uploadFileToCloudinary,deleteFileFromCloudinary}
