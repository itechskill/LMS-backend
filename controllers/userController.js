import User from "../models/User.js";
import bcrypt from "bcryptjs";

// ================= CREATE USER =================
export const createUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      role,
      status,
      accessTill,
      avatar,
      courses = [],
      address,
      country,
      dob,
      gender,
      selectDate,
    } = req.body;

    // Validation
    if (!fullName || !email || !phone) {
      return res.status(400).json({ message: "Full name, email, phone are required" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const userPassword = password || "Student@123";
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // Create user
    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: role || "Student",
      address: address || "",
      status: status || "Active",
      accessTill,
      avatar,
      courses,
      country: country || "",
      dob,
      gender: gender || "Male",
      selectDate,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        address: user.address,
        status: user.status,
        accessTill: user.accessTill,
        avatar: user.avatar,
        courses: user.courses,
        country: user.country,
        dob: user.dob,
        gender: user.gender,
        selectDate: user.selectDate,
        createdAt: user.createdAt,
      },
      defaultPassword: !password ? "Student@123" : undefined,
    });
  } catch (error) {
    console.error("CreateUser Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET ALL USERS =================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("courses", "title") // Populate courses title
      .select("-password"); // Exclude password

    res.json(users);
  } catch (error) {
    console.error("GetAllUsers Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET USER BY ID =================
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("courses", "title")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("GetUserById Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE USER =================
export const updateUser = async (req, res) => {
  try {
    const {
      password,
      courses,
      phone,
      address,
      country,
      dob,
      gender,
      selectDate,
      ...otherData
    } = req.body;

    const updatedData = { ...otherData };

    // Update password if provided
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    // Update courses if provided (allow empty array)
    if (courses !== undefined) {
      updatedData.courses = courses;
    }

    // Update other optional fields
    if (phone !== undefined) updatedData.phone = phone;
    if (address !== undefined) updatedData.address = address;
    if (country !== undefined) updatedData.country = country;
    if (dob !== undefined) updatedData.dob = dob;
    if (gender !== undefined) updatedData.gender = gender;
    if (selectDate !== undefined) updatedData.selectDate = selectDate;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    )
      .select("-password")
      .populate("courses", "title");

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.json(updatedUser);
  } catch (error) {
    console.error("UpdateUser Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE USER =================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DeleteUser Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
