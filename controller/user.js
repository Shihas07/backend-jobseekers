const User = require("../model/user");
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const springedge = require("springedge");
// const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
// const Admin=require("../model/admin")
const Applicant=require("../model/application")

const cookieParser = require("cookie-parser");
const Job = require("../model/Job");
const Category = require("../model/Category");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
app.use(bodyParser.json());

app.use(cookieParser());

const signup = async (req, res) => {
  const { email, name, password, phone } = req.body;

  try {
    const ExcictData = await User.findOne({ email });

    if (ExcictData) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassord = await bcrypt.hash(password, 10);
    console.log(hashPassord);

    const user = new User({ name, email, password: hashPassord, phone });
    await user.save();

    return res.status(200).json({ message: "Signup successful" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isBlocked === true) {
      return res.status(400).json({ message: "user is blocked contact admin" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate tokens using environment variables
    const accessToken = jwt.sign(
      { id: user.id },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1m", // Corrected from 15ms to 15 minutes
      }
    );
    const refreshToken = jwt.sign(
      { id: user.id, name: user.name },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "1d", 
      }
    );

    // Set cookies
    res.cookie("accessToken", accessToken, {
      maxAge: 1 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const otpLogin = async (req, res) => {
  const { phone } = req.body;
  // console.log(phone);

  const Excict = await User.findOne({ phone });
  console.log("otp", Excict);
  if (!Excict) {
    return res.status(400).json({ message: "invalid Phnone No" });
  }

  // Function to generate OTP
  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000);
  };

  // Ensure phone number is correctly formatted with country code
  const formattedPhone = `+91${phone}`;
  const otp = generateOtp();
  console.log("generatted ot is :", otp);

  const message = `Hello ${otp}, This is a test message from spring edge `;
  const params = {
    sender: "SEDEMO",
    apikey: "621492a44a89m36c2209zs4l7e74672cj",
    to: [formattedPhone],
    message: message,
    format: "json",
  };

  // localStorage.setItem("otp",otp)
  res.cookie("otp", otp, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 5 * 60 * 1000,
  });

  // console.log(data)
  //

  springedge.messages.send(params, 5000, function (err, response) {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Failed to send message" });
    }
    // console.log("shihas", response);
    return res.status(200).json({ success: true, message: "Message sent" });
  });
};

const verifyOtp = (req, res) => {
  const { otp } = req.body;
  console.log("body", otp);
  const cookieOtp = req.cookies.otp;

  console.log("d", cookieOtp);
  if (cookieOtp === otp) {
    res.status(200).json({ success: true, message: "OTP verified" });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
};

const home = (req, res) => {
  // Respond with a success message or some data
  res
    .status(200)
    .json({ message: "Welcome to the home page!", user: req.user });
  // console.log("shihas");
};

const refresh = (req, res) => {
  // // 1. Retrieve the refresh token from the cookies
  // const refreshToken = req.cookies.refreshToken;
  // console.log("refrsh",refreshToken)

  // if (!refreshToken) {
  //   return res.status(401).json({ message: "No refresh token provided." });
  // }

  // try {
  //   // 2. Verify the refresh token using your secret
  //   const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  //   // 3. Extract the user ID or other info from the decoded refresh token
  //   const userId = decoded.id;

  //   // 4. Generate a new access token using the user ID
  //   const newAccessToken = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
  //     expiresIn: "15m", // Adjust expiration as needed
  //   });

  //   // 5. Set the new access token in the cookies
  //   res.cookie("accessToken", newAccessToken, {
  //     httpOnly: true, // Ensures the cookie is only accessible by the server
  //     maxAge: 1 * 60 * 1000, // 15 minutes
  //   });

  //   // 6. Send a success response with the new access token
  //   return res.status(200).json({ message: "Access token refreshed", accessToken: newAccessToken });
  // } catch (error) {
  //   // If the refresh token is invalid or expired
  //   return res.status(403).json({ message: "Invalid or expired refresh token. Please log in again." });
  // }

  // console.log("shihas", req.user);
  res.json({
    message: "You have access to this route.",
    user: req.user,
    accessToken: req.accessToken,
  });
};

const getJob = async (req, res) => {
  try {
    // Fetch all jobs from the database
    const jobs = await Job.find();

    // If no jobs found, you can send a 404 response
    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ message: "No jobs found" });
    }

    // Send the jobs data as the response
    res.status(200).json(jobs);
  } catch (error) {
    // Handle any errors that occurred during the fetch
    console.error("Error fetching jobs:", error);

    // Send an error response to the client
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

const fetchCategory = async (req, res) => {
  try {
    const category = await Category.find();

    if (!category || category.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }

    res
      .status(200)
      .json({ message: "Categories fetched successfully", category });
  } catch (error) {
    console.error("Error fetching categories:", error);

    res
      .status(500)
      .json({ message: "Error fetching categories", error: error.message });
  }
};

const jobTitleFilter = async (req, res) => {
  const title = req.query.title;
  // console.log("Job Title received from query:", title);

  if (!title) {
    return res.status(400).json({ message: "Job title is required" });
  }

  try {
    const filteredJobs = await Job.find({
      jobTitle: { $regex: title, $options: "i" },
    });

    if (filteredJobs.length === 0) {
      return res
        .status(404)
        .json({ message: "No jobs found matching the title" });
    }

    res.status(200).json(filteredJobs); // Send the filtered jobs back to the client
  } catch (error) {
    console.error("Error filtering jobs by title:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const location = async (req, res) => {
  const location = req.query.location; // Get the location from query parameters

  if (!location) {
    return res.status(400).json({ message: "Location is required" });
  }

  try {
    const filteredJobs = await Job.find({
      jobLocation: { $regex: location, $options: "i" }, // Case-insensitive regex search
    });

    if (filteredJobs.length === 0) {
      return res
        .status(404)
        .json({ message: "No jobs found for the specified location" });
    }

    res.status(200).json(filteredJobs);
  } catch (error) {
    console.error("Error filtering jobs by location:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const singleJob = async (req, res) => {
  const { id } = req.params; // Extract id from request parameters

  try {
    // Find job by ID
    const jobDetails = await Job.findById(id);

    // Check if job was found
    if (!jobDetails) {
      return res.status(404).json({ message: "INVALID JOB ID" }); // Use 404 status for not found
    }

    // Respond with the job details
    res.status(200).json(jobDetails); // Return the job details if found
  } catch (error) {
    // Handle errors
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: "Server Error" }); // Return a server error
  }
};

const profileDetails = async (req, res) => {
  const { email } = req.params; // Extract email from route params
  // console.log("email", email);

  try {
    const user = await User.findOne({ email }); // Find user by email

    if (!user) {
      // If no user is found, return a 400 status with an error message
      return res.status(400).json({ message: "Invalid user" });
    }

    // If the user is found, return the user data
    res.status(200).json(user);

    // Log the user details for debugging
    // console.log("user", user);
  } catch (error) {
    // Catch and handle any errors that occur during the database query
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const addprofileDetails = async (req, res) => {
  try {
    const { name, email, phone, password, skills, experience, description,location } = req.body;
    const Resume = req.file;

    if (!Resume) {
      return res.status(400).json({ message: "Resume file is required" });
    }

    // Check if a user with the given email already exists
    let existingUser = await User.findOne({ email });

    if (existingUser) {
      // Update the existing user's details
      existingUser.name = name;
      existingUser.phone = phone;
      existingUser.password = password;
      existingUser.resumePath = Resume.path; // Update the resume file path
      existingUser.skills = skills ? skills.split(",") : [];
      existingUser.experience = experience;
      existingUser.location = location;
      

      const updatedUser = await existingUser.save();

      return res.status(200).json({
        message: "User profile updated successfully",
        user: updatedUser,
      });
    } else {
      // Create a new user document if no existing user is found
      const newUser = new User({
        name,
        email,
        phone,
        password,
        resumePath: Resume.path, // Save the file path of the resume
        skills: skills ? skills.split(",") : [],
        experience,
        description,
      });

      const savedUser = await newUser.save();

      return res.status(201).json({
        message: "User profile added successfully",
        user: savedUser,
      });
    }
  } catch (error) {
    console.error("Error adding/updating user profile:", error);
    res.status(500).json({ message: "Error adding/updating user profile" });
  }
};


const applyJob = async (req, res) => {
  try {
    const { _id, name, email, phone, experience, resumePath, skills, location, coverLetter } = req.body.profile;
    const {id} = req.params; // assuming jobId is passed as a URL parameter
    const Resume=req.file

       
      console.log("req.body",req.body)
      console.log("req.body",req.file)

           
       
    // Check if the job exists
    const job = await Job.findById(id);
    console.log("job",job)
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if the applicant already exists
    let applicant = await Applicant.findOne({ _id });
    if (!applicant) {
      // Create a new applicant if not exists
      applicant = new Applicant({
        userId:_id,
        EmployerId:job.employerId,
        JobId:id,
        name:name,
        email:email,
        phone:phone,
        experience:experience,
        resumePath:resumePath,
        skills:skills,
        location:location,
        coverLetter:coverLetter,
        applications: [{ id }],
      });
    } else {
      // Update the existing applicant with the new application
      applicant.applications.push({ id });
    }


     console.log(applicant)
    await applicant.save();

    res.status(200).json({ message: "Application submitted successfully", applicant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error submitting application" });
  }
};


const getAppliedJob = async (req, res) => {
  try {
    const { id } = req.params; // User ID from request params

    // Find all applications by the user and retrieve only the JobId field
    const applications = await Applicant.find({ userId: id }).select("JobId -_id");

    if (!applications.length) {
      return res.status(404).json({ message: "No applications found for this user." });
    }

    // Map to extract only JobIds
    const jobIds = applications.map((application) => application.JobId);
    // console.log("jobids",jobIds)

    // Send the job IDs to the frontend
    res.status(200).json({ jobIds });
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    res.status(500).json({ message: "An error occurred while fetching applied jobs." });
  }
};

// const FindAppliedJobStatus=async(req,res)=>{
     
//       const {id,jobid}=req.params;
       
//           const excictApplication= await Applicant.find({userId:id}&&{JobId:jobid})
//           console.log(excictApplication)

//             if(!(id&&jobid)){

//                 res.status(400),json({message:"cant find this id"})
//             }

//              res.status(200).json(excictApplication)
// }


const FindAppliedJobStatus = async (req, res) => {
  const { id, jobid } = req.params;

  // Check if id and jobid are provided
  if (!(id && jobid)) {
    return res.status(400).json({ message: "Both id and jobid are required" });
  }

  try {
    
    const existingApplication= await Applicant.find({userId:id}&&{JobId:jobid})
    console.log(existingApplication);

   
    if (existingApplication.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    
    res.status(200).json(existingApplication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = {
  signup,
  login,
  otpLogin,
  verifyOtp,
  home,
  refresh,
  getJob,
  fetchCategory,
  jobTitleFilter,
  location,
  singleJob,
  profileDetails,
  addprofileDetails,
  applyJob,
  getAppliedJob,
  FindAppliedJobStatus
  
};
