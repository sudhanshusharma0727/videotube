// require('dotenv').config({path: './env'})// yha pe likhne se code consistency kharab hoti hai isiliye neeche likhenge.

import dotenv from "dotenv"// This module loads environment variables from a .env file into process.env, allowing you to use environment-specific variables without hardcoding them.

import  connectDB from "./db/index.js"; //This is the function imported from the db/index.js file. It’s the function that connects to the MongoDB database using Mongoose.


import {app} from './app.js'

//Environment Variables Configuration------------------------
dotenv.config({
  path: './.env'
})//package.json mei scripts mein dev ke andar bhi configure kar rakha hai toh iss config. ko hta bhi sakte hai
//dotenv.config(): This method loads environment variables from a file into process.env. The path option specifies the location of the environment file, in this case, ./env.

// Connecting to MongoDB and Starting the Server---------------------

connectDB()//connectDB(): This function attempts to connect to the MongoDB database. It returns a promise, so .then() and .catch() are used to handle success and failure, respectively.
.then(()=>{
  app.listen(process.env.PORT || 8000,()=>{
    console.log(`Server is running at port:${process.env.PORT}`);
    
  })
})
.catch((err) => console.log("MONGO DB CONNECTION FAILED!!",err));
//Error Handling--------------------
app.on('error', (error) => {
  console.log('ERROR:', error);
  throw error;
});
//app.on('error', ...): This sets up a global error handler for the Express application. If an error occurs anywhere in the application, this handler will log the error and then throw it, which could be caught by a higher-level error handler or cause the process to crash.
//------OR---------
//The app.on('error', (error) => { ... }) block will catch any errors emitted by the Express application and log them. It will also re-throw the error to ensure it doesn't go unnoticed.

//NOTE->
//.then(): If the database connection is successful, the server is started using app.listen()
//app.listen(process.env.PORT || 8000, () => {...}): This starts the Express server. It listens on the port specified by the PORT environment variable, or 8000 if the variable is not set.
//console.log(): This logs a message to the console indicating that the server is running and on which port.
//.catch(): If the database connection fails, an error message is logged.

/*Summary:
1. Environment Variables: Managed using dotenv, environment variables like PORT are loaded from a file, making the application configuration flexible and environment-specific.
2. Database Connection: The connectDB() function is called to connect to MongoDB. The server only starts if the database connection is successful, ensuring the app doesn’t run without a critical dependency.
3. Error Handling: Errors during database connection or within the Express app are logged and handled to prevent the application from failing silently.
This setup ensures that the application is robust and configurable, with proper error handling and dependency management. */






//POLLUTE INDEX.JS FILE SO SEPARATELY STORE DB CONNECTION-------------

/*
import mongoose from "mongoose"
import { DB_NAME } from "./constants.js"
import express from "express"
const app=express()
//IIFE
;( async()=>{
   try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error", (error)=>{
      console.log("ERROR: ",error);
      throw error
      
    })
    app.listen(process.env.PORT,()=>{
      console.log(`App is listening on port ${process.env.PORT}`);
      
    })
   } catch (error) {
    console.log("ERROR: ",error);
    throw error
   }
})();
   */