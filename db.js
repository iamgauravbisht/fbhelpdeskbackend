const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const URI = process.env.URI;

mongoose
  .connect(URI)
  .then(() => {
    console.log("connected to db");
  })
  .catch((err) => {
    console.log(err);
  });

// Create a Schema for Users
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    maxLength: 50,
    unique: true,
  },
});

const fbUserSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
    unique: true,
  },
  pageDetails: [
    {
      pageID: {
        type: String,
        required: true,
      },
      pageName: {
        type: String,
        required: true,
      },
    },
  ],
});

// Create a model from the schema
const User = mongoose.model("User", userSchema);
const FBUser = mongoose.model("FBUser", fbUserSchema);

module.exports = {
  User,
  FBUser,
};
