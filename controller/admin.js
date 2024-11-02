const Admin = require("../model/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const { json } = require("body-parser");
const Category = require("../model/Category");
const Employer = require("../model/employer");
const TokenModel = require('../model/Token');
const Token = require("../model/Token");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email, password);

    // Check if admin exists

    const existingData = await Admin.findOne({ email });
    console.log(existingData);
    if (!existingData) {
      return res.status(400).json({ message: "Credentials not found" });
    }

    console.log(existingData.password);
    const isPasswordValid = await bcrypt.compare(
      password,
      existingData.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: existingData._id }, // Payload (with admin ID)
      process.env.JWT_SECRET, // Secret key
      { expiresIn: "1h" } // Options (expiration time set to 1 hour)
    );

    res.cookie("token", token, {
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful", admin: existingData });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find();

    // Map through the users and exclude the password field
    const data = users.map((user) => ({
      _id: user._id, // Access the correct property names (_id, not _Id)
      name: user.name,
      email: user.email,
      phoneNo: user.phone,
      status: user.isBlocked,
    }));

    // console.log("users", data); // Optional: Log to check the user data without passwords

    // Send the data without password field in the response
    res.status(200).json({ message: "success", users: data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

const BlockUser = async (req, res) => {
  const { userId } = req.body.userId; // Extract userId directly

  console.log("Received userId:", userId);

  try {
    // Find the user by _id
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    console.log("User found:", user);

    // Toggle the block status
    user.isBlocked = !user.isBlocked;

    // Save the updated user
    await user.save();

    console.log("Updated user:", user);

    res.status(200).json({ message: "User status toggled successfully", user });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const addCategory = async (req, res) => {
  const { categoryName } = req.body;

  // Check if categoryName is provided
  if (!categoryName) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    // Check if the category already exists
    const existingCategory = await Category.findOne({ categoryName });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    // Create a new category
    const newCategory = new Category({
      categoryName,
    });

    // Save the new category to the database
    await newCategory.save();

    // Send a success response
    res
      .status(201)
      .json({ message: "Category added successfully", category: newCategory });
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({ message: "Server error", error });
  }
};

const getCategory = async (req, res) => {
  try {
    // Fetch all categories from the database
    const categories = await Category.find();

    // Log the fetched categories (optional, useful for debugging)
    // console.log("CATEGORY", categories);

    // Map over categories to create an array of formatted category objects
    const data = categories.map((category) => ({
      _id: category._id,
      categoryName: category.categoryName,
    }));

    // Send a success response with the categories data
    return res.status(200).json({
      message: "Categories fetched successfully",
      data: data,
    });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error fetching categories:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

const DeleteCategory = async (req, res) => {
  const id = req.body.id;
  console.log("dbbdbd", id);
  try {
    const excicit = await Category.findByIdAndDelete({ _id: id });
    if (!excicit) {
      res.status(200).json({ message: "invalide category" });
    }

    console.log(excicit);

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Failed to delete category" });
  }
};

const editCategory = async (req, res) => {
  try {
    const data = req.body;
    console.log(data);

    // Update the categoryName field directly
    const updatedCategory = await Category.findByIdAndUpdate(
      data.id,
      { categoryName: data.Name.categoryName },
      { new: true, runValidators: true } // Return the updated document and run validators
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res
      .status(200)
      .json({
        message: "Category updated successfully",
        category: updatedCategory,
      });
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({ message: "Error updating category", error });
  }
};

const getEmployer = async (req, res) => {
  try {
    // console.log("Fetching employers...");

    // Fetch all employers from the database
    const employers = await Employer.find();

    // Map over the employers to extract the relevant data
    const data = employers.map((employer) => ({
      _id: employer._id, // Access the correct property names (_id, not _Id)
      name: employer.name,
      email: employer.email,
      phoneNo: employer.phone, // If your schema uses `phone`, this should be correct
      status: employer.isBlocked, // Assuming `isBlocked` is a boolean field
    }));

    // Log the mapped data before returning the response
    //

    // Return the fetched data as JSON with a success message
    return res.status(200).json({
      message: "Successfully fetched employers",
      data,
    });
  } catch (error) {
    // Handle any errors that occur during the fetch
    console.error("Error fetching employers:", error);
    return res.status(500).json({
      message: "Failed to fetch employers",
      error: error.message,
    });
  }
};

const BlockEmployer = async (req, res) => {
  try {
    const  {id } = req.body.id;

    // Find the employer by ID
    const employer = await Employer.findById(id);
    console.log(employer)

    if (!employer) {
      return res.status(404).json({ message: "Employer not found" });
    }

    
    employer.isBlocked = !employer.isBlocked;

    // Save the updated employer
    await employer.save();

    // Return a success message
    return res.status(200).json({
      message: `Employer ${employer.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      data: employer,
    });
  } catch (error) {
    console.error("Error blocking/unblocking employer:", error);
    return res.status(500).json({
      message: "Failed to block/unblock employer",
      error: error.message,
    });
  }
};

; // Adjust the path as needed

const postToken = async (req, res) => {
  try {
    // Extract price and token from the request body
    const { price, Token } = req.body;
    
    // Log the request body for debugging
    console.log('Request Body:', req.body);
    
    // Validate if both values are provided
    if (!price || !Token) {
      return res.status(400).json({ message: 'Price and Token are required' });
    }

    // Create a new token instance
    const newToken = new TokenModel({
      tokenCount: Token, 
      tokenPrice: price, 
    });

    // Save the new token to the database
    await newToken.save();

    // Return success response with the created token data
    res.status(201).json({
      message: 'Token created successfully',
      token: newToken
    });
  } catch (error) {
    console.error('Error creating token:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const fetchToken=async(req,res)=>{
   
      const token=await Token.find()
      console.log(token)

      if(!token){
        return res.status(400).json({message:"didint get"})
      }


      const data = token.map(token => ({
        id: token._id,
        tokenCount: token.tokenCount,
        price: token.tokenPrice,
      }));
  
      console.log(data);

      return res.status(200).json({message:"success",data})
}

const deleteToken = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the token exists by its ID
    const existingToken = await Token.findById(id);
    // console.log(existingToken);

    if (!existingToken) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    // If token exists, delete it
    await Token.findByIdAndDelete(id);
   


    
    return res.status(200).json({ message: "Token deleted successfully" });
  } catch (error) {
    console.error("Error deleting token:", error);
    return res.status(500).json({ message: "Failed to delete token" });
  }
};


const paymentDetails = async (req, res) => {
  try {
    // Step 1: Find all employers with their payment details
    const employers = await Employer.aggregate([
      {
        $unwind: "$payments" // Unwind payments array to get each payment separately
      },
      {
        $project: {
          _id: 1, // Employer ID
          name: 1, // Employer name
          email: 1, // Employer email (if needed)
          phone: 1, // Employer phone (if needed)
          isBlocked: 1, // Include isBlocked status
          paymentId: "$payments.paymentId", // Extract paymentId from payments
          amount: "$payments.amount", // Extract amount from payments
          date: "$payments.date" // Extract date from payments
        }
      }
    ]);

    // Step 2: Store payment details in a variable
    const paymentDetailsWithEmployers = employers.map(employer => ({
      employerId: employer._id,
      employerName: employer.name,
      paymentId: employer.paymentId,
      amount: employer.amount,
      date: employer.date,
      isBlocked: employer.isBlocked
    }));

    // console.log(paymentDetailsWithEmployers)

    // Step 3: Send the payment details as a response
    return res.status(200).json({
      success: true,
      paymentDetails: paymentDetailsWithEmployers
    });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};








module.exports = {
  login,
  getUsers,
  BlockUser,
  addCategory,
  getCategory,
  DeleteCategory,
  editCategory,
  getEmployer,
  BlockEmployer,
  postToken,
  fetchToken,
  deleteToken,
  paymentDetails

};
