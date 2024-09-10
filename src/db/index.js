//This code is a Node.js module that handles the connection to a MongoDB database using Mongoose, a popular MongoDB ODM (Object Data Modeling) library. It connects to the database asynchronously and provides error handling to ensure the application doesn't continue running if the connection fails.
import mongoose from "mongoose";//mongoose: This is the Mongoose library, which provides a straightforward schema-based solution to model your application data and interact with MongoDB.
import { DB_NAME } from "../constants.js";//DB_NAME: This is a constant imported from another module (constants.js). It contains the name of the database you want to connect to.


//Asynchronous Function to Connect to MongoDB

const connectDB= async () => //This defines an asynchronous function named connectDB. Being asynchronous (async), it can handle asynchronous operations like database connections using the await keyword.
  { 
  try {
    const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    //mongoose gives return object therefore we can hold it in connectionInstance variable  
    console.log(`\n MongoDB connected !! DB HOST: 
      ${connectionInstance.connection.host} `);//pta karne ke liye ki koon se host pe connection ho rha hai
      // console.log(connectionInstance);
      
  } catch (error) {
    console.log("MONGODB connection Failed", error);
    process.exit(1);//read about this in node
  }
}

export default connectDB//This line exports the connectDB function as the default export of this module. It allows other parts of your application to import and use this function to establish a connection to the MongoDB database.

//NOTE->Understand
//mongoose.connect(): This method initiates a connection to the MongoDB server.
//${process.env.MONGODB_URI}/${DB_NAME}: This is the MongoDB URI, which includes the database's location (usually hosted locally or remotely). It’s constructed by combining an environment variable (process.env.MONGODB_URI) with the database name (DB_NAME). The environment variable MONGODB_URI typically contains the protocol, host, and port information for MongoDB.
//await: This ensures the code waits for the connection to complete before proceeding. The connection attempt is wrapped in a try...catch block to handle potential errors.
//If the connection is successful, mongoose.connect() returns an instance of the connection, which is stored in connectionInstance.This object contains details about the connection, such as the host, database name, and connection state.
//console.log():
//This logs a success message to the console, including the host where MongoDB is connected (connectionInstance.connection.host).
//If the connection attempt fails, the catch block captures the error and logs an error message to the console.
//process.exit(1): This forces the Node.js process to exit with a status code of 1, indicating an error. This is useful for stopping the application if the database connection fails, as continuing without a database connection would likely cause more issues.

/*Summary:
1. Purpose: This module provides a reusable function (connectDB) that connects your Node.js application to a MongoDB database using Mongoose.
2. Environment Variables: The database URI is pulled from environment variables (process.env.MONGODB_URI), allowing for different configurations in different environments (e.g., development, production).
3. Error Handling: If the connection fails, it logs the error and exits the application to prevent further issues.
4. Asynchronous: The connection is handled asynchronously to ensure non-blocking operation within the Node.js event loop. */