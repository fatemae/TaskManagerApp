const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Task = require("../models/task");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true,
    validate(val) {
      if (!validator.isEmail(val)) {
        throw new Error("Invalid Email");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minLength: 7,
    trim: true,
    validate(val) {
      if (val.toLowerCase().includes("password")) {
        throw new Error("password cannot contain the string password");
      }
    },
  },
  age: {
    type: Number,
    default: 0,
    validate(val) {
      if (val < 0) {
        throw new Error("Age must be positive number.");
      }
    },
  },
  tokens: [{
    token: {
        type: String,
        required: true
    }
  }] ,
  avatar: {
    type: Buffer
  }
}, {
    // This statement automatically creates createdAt and updatedAt field in mongodb
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: "tasks",
    localField: "_id",
    foreignField: "owner"
})

//res.send calls JSON.stringify in the backend which calls the toJSON method defined on the object
userSchema.methods.toJSON = function(){
    const user = this;
    const userObj = user.toObject();

    delete userObj.password;
    delete userObj.tokens;
    delete userObj.avatar;

    return userObj;
}

//creates a new method on the object
userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id: user._id.toString()}, process.env.JSON_WEB_TOKEN);
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

//create new function in USer schema
userSchema.statics.findByCredentials = async(email, password) => {
   const user = await User.findOne({email});
   if(!user){
    throw new Error("Unable to login!");
   }
   const isMatch = await bcrypt.compare(password, user.password);
   if(!isMatch){
    throw new Error("Unable to login!");
   }

   return user;
}

//dont use arrow function as scope of this gets changed
//Hash the plain text password before saving
userSchema.pre("save", async function(next) {
  const user = this;
  if(user.isModified('password')){
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

//Delete the tasks when the user is removed

userSchema.pre("deleteOne", {document: true, query:false}, async function(next){
    const user = this;
    // console.log("POST remove");
    try{
        console.log(user._id)
        const t = await Task.deleteMany({owner: user._id});
        console.log(t);
    }catch(e){

    }
    next();
})

const User = mongoose.model("User", userSchema);

module.exports = User;
