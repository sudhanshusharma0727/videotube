import { Router } from "express";
import { loginUser, logoutUser, refreshAccessToken, registerUser,
  changeCurrentPassword,getCurrentUser,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getUserChannelProfile,getWatchHistory
 } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
//form-data is sent while registering the user and multer is necessary to use while dealing with form data as in definition of multer
//Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
//single file upload-> upload.single(fieldName)
//multiple file upload->upload.fields([{1st file},{2ndfile},----])
//no file upload while and sending only text data in form-data-> upload.none()
//Returns middleware that processes multiple files associated with the given form fields.
// The Request object will be populated with a files object which maps each field name to an array of the associated file information objects
router.route("/register").post(
  upload.fields([
    {
      name:"avatar",
      maxCount: 1
    },
    {
      name: "coverImage",
      maxCount: 1
    }

  ]),
  
  
  registerUser)

  router.route("/login").post(loginUser)


  
  //Router level middleware can be done using .use() and .METHOD() (Method can be-get,post,put,patch,etc) 
  // router.use("/current-user",(req,res,next)=>{
  //   console.log("Request URL:",req.originalUrl);//Request URL: /api/v1/users/current-user
  //   next()
  // },(req,res,next)=>{
  //   console.log("Request Type: ",req.method);//Request Type:  GET
  //   next()
  //   }
  //   )
    //Make sure that your middleware is registered before any route that might respond to /current-user. If another route responds to the same path before your middleware, the middleware might not get executed.



    //secured routes
  router.route("/logout").post(verifyJWT, logoutUser)
  router.route("/refresh-token").post(refreshAccessToken)
  router.route("/change-password").post(verifyJWT, changeCurrentPassword)
   router.route("/current-user").get(verifyJWT, getCurrentUser)
  //-------------OR-------------------
  // router.get("/current-user",verifyJWT,getCurrentUser)
  router.route("/update-account").patch(verifyJWT,upload.none(), updateAccountDetails)//post se saari details update ho jayengi isiliye patch use
  //upload.none() as no files is included in this request only text data is sent.
  //verifyJWT use to check user is loggedin or not
  router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
  router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage)

  router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
  router.route("/history").get(verifyJWT, getWatchHistory)
  

  //NOTE--------
  /* 
  The difference between router.route().get() and router.get() lies in how you define and organize your routes in Express. Both methods achieve similar functionality but are used in slightly different contexts.
   router.route("/current-user").get(verifyJWT, getCurrentUser)
    router.get("/current-user",verifyJWT,getCurrentUser)
    -----------Same result for both----------
    BUT----------
     router.route().get()=>This method allows you to chain multiple HTTP methods (e.g., GET, POST, PUT, DELETE) for a single route.
     Example->
     router.route('/users')
    .get((req, res) => {
        res.send('Get all users');
    })
    .post((req, res) => {
        res.send('Create a new user');
    });

    It groups all the related HTTP methods for a specific route together, making the code more organized, especially when a route has multiple handlers

  */
 
    
 


export default router