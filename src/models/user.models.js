import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
  username : {
    type : String,
    required : true,
    unique : true,
    lowercase : true,
    trim : true,
    index : true
  },
  email : {
    type : String,
    required : true,
    unique : true,
    lowercase : true,
    trim : true,
  },
  fullName : {
    type : String,
    required : true,
    trim : true,
    index : true
  },
  avatar : {
    type : String,
    required : true,
  },
  coverImage : {
    type : String,
  },
  watchHistory : [
    {
      type: Schema.Types.ObjectId,
      ref : "Video"
    }
  ],
  password : {
    type : String,
    required : [true, 'Password is required']
  },
  refreshToken : {
    type : String
  }
}, {timestamps : true})

// Middleware to hash the password before saving the user document if the password was modified
userSchema.pre("save", async function (next){
  if(!this.isModified("password")) return next();

  this.password = bcrypt.hash(this.password, 10)
  next()
})

// Method to check if the provided password matches the stored hashed password
userSchema.methods.isPasswordCorrect = async function (password){
  return await bcrypt.compare(password, this.password)
}

// Method to generate an access token for the user
userSchema.methods.generateAccessToken = function(){
  jwt.sign(
    {
      _id : this._id,
      email : this.email,
      usernam : this.username,
      fullName : this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn : process.env.ACCESS_TOKEN_EXPIRY,
    }
  )
}

// Method to generate a refresh token for the user
userSchema.methods.generateRefreshToken = function(){
  jwt.sign(
    {
      _id : this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn : process.env.REFRESH_TOKEN_EXPIRY,
    }
  )
}

export const User = mongoose.model("User", userSchema)