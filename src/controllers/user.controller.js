import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary,deleteFromCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

// console.log(asyncHandler);//[Function: asyncHandler]
// console.log(typeof asyncHandler);//function

const generateAccessAndRefereshTokens = async(userId) =>{
  try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({ validateBeforeSave: false })

      return {accessToken, refreshToken}


  } catch (error) {
      throw new ApiError(500, "Something went wrong while generating refresh and access token")
  }
}

const registerUser = asyncHandler( async (req,res) => {
  // res.status(200).json({
  //   message: "chai aur code" 
  // })
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db(using .create)
    // remove password and refresh token field from response
    // check for user creation
    // return res

    //Note->
    //console.log(req);
    
    const {fullName, email,username,password }=req.body//destructering(used to extract specific properties from the req.body object.)
    //Note-> Example of body object
    //body: [Object: null prototype] {
//     fullName: 'three',
//     email: 'three@gmail.com',
//     password: '12345678',
//     username: 'three'
//   },

   // console.log(req.body);

    
    // console.log("email: ",email);
    // console.log("fullName: ",fullName);
    // console.log("username: ",username);
    // console.log("password: ",password);
    // console.log("req.body: ",req.body);
    /* email:  Sudhanshupandat2000@gmail.com
fullName:  Sudhanshu Sharma
username:  Sudhanshu
password:
req.body:  {
  username: 'Sudhanshu',
  password: '',
  fullName: 'Sudhanshu Sharma',
  email: 'Sudhanshupandat2000@gmail.com'
} */
// Aboove output come when below data sent through postman to the server
//{
//   "username":"Sudhanshu",
//   "password": "",
//   "fullName":"Sudhanshu Sharma",
//   "email":"Sudhanshupandat2000@gmail.com"

// }

// validation-----------
// if(fullName===""){
//   throw new ApiError(400,"fullname is required")
// }
if(
  [fullName,email,username,password].some((field)=>
  field?.trim()==="")
)
{
  throw new ApiError(400,"all fields are required")
}
// check if user already exists: username, email-----------
//User.findOne({username}) for separate check
//User.findOne({email}) for separate check
const existedUser = await User.findOne({ 
  $or: [{ username }, { email }]
 });
if (existedUser) {
  throw new ApiError(409, " User with username or email already exists");
  }
 //console.log(req.files);
  //Note-> req.files output
  /* 
  [Object: null prototype] {
   avatar: [
    {
      fieldname: 'avatar',
      originalname: 'imresizer-1711729394468.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: './public/temp',
      filename: 'imresizer-1711729394468.jpg',
      path: 'public\\temp\\imresizer-1711729394468.jpg',
      size: 21280
    }
  ],
  coverImage: [
    {
      fieldname: 'coverImage',
      originalname: '6P0A8052.JPG',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: './public/temp',
      filename: '6P0A8052.JPG',
      path: 'public\\temp\\6P0A8052.JPG',
      size: 5335289
    }
  ]
}
  */
   const avatarLocalPath=req.files?.avatar[0]?.path;
  //const coverImageLocalPath=req.files?.coverImage[0]?.path;
   //if coverImage is empty in postman
  let coverImageLocalPath;
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0)
  {
    coverImageLocalPath=req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400,"Avatar file is required")
  }

  const avatar=await uploadOnCloudinary(avatarLocalPath)
 //console.log(avatar);(public_id,url,----etc)
  
  const coverImage=await uploadOnCloudinary(coverImageLocalPath)

  if (!avatar) {
    throw new ApiError(400,"Avatar file is required")

  }

  const user=await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    username:username.toLowerCase(),
    password,

  })
  //console.log(user) (study)
  

  const createdUser=await  User.findById(user._id).select(
    "-password -refreshToken"

  )
 // console.log(createdUser);
//   {
//     _id: new ObjectId('66d499122f1d96a118034ace'),
//     username: 'two',
//     email: 'two@gmail.com',
//     fullName: 'two',
//     avatar: 'http://res.cloudinary.com/sudhanshu2707/image/upload/v1725208837/ywixsdvay9gpxnxghueh.jpg',
//     coverImage: 'http://res.cloudinary.com/sudhanshu2707/image/upload/v1725208849/crmxk3asdgizokagbkvi.jpg',
//     watchHistory: [],
//     createdAt: 2024-09-01T16:40:50.898Z,
//     updatedAt: 2024-09-01T16:40:50.898Z,
//     __v: 0
//   }
  

  if (!createdUser) {
    throw new ApiError(500,"Something went wrong while registering the user")
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  )

})


