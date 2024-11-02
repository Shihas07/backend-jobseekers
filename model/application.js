const mongoose = require("mongoose");

// Define Applicant Schema
const ApplicantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to the User model
  },
  EmployerId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Employer", 
  },
  JobId:{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Job", 
  },

  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  experience: { type: String },
  resumePath: { type: String },
  skills: { type: [String] },
  location: { type: String },
  coverLetter: { type: String },
  status: {
    type: String,
    enum: ["Pending", "Reviewed", "Interview", "Offered", "Rejected", "Accepted", "Withdrawn"],
    default: "Pending", 
  },
  date: {
    type: Date,
    default: Date.now, 
  },
  applications: [
    {
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
      appliedAt: { type: Date, default: Date.now },
    },
  ],
});

const Applicant = mongoose.model("Applicant", ApplicantSchema);

module.exports = Applicant;
