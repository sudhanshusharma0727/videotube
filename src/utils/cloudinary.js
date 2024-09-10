import {v2 as cloudinary} from "cloudinary"// v2 rename to cloudinary
import fs from "fs"// node js file system in built hota hai no need to import
//file read,write etc opeartions perform help


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});


//server se localFilePath milega and hum uss file ko cloudinary pe upload kar denge
//then file ko server se delete kar denge if successfully uploaded on cloudinary
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary ", response.url);
        //Example->
        // file is uploaded on cloudinary  http://res.cloudinary.com/sudhanshu2707/image/upload/v1725097788/bxtqwgyxvkdlftzhljov.jpg
        fs.unlinkSync(localFilePath)// synchronously unlink(yeh kaam kare bina aage mat jana)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}
const deleteFromCloudinary = async (url) => {
    try {
      if (!url) return null;
      const publicId = url.substring(
        url.lastIndexOf("/") + 1,
        url.lastIndexOf(".")
      );
      // destroy file from cloudinary
      const response = await cloudinary.uploader.destroy(publicId);
      // console.log("File has been deleted from cloudinary successfully!!");
      console.log("Cloudinary res: ", response);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  };


export {uploadOnCloudinary,deleteFromCloudinary}