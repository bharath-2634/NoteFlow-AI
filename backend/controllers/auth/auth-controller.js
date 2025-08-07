const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_OAUTH);

const registerUser = async (req, res) => {
    try {
        const { userName, email, password, authType = "email",} = req.body;
        console.log("controller");
        console.log("Received Data", req.body);

        let userExists = await User.findOne({ email });
        console.log("After Check",userExists)
        
        if (userExists)
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        console.log("After Check",userExists)
        // Hash the password only if authType is email
        let hashPassword = null;
        if (authType === "email") {
            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: "Password is required for email authentication."
                });
            }
            hashPassword = await bcrypt.hash(password, 12);
        }

        console.log("after pass",req.body);
        // Generate MCID if not provided
        // const generatedMCID = MCID || `MC-${Math.floor(100000 + Math.random() * 900000)}`;

        // Create new user
        const newUser = new User({
            userName,
            email,
            password: hashPassword,
            authType,
        });

        console.log("newUser", newUser);

        await newUser.save();
        console.log("after Save");

        // Generate JWT Token
        const token = jwt.sign(
            {
                userName: newUser.userName,
                userId: newUser._id,
                email: newUser.email,
            },
            "CLIENT_SECRET_KEY",
            { expiresIn: "7d" }
        );

        // res.cookie("token", token, { httpOnly: true, secure: false });

        res.status(200).json({
            success: true,
            message: "User registered successfully",
            token,
            isAuthenticated : true,
            user: {
                id: newUser._id,
                userName: newUser.userName,
                email: newUser.email,
            },
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error
        });
    }
};


// Login User
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("login",req.body);

        let checkUser = await User.findOne({ email });
        console.log(checkUser);
        if (!checkUser)
            return res.json({
                success: false,
                message: "You don't have an account in MC"
            });
        
        // Check Password
        const checkPasswordMatch = await bcrypt.compare(password, checkUser.password);
        
        if (!checkPasswordMatch) {
            return res.json({
                success: false,
                message: "Incorrect password.",
            });
        }

        
        // Generate JWT Token
        const token = jwt.sign(
            {
                userId: checkUser._id,
                email: checkUser.email,
                userName : checkUser.userName
            },
            "CLIENT_SECRET_KEY",
            { expiresIn: "7d" }
        );

        res.json({
            success: true,
            message: "Logged in successfully",
            token,
            user: {
                email: checkUser.email,
                id: checkUser._id,
                userName: checkUser.userName,
            },
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server Error",
            error
        });
    }
};

const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        console.log("token",token);
        
        if (!token) {
            return res.status(400).json({ success: false, message: "Token is required" });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "408743586423-4v9jfflhiofo8pk7j9gnfrmqn5onaase.apps.googleusercontent.com",
        });

        console.log("ticket",ticket);

        const payload = ticket.getPayload();
 
        let user = await User.findOne({ email: payload.email });

        if (!user) {
           
           user = new User({
                userName: payload.family_name,
                email : payload.email,
                authType: "google",
            });
            await user.save();
        }

        console.log("user",user);

        const jwtToken = jwt.sign(
          {
              userName: payload.family_name || "",
              userId: user._id,
              email: user.email,
          },
          "CLIENT_SECRET_KEY",
          { expiresIn: "7d" }
      );

      res.cookie("token", jwtToken, { httpOnly: true, secure: false }).json({
        success: true,
        message: "Google login successful",
        token: jwtToken,
        isAuthenticated: true,
        user: {
            id: user._id,
            userName: user.userName,
            email: user.email,
        },
    });
    
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const logoutUser = (req, res) => {
    res.clearCookie("token").json({
      success: true,
      message: "Logged out successfully!",
    });
};

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token)
      return res.status(401).json({
        success: false,
        message: "Unauthorised user!",
      });
  
    try {
      const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Unauthorised user!",
      });
    }
};

const getUser = async (req, res) => {
  try {
    const { id: userId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorised user!",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("user_backend",user);
    return res.json({
      success: true,
      user,
      message: "Found User!",
    });
    
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Server Error!",
    });
  }
};

const updateUser = async (req,res) => {
    try {
        // const {id}  = req.params;
        const {user} = req.body;
        console.log("user from backend",user);
        if(!user) {
            return res.status(401).json({
                success: false,
                message: "User instance required",
            });
        }
        const userId = user._id;

        if(!userId) {
            console.log("No UserId found");
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {$set : user},
            {new : true}
        );

        console.log("updated user",updatedUser);

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user: updatedUser
        });

    }catch(error) {
        console.error(error.message);
        res.status(500).json({
        success: false,
        message: "Server Error!",
        });
    }
}

  
module.exports = { registerUser, loginUser, googleAuth , logoutUser , authMiddleware, getUser, updateUser};
