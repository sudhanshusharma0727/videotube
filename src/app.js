//This code is setting up an Express.js server with middleware to handle cross-origin requests, JSON parsing, URL-encoded data, static file serving, and cookie parsing.
import express from"express"
import cors from "cors"// This module allows your Express server to handle Cross-Origin Resource Sharing (CORS), which enables your server to accept requests from different origins (domains).
import cookieParser from "cookie-parser"//This middleware parses cookies attached to the client request object, making it easy to access and manipulate cookies.

//Temporary for solving error during sending form data in postman in updateAccoutDetails
// import multer from "multer";
// const upload = multer();

//Creating an Express Application-----------
const app=express()//This creates an instance of an Express application, which will be used to configure middleware, define routes, and start the server.
//CORS and cookieparser are configured after making app.
// Middleware Configuration--------
  //CORS Middleware------
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))
  //JSON Body Parsing Middleware------
app.use(express.json({limit: "16kb"}))// Parses incoming JSON requests and puts the parsed data in req.body
  //URL-Encoded Body Parsing Middleware-----
app.use(express.urlencoded({extended: true,limit: "100kb"}))//When you send data using x-www-form-urlencoded, Express can easily parse it using the express.urlencoded() middleware.

  //Static File Serving Middleware---------
app.use(express.static("public"))
  //Cookie Parsing Middleware-----
app.use(cookieParser())//app.use(cookieParser()) is a middleware in Express.js used to parse cookies sent with HTTP requests. This middleware populates the req.cookies object with cookies sent by the client, making them available for your route handlers.

//use of cookieParser-> apne server se user ke browser ki cookie ko access kar paye and uski cookies set bhi kar paye
//uski cookies par crud operations perform kar paaye basically.

//f you need to handle form-data, especially when dealing with file uploads, you'll need to use a middleware like multer.
//app.use(upload.none());
//write this in updateAccountDetails as to ensure that this will not cause issue as it is globally declared.


//Routes
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
  


// routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)





//Exporting the express App
export { app }//OR export default app
//This line exports the configured app instance, making it available for import in other files of your application. This is typically used in a file where the server is started, or in a testing setup where the app instance is needed.

//NOTE->--------------
//Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle.
//cors(): This middleware allows your server to handle cross-origin requests.
//origin: process.env.CORS_ORIGIN: This specifies which origin (domain) is allowed to access resources from your server. The value of CORS_ORIGIN is typically set in your environment variables, allowing you to control access based on the environment (e.g., development, production).
//credentials: true: This allows credentials (such as cookies, authorization headers, or TLS client certificates) to be included in cross-origin requests.

/*xpress.json(): This middleware parses incoming JSON payloads and makes them available in req.body.
limit: "16kb": This restricts the maximum size of the JSON payload that the server will accept to 16 kilobytes. This helps prevent denial-of-service attacks by limiting the amount of data that can be sent to your server in a single request. */

/*express.urlencoded(): This middleware parses incoming requests with URL-encoded payloads (typically from HTML forms) and makes them available in req.body.
extended: true: This option allows for the parsing of nested objects, making the URL-encoded data more flexible.
limit: "16kb": Like the JSON parser, this restricts the maximum size of the URL-encoded data. */

/*express.static(): This middleware serves static files such as images, CSS files, and JavaScript files from the "public" directory.
For example, if a file public/image.png exists, it can be accessed via http://yourserver.com/image.png. */

//cookieParser(): This middleware parses the cookies attached to the incoming request and populates req.cookies with an object keyed by the cookie names. This makes it easy to work with cookies in your routes.

/*Summary:
1. CORS Handling: The server is configured to accept requests from specific origins with credentials.
2. Body Parsing: The server can handle JSON and URL-encoded form data, with size limitations for security.
3. Static Files: The server can serve static assets from a specified directory.
4. Cookie Handling: Cookies are parsed and available for easy access.
5. Exporting the App: The configured Express app is exported for use elsewhere in the application.
This setup provides a robust foundation for building an Express server with essential middleware for handling requests, responses, and common web functionalities.  */