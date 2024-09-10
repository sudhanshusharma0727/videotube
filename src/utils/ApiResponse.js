class ApiResponse {
  constructor(statusCode, data, message = "Success"){
      this.statusCode = statusCode
      this.data = data
      this.message = message
      this.success = statusCode < 400
  }
}

export { ApiResponse }
//The ApiResponse class is designed to standardize the structure of responses in an API. This class encapsulates important aspects of an API response, such as the status code, data, and a success message, making it easier to manage and return consistent responses throughout an application.

//Class Declaration----
//ApiResponse: This is a custom class that provides a structured way to create API responses. It packages the response's status code, data, and message into a single object.

//Constructor Method---
//The constructor method is called when a new instance of the ApiResponse class is created.
// Parameters:
// statusCode: The HTTP status code that represents the outcome of the request (e.g., 200 for success, 404 for not found).
// data: The actual data or payload that you want to return in the response. This could be any type of data, such as an object, array, or even a string.
// message: A descriptive message about the result of the request. The default value is "Success", indicating a successful operation.

// Assigning Properties---
//this.statusCode = statusCode: Assigns the provided HTTP status code to the instance. This status code indicates the result of the API request (e.g., 200 for OK, 404 for Not Found).
// this.data = data: Assigns the provided data to the instance. This is the payload of the response, which could be any information the server needs to send back to the client.
// this.message = message: Assigns the provided message (or the default "Success") to the instance. This message provides additional context about the response, such as "Resource created" or "Invalid input".
// this.success = statusCode < 400: This is a boolean property that is automatically set based on the statusCode. If the status code is less than 400, it indicates a successful operation, and success is set to true. Otherwise, it is false. This is a common pattern to easily check if the operation was successful.


//Summary----
// The ApiResponse class standardizes API responses by bundling the status code, data, and message into a single object. This makes it easier to maintain consistency across different parts of an application and simplifies the process of handling and returning API responses.

// The class also includes a success property that automatically determines whether the operation was successful based on the status code, allowing for straightforward checks in the client-side or other parts of the server-side code.