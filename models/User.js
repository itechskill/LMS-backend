import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: [true, "Full name is required"] },
  email: { type: String, required: [true, "Email is required"], unique: true, lowercase: true },
  phone:{ type:String, required: [true,"Phone number is required"],unique:true},
  password: { type: String, required: [true, "Password is required"], minlength: 3 },
  role: { type: String, enum: ["Admin","Student"], default: "Student" },
  address:{ type:String},
  status: { type: String, enum: ["Active", "Inactive", "Suspended"], default: "Active" },
  accessTill: { type: Date },
  avatar: { type: String }, // URL or path for avatar
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course", // Reference to Course model
    }
  ],
  country: {type:String},
  dob:{type: Date},
  gender:{type:String, enum:["Male","Female","Other"]},
  selectDate:{type:Date},
}, { timestamps: true });

// Virtual field for confirm password
userSchema.virtual("confirmPassword")
  .get(function () { return this._confirmPassword; })
  .set(function (value) { this._confirmPassword = value; });

// Validate password match
userSchema.pre("save", function (next) {
  if (this.isModified("password") && this.password !== this._confirmPassword) {
    this.invalidate("confirmPassword", "Passwords do not match");
  }
  next();
});

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Default export
export default mongoose.model("User", userSchema);
