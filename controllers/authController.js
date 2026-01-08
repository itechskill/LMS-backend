import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

// ==================== REGISTER CONTROLLER ====================
export const register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, confirmPassword, role } = req.body;

    console.log('📥 Registration Request:', { fullName, email, phone, role });

    // ✅ Validate required fields
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      console.log('❌ Missing fields');
      return res.status(400).json({ 
        success: false,
        message: "All fields are required" 
      });
    }

    // ✅ Check if passwords match
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      return res.status(400).json({ 
        success: false,
        message: "Passwords do not match" 
      });
    }

    // ✅ Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({ 
        success: false,
        message: "Email already exists" 
      });
    }

    // ✅ Check if phone already exists (optional but recommended)
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      console.log('❌ Phone already exists:', phone);
      return res.status(400).json({ 
        success: false,
        message: "Phone number already exists" 
      });
    }

    // ✅ Create new user
    const user = new User({ 
      fullName, 
      email, 
      phone, 
      password, 
      role: role || 'Student' // Default to Student if not provided
    });

    // Save user (password will be hashed automatically by pre-save hook)
    await user.save();

    console.log('✅ User created successfully:', user._id);

    // ✅ Generate JWT token
    const token = generateToken(user._id, user.role);

    // ✅ Send success response
    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token: token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("❌ Register error:", error);
    
    // Handle validation errors from Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false,
        message: messages.join(', ') 
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ 
        success: false,
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      });
    }

    // General error
    return res.status(500).json({ 
      success: false,
      message: "Registration failed. Please try again." 
    });
  }
};

// ==================== LOGIN CONTROLLER ====================
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log('📥 Login Request:', { email });

    // ✅ Validate required fields
    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ 
        success: false,
        message: "Email and password are required" 
      });
    }

    // ✅ Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    // ✅ Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ 
        success: false,
        message: "Invalid email or password" 
      });
    }

    console.log('✅ Login successful:', user._id);

    // ✅ Generate JWT token
    const token = generateToken(user._id, user.role);

    // ✅ Send success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("❌ Login error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Login failed. Please try again." 
    });
  }
};