import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"// to generate tokens(headers,payload(Data),verify signature)
import bcrypt from "bcrypt"//helps you to hash your password

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true// searching field kisi bhi field pe enable karni hai uske liye
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true, 
            index: true
        },
        avatar: {
            type: String, // cloudinary url
            required: true,
        },
        coverImage: {
            type: String, // cloudinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']//custom error message with true field.
        },
        refreshToken: {
            type: String
        }

    },
    {
        timestamps: true
    }
)
//pre hook(Triggers before document is saved ) type of middleware which occurs on an event
//Types of event-> save,validate,remove,updateOne,deleteOne,init(synchronous)
//userSchema.pre("event",callBack function(not include arrow function as in arrow this ka reference nhi hota hai ))
//Middleware pe next() ka access toh hona hi chahiye
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();
    // const salt = await bcrypt.genSalt(10);
    // this.password = await bcrypt.hash(this.password, salt);

    this.password = await bcrypt.hash(this.password, 10)
    next()// In pre hooks, you must call next() to proceed with the operation. Otherwise, the operation will be paused.
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)//(user wala password,db mei store hashed password)
    //returns true or false value
}

//jwt is a bearer token(interview)
//yeh token jo bhi bhejega usko data mil jayega like lock and key mechanism
//jiske bhi bass key hai woh data access kar lega
userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {   //payload
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        },//{algorithm by_default}     
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {   //less information then access token
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)