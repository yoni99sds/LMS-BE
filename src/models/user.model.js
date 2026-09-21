import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    // =========================
    // BASIC INFO
    // =========================
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },

    // =========================
    // AUTH
    // =========================
    password: {
      type: String,
      required: function () {
        return !this.googleId && !this.microsoftId;
      },
      select: false
    },

    role: {
      type: String,
      enum: ['Admin', 'Instructor', 'Student'],
      default: 'Student'
    },

    status: {
      type: String,
      enum: ['Active', 'Suspended', 'Pending'],
      default: 'Active'
    },

    // =========================
    // OAUTH PROVIDERS
    // =========================
    googleId: {
      type: String,
      sparse: true,
      index: true
    },

    microsoftId: {
      type: String,
      sparse: true,
      index: true
    },

    // =========================
    // EMAIL / OTP VERIFICATION
    // =========================
    isEmailVerified: {
      type: Boolean,
      default: false
    },

    emailVerificationOTP: {
      type: String,
      select: false
    },

    emailOTPExpires: {
      type: Date,
      select: false
    },

    // =========================
    // MFA / SECURITY
    // =========================
    isMfaActive: {
      type: Boolean,
      default: false
    },

    mfaSecret: {
      type: String,
      select: false
    },

    // =========================
    // TOKEN MANAGEMENT
    // =========================
    refreshTokenHash: {
      type: String,
      select: false
    },

    // =========================
    // PASSWORD RESET
    // =========================
    passwordResetToken: {
      type: String,
      select: false
    },

    passwordResetExpires: {
      type: Date,
      select: false
    },

    // =========================
    // LMS EXTENSIONS (IMPORTANT)
    // =========================
    lastLogin: {
      type: Date
    },

    profilePicture: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// =========================
// VIRTUALS
// =========================
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// =========================
// PASSWORD HASHING
// =========================
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// =========================
// PASSWORD CHECK
// =========================
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;