const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Employer', // Reference to the Employer model
  },
  jobTitle: {
    type: String,
    required: true,
  },
  jobDescription: {
    type: String,
    required: true,
  },
  jobskill: {
    type: String,
    required: true,
  },
  jobResponsibilities: {
    type: String,
    required: true,
  },
  applicationDeadline: {
    type: Date,
    required: true,
  },
  qualification: {
    type: String,
    required: true,
  },
  experience: {
    type: String,
    required: true,
  },
  salaryRange: {
    type: String,
    required: true,
  },
  jobLocation: {
    type: String,
    required: true,
  },
  jobType: {
    type: String,
    enum: ['Full Time', 'Part Time', 'Contract', 'Internship'], // You can specify the types allowed
    required: true,
  },
  jobCategory: {
    type: String,
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  companyWebsite: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Automatically add createdAt and updatedAt timestamps
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
