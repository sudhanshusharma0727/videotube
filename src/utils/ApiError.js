//The ApiError class in the code is a custom error class that extends the built-in Error class in JavaScript. This class is designed to provide a structured way to handle errors in an API, with additional information such as status codes, error messages, and more.

class ApiError extends Error {
  constructor(
      statusCode,
      message= "Something went wrong",
      errors = [],
      stack = ""
  ){
      super(message)
      this.statusCode = statusCode//overwrite status code with received statuscode
      this.data = null
      this.message = message
      this.success = false;
      this.errors = errors


      //Below code is used in production-------
      //This code can be avoided if  not understand
      if (stack) {
          this.stack = stack
      } else{
          Error.captureStackTrace(this, this.constructor)
      }

  }
}

export {ApiError}


//Class Declaration--
//ApiError: This is a custom error class that extends the built-in Error class. By extending Error, ApiError inherits all the properties and methods of the Error class, and you can add additional functionality specific to your application's needs.

//Constructor Method--
//The constructor method is called when a new instance of the ApiError class is created.
/* Parameters:
1. statusCode: The HTTP status code associated with the error (e.g., 404 for "Not Found", 500 for "Internal Server Error").
2. message: The error message. This has a default value of "Something went wrong".
3. errors: An array that can hold multiple error details. This is useful when you want to return multiple validation errors, for example.
4. stack: The stack trace of the error, which provides information about where the error occurred in the code. This can be passed explicitly or generated automatically. */

//Calling the Superclass Constructor--
//The super(message) call invokes the constructor of the parent Error class with the message parameter. This ensures that the message property is set correctly in the Error object.

//Assigning Properties----
/*
 1. this.statusCode = statusCode: Assigns the statusCode to the instance, which can be used later to set the HTTP response status.
 2. this.data = null: Initializes a data property with null. This could be used later if you want to attach additional data to the error response.
 3. this.message = message: Assigns the error message to the instance.
 4. this.success = false: Sets a success property to false, which is a common pattern in API responses to indicate failure.
 5. this.errors = errors: Assigns the array of errors to the instance. This allows you to store multiple error messages or details. */

 // Handling the Stack Trace-----
 /* 
 Custom Stack Trace:
1. if (stack): If a custom stack trace is provided, it assigns it to this.stack.
2. Error.captureStackTrace(this, this.constructor): If no custom stack is provided, this method captures the stack trace and associates it with the current ApiError instance. 
3. Error.captureStackTrace is a V8-specific feature (used in Chrome and Node.js) that creates a .stack property on the object, which contains a string representation of the current stack trace. 
 */

//SUMMARY--------
//The ApiError class is a custom error-handling utility that extends the standard Error class. It allows you to create errors with additional context, such as an HTTP status code, a detailed message, and an array of specific errors. It also handles stack traces in a way that makes debugging easier. This class can be very useful in a web application or API to standardize error responses and improve error handling.