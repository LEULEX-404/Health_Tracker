import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },

    // Authentication
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      index: true,
    },

    // Role Based Access Control
    role: {
      type: String,
      enum: ["admin", "doctor", "patient", "caregiver"],
      default: "patient",
      index: true,
    },

    // Profile
    profileImage: {
      type: String,
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    address: String,

    // Security
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,

    // Session Tracking
    lastLoginAt: Date,
    lastLoginIP: String,

    // Soft Delete
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

//Password Hash Middleware
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
});

// Password Compare Method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
};

export default mongoose.model("User", userSchema);
