// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // excluded from query results by default
    },
    name: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    currency: {
      type: String,
      default: "Rupees",
      maxlength: 10,
    },
  },
  { timestamps: true }
);

// Instance method: compare a plaintext password against the stored hash.
// Usage: const ok = await user.comparePassword("typed-password");
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Static helper used by the signup route so hashing logic lives in one place.
userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 10);
};

module.exports = mongoose.model("User", userSchema);