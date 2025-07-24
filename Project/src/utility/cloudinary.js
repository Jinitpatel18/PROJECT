import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'Jinit-Patel',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new Error("No file path provided for upload");
        }
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto' // Automatically detect the resource type (image, video, etc.)
        });
        console.log("File uploaded successfully:", result.url);
        fs.unlinkSync(localFilePath); // Remove the local file after upload
        return result;
    } catch (error) {
        // fs.unlinkSync(localFilePath); //Remove the locally saved file as the upload failed
        console.error("Error uploading file to Cloudinary:", error);
        throw error; // Re-throw the error for further handling
    }
}
