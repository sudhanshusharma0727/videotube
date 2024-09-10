//The asyncHandler function is a utility that simplifies error handling for asynchronous operations in Express.js. It wraps your async route handlers, ensuring that any errors are automatically caught and passed to the next middleware, typically an error handler, without requiring explicit try-catch blocks in your route handlers.
//asyncHandler: This is a higher-order function, meaning it takes a function (requestHandler) as an argument and returns a new function.
//requestHandler: This is the original asynchronous route handler function that you want to wrap. It's expected to be an async function that deals with requests and responses in an Express route.
//The asyncHandler returns a new function, which is the actual middleware that will be used in the Express route.

//PURPOSE-----
//The purpose of the asyncHandler function is to simplify error handling in asynchronous route handlers. Without asyncHandler, you would need to manually add try-catch blocks around your asynchronous code to catch errors and pass them to the next function. This utility abstracts that boilerplate away, so you can focus on writing the logic for your route without worrying about error handling.
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
      Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
      
  }
}

export { asyncHandler }

// const asyncHandler =()=>{}
// const asyncHandler =(func)=>{()=> {}}//OR below
// const asyncHandler =(func)=>()=> {}
// const asyncHandler =(func)=> async ()=> {}

// const asyncHandler = (fn) => async(req,res,next)  => {
//   try {
//     await fn(req,res,next)
    
//   } catch (err) {
//     res.status(err.code || 500).json({
//       success: false,
//       message:err.message
//     })
//   }
// }

//Here's how you might use asyncHandler in an Express.js route:
//import express from 'express';
// import { asyncHandler } from './path/to/asyncHandler';

// const app = express();

// app.get('/some-route', asyncHandler(async (req, res, next) => {
     // Some asynchronous code here
//     const data = await someAsyncFunction();
//     res.json(data);
// }));

// app.use((err, req, res, next) => {
     // Error-handling middleware
//     res.status(500).json({ message: err.message });
// });

// app.listen(3000, () => console.log('Server running on port 3000'));

/* The asyncHandler wraps the asynchronous route handler. If an error occurs during the asynchronous operation (e.g., someAsyncFunction() throws an error), the error is automatically caught and passed to the error-handling middleware.
This allows you to write cleaner, more maintainable code without repetitive try-catch blocks in each route. */