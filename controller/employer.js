const bcrypt = require("bcrypt");
const Employer = require("../model/employer");
const Token = require("../model/Token");
const Razorpay = require("razorpay");
const Category = require("../model/Category");
const Job = require("../model/Job");
const Applicant = require("../model/application");
const mailService = require("../services/mail");
const mongoose=require("mongoose")

const signup = async (req, res) => {
  const { email, name, phone, password } = req.body;

  try {
    // Check if an employer already exists with the provided email
    const existingEmployer = await Employer.findOne({ email });

    if (existingEmployer) {
      return res.status(400).json({ message: "Employer already exists" });
    }

    // Hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password with the salt

    // Create a new employer with the hashed password
    const newEmployer = new Employer({
      name,
      email,
      phone,
      password: hashedPassword, // Store the hashed password
    });

    // Save the new employer
    await newEmployer.save();

    return res.status(201).json({ message: "Employer created successfully" });
  } catch (error) {
    console.error("Error during signup:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const Login = async (req, res) => {
  const { email, password } = req.body;

  // console.log(req.body);
  try {
    // Check if an employer exists with the provided email
    const employer = await Employer.findOne({ email });

    if (!employer) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare the provided password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, employer.password);
    // console.log(isMatch);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // console.log("hello");

    return res.status(200).json({ message: "Login successful", employer });
    // console.log(employer);
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const fetchTokenPrice = async (req, res) => {
  const token = await Token.find();
  // console.log(token)

  if (!token) {
    return res.status(400).json({ message: "didint get" });
  }

  const data = token.map((token) => ({
    id: token._id,
    tokenCount: token.tokenCount,
    price: token.tokenPrice,
  }));

  // console.log(data);

  return res.status(200).json({ message: "success", data });
};

const Payment = async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const { amount } = req.body;
    // console.log("req.body", amount);

    const options = {
      amount: amount, // Amount in paise (multiply INR by 100)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`, // Unique receipt ID
    };

    const order = await instance.orders.create(options);

    if (!order) return res.status(500).send("Some error occurred");

    res.json(order); // Send the order details (including order_id) to the frontend
  } catch (error) {
    res.status(500).send(error);
  }
};

const verifyPayment = async (req, res) => {
  try {
    // Extract employer ID, payment ID, and token count from the request body
    const { employer, paymentId, token, amount } = req.body;
    // console.log("amountsss", amount);
    // Find the employer by the ID
    const existingEmployer = await Employer.findById(employer);

    // If employer is not found, return an error response
    if (!existingEmployer) {
      return res.status(400).json({ message: "Invalid employer" });
    }

    // Ensure the tokenCount and token are numbers before adding them
    const currentTokenCount = Number(existingEmployer.tokenCount) || 0; // Convert tokenCount to a number (defaults to 0 if null/undefined)
    const newToken = Number(token); // Convert token from request to a number

    // Update the employer's paymentId and tokenCount fields
    existingEmployer.payments.push({
      paymentId: paymentId,
      amount: amount / 100,
    });
    existingEmployer.tokenCount = currentTokenCount + newToken; // Perform numeric addition

    // Save the updated employer document
    await existingEmployer.save();

    // Return success response
    return res.status(200).json({
      message: "Payment verified and updated successfully",
      employer: existingEmployer,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({ message: "Error verifying payment", error });
  }
};

const tokenCount = async (req, res) => {
  const { id } = req.params;

  const employer = await Employer.findById(id);

  const tokenCount = employer.tokenCount;

  res.status(200).json({ message: "success get token", tokenCount });

  //

  // console.log(employer);
};

const categoryFetch = async (req, res) => {
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

// Route to post job data

// Controller function to handle job posting
const postJobData = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the employer by ID
    const employer = await Employer.findById(id);
    if (!employer) {
      return res.status(400).json({ message: "Invalid employer ID." });
    }

    // Create a new job instance with data from the request body
    const newJob = new Job({
      employerId: id,
      jobTitle: req.body.jobTitle,
      jobDescription: req.body.jobDescription,
      jobskill: req.body.profesionalskill,
      jobResponsibilities: req.body.keyResponsibilties,
      applicationDeadline: req.body.applicationDeadline,
      qualification: req.body.qualification,
      experience: req.body.experience,
      salaryRange: req.body.salaryRange,
      jobLocation: req.body.jobLocation,
      jobType: req.body.jobType,
      jobCategory: req.body.jobCategory,
      companyName: req.body.companyName,
      companyWebsite: req.body.companyWebsite,
    });

    if (employer.tokenCount > 0) {
      employer.tokenCount--; // Decrement the token count
      await employer.save();

      await newJob.save();
    } else {
      return res.status(400).json({ message: "No tokens left to decrement" });
    }


    return res
      .status(201)
      .json({ message: "Job posted successfully!", job: newJob });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while posting the job.", error });
  }
};


const fetchJob = async (req, res) => {
  // const { id } = req.params;

  // try {
  //   // Step 1: Check if the employer exists
  //   const employer = await Employer.findById(id);
  //   // console.log(employer)
  //   if (!employer) {
  //     return res.status(404).json({ message: 'Invalid employer ID' });
  //   }

  //   // Step 2: Fetch jobs associated with the employer
  //   const jobs = await Job.aggregate([
  //     {
  //       $match: { employerId: id }, // Match jobs where employerId is the given id
  //     },
  //     {
  //       $lookup: {
  //         from: 'employer', // The collection name for employers
  //         localField: 'employerId', // The field in Job that references the Employer
  //         foreignField: '_id', // The field in Employer that matches the employerId in Job
  //         as: 'employerDetails',
  //          // The field name where employer data will be stored
           
  //       },
  //     },
  //     {
  //       $unwind: '$employerDetails', // Unwind to flatten the array of employerDetails
  //     },
  //     {
  //       $project: {
  //         jobTitle: 1,
  //         jobDescription: 1,
  //         applicationDeadline: 1,
  //         qualification: 1,
  //         experience: 1,
  //         salaryRange: 1,
  //         jobLocation: 1,
  //         jobType: 1,
  //         jobCategory: 1,
  //         companyName: '$employerDetails.companyName', // Include employer's company name
  //         companyWebsite: '$employerDetails.companyWebsite', // Include employer's website
  //         createdAt: 1,
  //         updatedAt: 1,
  //       },
  //     },
  //   ]);
  //   console.log("jobs",jobs);

  //   if (!jobs.length) {
  //     return res.status(404).json({ message: 'No jobs found for this employer' });
  //   }

    
  //   return res.status(200).json(jobs);
  // } catch (error) {
  //   console.error(error);
  //   return res.status(500).json({ message: 'Server error', error });
  // }




  const { id } = req.params; 
  // Get the employer ID from request parameters
  

  try {
    // Step 1: Validate the employer ID
    const employer = await Employer.findById(id);
    // console.log(employer)
    if (!employer) {
      return res.status(404).json({ message: 'Invalid employer ID' });
    }

    // Step 2: Fetch jobs associated with the employer
    const jobs = await Job.find({ employerId: employer._id }); // Find jobs with the matching employerId
    // console.log(jobs)
    if (jobs.length === 0) {
      return res.status(404).json({ message: 'No jobs found for this employer' });
    }

    return res.status(200).json(jobs); // Return the found jobs
  } catch (error) {
    console.error('Error fetching jobs:', error); // Log error for debugging
    return res.status(500).json({ message: 'Server error', error });
  }
};

const editJob = async (req, res) => {
  try {
      const { id, jobTitle, jobDescription, applicationDeadline, qualification, experience, salaryRange, jobLocation, jobType, jobCategory, companyName, companyWebsite,profesionalskill,keyResponsibilties } = req.body;

      // Check if job exists by ID
      const jobExists = await Job.findById(id);
      
      if (!jobExists) {
          return res.status(404).json({ message: 'Invalid ID: Job not found' });
      }

      // Update the job if it exists
      const updatedJob = await Job.findByIdAndUpdate(
          id,
          {
              jobTitle,
              jobDescription,
              applicationDeadline,
              qualification,
              experience,
              salaryRange,
              jobLocation,
              jobType,
              jobCategory,
              companyName,
              keyResponsibilties,
              profesionalskill,
              companyWebsite,
              updatedAt: new Date() // Update the timestamp
          },
          { new: true } // Return the updated document
      );

      console.log(updatedJob)

      res.status(200).json({ message: 'Job updated successfully', job: updatedJob });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating job', error });
  }
};

const postdelete = async (req, res) => {
  try {
      const { id } = req.params; // Extract ID from the request parameters

      console.log(id); // Log the ID for debugging

      // Find and delete the job by ID
      const deletedJob = await Job.findByIdAndDelete(id);

      // If the job doesn't exist, return a 404 error
      if (!deletedJob) {
          return res.status(404).json({ message: 'Job not found' });
      }

      // If successful, return a success message
      res.status(200).json({ message: 'Job deleted successfully', job: deletedJob });
  } catch (error) {
      // Handle any errors
      console.error('Error deleting job:', error);
      res.status(500).json({ message: 'Error deleting job', error });
  }
};

const getApplicants = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id);

    const excict = await Applicant.find({ EmployerId: id });

    if (!excict.length) {
      // If no applicants found, return a success response with an empty result
      return res.status(200).json({ message: "success", result: [] });
    }

    const jobid = excict.map((a) => a.JobId);
    const jobs = await Job.find({ _id: { $in: jobid } }, 'jobTitle companyName');

    const result = excict.map((applicant) => {
      const jobDetails = jobs.find((job) => job._id.toString() === applicant.JobId.toString());

      return {
        ...applicant.toObject(),
        jobDetails: jobDetails ? jobDetails.toObject() : null,
      };
    });

    // console.log(result);
    return res.status(200).json({ message: "success", result });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    return res.status(500).json({ message: "An error occurred while fetching applicants" });
  }
};


