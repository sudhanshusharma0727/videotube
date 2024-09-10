import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";


export const verifyJWT=asyncHandler(async (req, res, next) => {
 try {
  const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
 console.log(token);
 
 
  if(!token)
  {
   throw new ApiError(401,"Unauthorized request")
  }
  
  const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
 
  const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
  if(!user)
  { //TODO(next_video): discuss about frontend
   throw new ApiError(401,"Invalid access Token")
  }
 
  req.user=user;//new object named user is added to req
  next();
 } catch (error) {
  throw new ApiError(401,error?.message || "Invalid access Token")
  
 }
})

