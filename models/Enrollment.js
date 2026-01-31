// import mongoose from "mongoose";

// const enrollmentSchema = new mongoose.Schema(
//   {
//     student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
//     isPaid: { type: Boolean, default: false}, //new
//     enrolledAt: { type: Date, default: Date.now },
//     endDate: { type: Date }, 
//   },
//   {
//     timestamps: true, // automatically adds createdAt and updatedAt
//   }
// );

// export default mongoose.model("Enrollment", enrollmentSchema);



import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    student: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    course: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Course", 
      required: true 
    },
    
    // 🔹 PAYMENT STATUS
    isPaid: { 
      type: Boolean, 
      default: false 
    },
    
    // 🔹 PAYMENT DETAILS
    paymentDate: { 
      type: Date 
    },
    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking", "cash", "wallet", "free"],
      default: "free"
    },
    paymentId: {
      type: String,
      unique: true,
      sparse: true // Allows null values while maintaining uniqueness for non-null values
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true
    },
    amountPaid: {
      type: Number,
      min: 0,
      default: 0
    },
    currency: {
      type: String,
      default: "INR"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending"
    },
    
    // 🔹 ENROLLMENT STATUS
    enrollmentStatus: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending_payment"],
      default: "pending_payment"
    },
    enrolledAt: { 
      type: Date, 
      default: Date.now 
    },
    endDate: { 
      type: Date 
    },
    duration: {
      type: Number, // in days
      default: 365 // 1 year default
    },
    
    // 🔹 COURSE ACCESS
    isActive: {
      type: Boolean,
      default: true
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    
    // 🔹 PROGRESS TRACKING
    lastAccessed: {
      type: Date
    },
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    completedLectures: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture"
    }],
    
    // 🔹 REFUND DETAILS (if applicable)
    refundRequested: {
      type: Boolean,
      default: false
    },
    refundDate: {
      type: Date
    },
    refundAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    refundReason: {
      type: String
    }
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

// 🔹 COMPOUND INDEX to prevent duplicate enrollments
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// 🔹 INDEXES for faster queries
enrollmentSchema.index({ student: 1, isPaid: 1 });
enrollmentSchema.index({ course: 1, isPaid: 1 });
enrollmentSchema.index({ paymentStatus: 1 });
enrollmentSchema.index({ enrollmentStatus: 1 });
enrollmentSchema.index({ enrolledAt: -1 });

// 🔹 VIRTUAL FIELD: Check if enrollment is expired
enrollmentSchema.virtual('isExpired').get(function() {
  if (!this.endDate) return false;
  return new Date() > this.endDate;
});

// 🔹 VIRTUAL FIELD: Days remaining
enrollmentSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate) return null;
  const today = new Date();
  const end = new Date(this.endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// 🔹 VIRTUAL FIELD: Access status
enrollmentSchema.virtual('canAccess').get(function() {
  return this.isActive && 
         !this.isDeleted && 
         this.isPaid && 
         this.enrollmentStatus === "active" &&
         (!this.endDate || new Date() <= this.endDate);
});

// 🔹 PRE-SAVE MIDDLEWARE: Auto-calculate endDate based on duration
enrollmentSchema.pre('save', function(next) {
  if (this.isModified('duration') || (!this.endDate && this.duration)) {
    const startDate = this.enrolledAt || new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + this.duration);
    this.endDate = endDate;
  }
  
  // Auto-update enrollment status based on payment
  if (this.isModified('isPaid') && this.isPaid) {
    this.enrollmentStatus = "active";
    this.paymentStatus = "completed";
    this.paymentDate = new Date();
  }
  
  next();
});

// 🔹 STATIC METHOD: Get active enrollments for student
enrollmentSchema.statics.getActiveEnrollments = async function(studentId) {
  return this.find({
    student: studentId,
    isActive: true,
    isDeleted: false,
    enrollmentStatus: "active"
  }).populate("course", "title description price duration thumbnail");
};

// 🔹 STATIC METHOD: Get paid enrollments for admin
enrollmentSchema.statics.getPaidEnrollments = async function() {
  return this.find({ 
    isPaid: true,
    isDeleted: false 
  })
  .populate("student", "fullName email phone")
  .populate("course", "title price category");
};

// 🔹 INSTANCE METHOD: Mark as completed
enrollmentSchema.methods.markAsCompleted = function() {
  this.progressPercentage = 100;
  return this.save();
};

// 🔹 INSTANCE METHOD: Add completed lecture
enrollmentSchema.methods.addCompletedLecture = function(lectureId) {
  if (!this.completedLectures.includes(lectureId)) {
    this.completedLectures.push(lectureId);
    
    // Calculate new progress percentage
    // This assumes you have a way to get total lectures count
    // You might need to adjust this based on your Lecture model
    // this.progressPercentage = Math.round((this.completedLectures.length / totalLectures) * 100);
  }
  return this.save();
};

// 🔹 INSTANCE METHOD: Request refund
enrollmentSchema.methods.requestRefund = function(reason) {
  this.refundRequested = true;
  this.refundReason = reason;
  this.enrollmentStatus = "cancelled";
  this.isActive = false;
  return this.save();
};

// Ensure virtuals are included in JSON output
enrollmentSchema.set('toJSON', { virtuals: true });
enrollmentSchema.set('toObject', { virtuals: true });

export default mongoose.model("Enrollment", enrollmentSchema);