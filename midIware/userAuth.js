const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require("../model/user");

const authUser = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  // console.log("Refresh token received:", refreshToken);

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided." });
  }

  try {
    // Verify the refresh token using your secret
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    // console.log("Decoded refresh token:", decoded);

    // Extract user ID from the decoded token
    const userId = decoded.id;

    // Find the user in the database
    const user = await User.findById(userId);
    // console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate a new access token
    const newAccessToken = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m', // Set expiration for the new access token
    });

    // Set the new access token in the cookies
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true, // Ensures the cookie is only accessible by the server
      maxAge: 1* 60 * 1000, // 15 minutes
      secure: process.env.NODE_ENV === 'production', // Set to true in production for HTTPS
      sameSite: 'strict', // Helps prevent CSRF attacks
    });

    // Attach user information to the request object
    req.user = user;
    req.accessToken = newAccessToken;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error verifying refresh token:", error);
    return res.status(403).json({ message: "Invalid or expired refresh token. Please log in again." });
  }
};

module.exports = authUser;
