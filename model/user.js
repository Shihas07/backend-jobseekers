const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
  },
  password: {
    type: String,
    required: true,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  resumePath: {
    type: String, // Stores the file path of the uploaded resume
  },
  skills: {
    type: [String], // Array of skills (e.g., ["JavaScript", "React", "Node.js"])
  },
  experience: {
    type: String, // Experience in years or a summary of work experience
  },
  location: {
    type: String, // Experience in years or a summary of work experience
  },

});

const User = mongoose.model("User", UserSchema);

module.exports = User;