//login user-----------
const loginUser = asyncHandler(async (req, res) =>{
  // req body -> data
  // username or email available or not
  //find the user
  //password check
  //access and referesh token
  //send cookie(token send)

  const {email, username, password} = req.body
  console.log(email);

  if (!username && !email) {
      throw new ApiError(400, "username or email is required")
  }
  
  // Here is an alternative of above code based on logic discussed in video:
  // if (!(username || email)) {
  //     throw new ApiError(400, "username or email is required")
      
  // }

  const user = await User.findOne({
      $or: [{username}, {email}]
  })
//$or->mongodb operator which takes array of objects jo bhi value pehle mil jayegi woh return ho jayegi
  if (!user) {
      throw new ApiError(404, "User does not exist")
  }

 const isPasswordValid = await user.isPasswordCorrect(password)

 if (!isPasswordValid) {
  throw new ApiError(401, "Invalid user credentials")
  }

 const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  //design option before sending cookies
  const options = {
      httpOnly: true,
      secure: true
  }//ab inn cookies ko frontend se modify nhi kar sakte yeh sirf server se hi modify hongi
  
  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
      new ApiResponse(
          200, 
          {
              user: loggedInUser, accessToken, refreshToken
          },
          "User logged In Successfully"
      )
  )

})
//logout user---------
const logoutUser = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(
      req.user._id,
      {
          $unset: {
              refreshToken: 1 // this removes the field from document
          }
      },
      {
          new: true
      }
  )

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged Out"))
})
//refreshAccessToken--------
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request")
  }

  try {
      const decodedToken = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
      )
  
      const user = await User.findById(decodedToken?._id)
  
      if (!user) {
          throw new ApiError(401, "Invalid refresh token")
      }
  
      if (incomingRefreshToken !== user?.refreshToken) {
          throw new ApiError(401, "Refresh token is expired or used")
          
      }
  
      const options = {
          httpOnly: true,
          secure: true
      }
  
      const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
  
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
          new ApiResponse(
              200, 
              {accessToken, refreshToken: newRefreshToken},
              "Access token refreshed"
          )
      )
  } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token")
  }

})

//changeCurrentPassword-----------
const changeCurrentPassword = asyncHandler(async(req, res) => {
  const {oldPassword, newPassword} = req.body
  
  const user = await User.findById(req.user?._id)
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
  
  if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid old password")
  }
  
  user.password = newPassword
  await user.save({validateBeforeSave: false})

  return res
  .status(200)
  .json(new ApiResponse(200, {}, "Password changed successfully"))
})