const statusJob = async (req, res) => {
  const { id } = req.params;
  console.log("Employer status ID:", id);

  try {
    // Find the application by ID
    const application = await Applicant.findOne({ _id: id });
    if (!application) {
      return res.status(400).json({ message: "Cannot find the application" });
    }

    const { JobId, email } = application;

    if (!mongoose.Types.ObjectId.isValid(JobId)) {
      return res.status(400).json({ message: "Invalid JobId in application" });
    }

    // Retrieve job details
    const jobDetails = await Job.findOne({ _id: JobId });
    if (!jobDetails) {
      return res.status(404).json({ message: "Job details not found" });
    }

    const { jobTitle, jobDescription, companyName } = jobDetails;

    // Update application status to "viewed"
    const updatedApplication = await Applicant.findByIdAndUpdate(
      { _id: id },
      { $set: { status: "viewed" } },
      { new: true } // Return updated document
    );

    if (!updatedApplication) {
      return res.status(400).json({ message: "Failed to update application status" });
    }

    console.log("Updated application:", updatedApplication);

    // Email content
    const subject = "Application Status Update";
    const body = `
      Dear Applicant,

      Your application for the position of "${jobTitle}" at ${companyName} has been viewed.
      
      Job Description: 
      ${jobDescription}

      Thank you for applying, and we will keep you updated on further steps.

      Best regards,
      Job Seekers Team
    `;

    // Send notification email
    await mailService(body, email, subject);

    // Send success response
    return res.status(200).json({
      message: "Application status updated to 'viewed' and email sent successfully.",
    });
  } catch (error) {
    console.error("Error in statusJob:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const notSelect=async(req,res)=>{
    
  const {id}= req.params
  console.log("employerstatus",id)

  const application=await Applicant.findOne({_id:id})
  if(!application){
     res.status(400).json({message:"cannot find the apllication"})
  }

   const {JobId,email}=application
   console.log(JobId,"id")


if (!mongoose.Types.ObjectId.isValid(JobId)) {
      return res.status(400).json({ message: "Invalid JobId in application" });
    }

    // Find the job details
    const jobDetails = await Job.findOne({ _id: JobId }); // Corrected query
    if (!jobDetails) {
      return res.status(404).json({ message: "Job details not found" });
    }

    const { 
      jobTitle, 
      jobDescription, companyName } = jobDetails;
    const updated=await Applicant.findByIdAndUpdate({_id:id},{$set:{status:"reject"}})

   
    const subject = "Application Status Update";
    const body = `
    Dear Applicant,

    Thank you for applying for the position of "${
      jobTitle}" at ${companyName}.
    Unfortunately, we cannot move forward with your application at this time.

    Job Description: 
    ${
      jobDescription}

    Best regards,
    Job Seekers Team
  `;         await    mailService(body,email,subject)

      

  // console.log("updated",updated)

       
}




module.exports = {
  signup,
  Login,
  fetchTokenPrice,
  Payment,
  verifyPayment,
  tokenCount,
  categoryFetch,
  postJobData,
  fetchJob,
  editJob,
  postdelete ,
  getApplicants,
  statusJob,
  notSelect
};
