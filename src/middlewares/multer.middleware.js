//Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files.
//Multer adds a body object and a file or files object to the request object. The body object contains the values of the text fields of the form, the file or files object contains the files uploaded via the form.

import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage 
})

//NOTE-> Express File Upload also use instead of multer.

/*
There are two options available, destination and filename. They are both functions that determine where the file should be stored.

destination is used to determine within which folder the uploaded files should be stored. This can also be given as a string (e.g. '/tmp/uploads'). If no destination is given, the operating system’s default directory for temporary files is used.

filename is used to determine what the file should be named inside the folder. If no filename is given, each file will be given a random name that doesn’t include any file extension.

upload
.single(fieldname)
Accept a single file with the name fieldname. The single file will be stored in req.file.

.array(fieldname[, maxCount])
Accept an array of files, all with the name fieldname. Optionally error out if more than maxCount files are uploaded. The array of files will be stored in req.files.

.fields(fields)
Accept a mix of files, specified by fields. An object with arrays of files will be stored in req.files.
fields should be an array of objects with name and optionally a maxCount.

.none()
Accept only text fields. If any file upload is made, error with code “LIMIT_UNEXPECTED_FILE” will be issued.

.any()
Accepts all files that comes over the wire. An array of files will be stored in req.files.

WARNING: Make sure that you always handle the files that a user uploads. Never add multer as a global middleware since a malicious user could upload files to a route that you didn’t anticipate. Only use this function on routes where you are handling the uploaded files.
*/