//getCurrentUser--------------
const getCurrentUser = asyncHandler(async(req, res) => {
    // console.log(req.originalUrl);///api/v1/users/current-user
    // console.log(req.method);//GET
    // console.log(req.path);///current-user
    // console.log(req.cookies.accessToken);
    
   // console.log(req);// only to study about request
 
  return res 
  .status(200)
  .json(new ApiResponse(
      200,
      req.user,
      "User fetched successfully"
  ))
})
//updateAccountDetails------------
const updateAccountDetails = asyncHandler(async(req, res) => {
   // console.log(req);
    //Note-> In Postman while check this route select body->raw->JSON then
    //{
//     "fullName":"seven",
//     "email":"seven@gmail.com"
//    }
  const {fullName,email} = req.body
  //body: { fullName: 'seven', email: 'seven@gmail.com' }
//   console.log(fullName,email);
  

  if (!fullName && !email) {
      throw new ApiError(400, "All fields are required")
  }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set: {
              fullName,//ES6 syntax
              // email: email
              email
          }
      },
      {new: true}
      
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200, user, "Account details updated successfully"))
});
//updateUserAvatar-----------
const updateUserAvatar = asyncHandler(async(req, res) => {
  const avatarLocalPath = req.file?.path

  if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is missing")
  }
   
  
  //TODO: delete old image - assignment
  const deleteAvatar=await deleteFromCloudinary(req.user?.avatar)

  const avatar = await uploadOnCloudinary(avatarLocalPath)

  if (!avatar.url) {
      throw new ApiError(400, "Error while uploading on avatar")
      
  }
   
  const user = await User.findByIdAndUpdate(
      req.user?._id,//optionally umwrap
      {
          $set:{
              avatar: avatar.url
          }
      },
      {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
      new ApiResponse(200, user, "Avatar image updated successfully")
  )
})
//updateUserCoverImage--------------
const updateUserCoverImage = asyncHandler(async(req, res) => {
  const coverImageLocalPath = req.file?.path

  if (!coverImageLocalPath) {
      throw new ApiError(400, "Cover image file is missing")
  }
  
 
  //TODO: delete old image - assignment
  const deleteCoverImage=await deleteFromCloudinary(req.user?.coverImage)


  const coverImage = await uploadOnCloudinary(coverImageLocalPath)

  if (!coverImage.url) {
      throw new ApiError(400, "Error while uploading on avatar")
      
  }

//   const oldCoverImagePublicId = oldImagedelete.avatarPublicId;
//   if (oldCoverImagePublicId) {
//     await deleteFromCloudinary(oldCoverImageublicId);
// }

  const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
          $set:{
              coverImage: coverImage.url
          }
      },
      {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(
      new ApiResponse(200, user, "Cover image updated successfully")
  )
})
//getUserChannelProfile-----------
const getUserChannelProfile = asyncHandler(async(req, res) => {
  const {username} = req.params
  //console.log(req);
  

  if (!username?.trim()) {
      throw new ApiError(400, "username is missing")
  }

  const channel = await User.aggregate([
      {
          $match: {
              username: username?.toLowerCase()
          }
      },
      {
          $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers"
          }
      },
      {
          $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "subscriber",
              as: "subscribedTo"
          }
      },
      {
          $addFields: {
              subscribersCount: {
                  $size: "$subscribers"
              },
              channelsSubscribedToCount: {
                  $size: "$subscribedTo"
              },
              isSubscribed: {
                  $cond: {
                      if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                      then: true,
                      else: false
                  }
              }
          }
      },
      {
          $project: {
              fullName: 1,
              username: 1,
              subscribersCount: 1,
              channelsSubscribedToCount: 1,
              isSubscribed: 1,
              avatar: 1,
              coverImage: 1,
              email: 1

          }
      }
  ])
   console.log(channel);
   /* 
   [
  {
    _id: new ObjectId('66d2f1ec390a87d2932608df'),
    username: 'five',
    email: 'five@gmail.com',
    fullName: 'five',
    avatar: 'http://res.cloudinary.com/sudhanshu2707/image/upload/v1725100514/j0yw6ycnkxgg0pb7dvm7.jpg',    
    coverImage: 'http://res.cloudinary.com/sudhanshu2707/image/upload/v1725100524/m6vyov7rxxqfixoiyo3j.jpg',
    subscribersCount: 0,
    channelsSubscribedToCount: 0,
    isSubscribed: false
  }
]
   */

  if (!channel?.length) {
      throw new ApiError(404, "channel does not exists")
  }
  
  return res
  .status(200)
  .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
  )
})
//getWatchHistory------------------
const getWatchHistory = asyncHandler(async(req, res) => {
  const user = await User.aggregate([
      {
          $match: {
               _id: new mongoose.Types.ObjectId(req.user._id)
          }
      },
      {
          $lookup: {
              from: "videos",
              localField: "watchHistory",
              foreignField: "_id",
              as: "watchHistory",
              pipeline: [
                  {
                      $lookup: {
                          from: "users",
                          localField: "owner",
                          foreignField: "_id",
                          as: "owner",
                          pipeline: [
                              {
                                  $project: {
                                      fullName: 1,
                                      username: 1,
                                      avatar: 1
                                  }
                              }
                          ]
                      }
                  },
                  {
                      $addFields:{
                          owner:{
                              $first: "$owner"
                          }
                      }
                  }
              ]
          }
      }
  ])

  return res
  .status(200)
  .json(
      new ApiResponse(
          200,
          user[0].watchHistory,
          "Watch history fetched successfully"
      )
  )
})


export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
}
