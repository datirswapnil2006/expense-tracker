// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

// Email format check — not the full RFC 5322 spec (which is notoriously
// complex and still lets through nonsense), but a properly tightened,
// pragmatic check. Rejects the structural mistakes a loose "has @ and a
// dot" regex misses:
//   - leading/trailing/consecutive dots in the local part or domain
//   - domain labels starting or ending with a hyphen
//   - empty domain labels (e.g. "test@.com")
//   - a TLD shorter than 2 letters
const EMAIL_RE =
  /^(?!.*\.\.)[A-Za-z0-9](?:[A-Za-z0-9._%+-]*[A-Za-z0-9])?@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

// Best-effort "does this look like a plausible name" check. This can
// never be perfect — short or unusual real names exist — so it only
// rejects the clearest cases of keyboard-mash:
//   - 4+ consecutive consonants (real names essentially never do this;
//     the longest common real-world run is 3, e.g. "tch" in "Mitchell")
//   - the same character repeated 4+ times in a row
function isPlausibleName(name) {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 60) return false;
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) return false;
  if (/[bcdfgjklmnpqrstvwxzBCDFGJKLMNPQRSTVWXZ]{4,}/.test(trimmed)) return false;
  if (/(.)\1{3,}/.test(trimmed)) return false;
  return true;
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (v) => EMAIL_RE.test(v),
        message: "Please enter a valid email address.",
      },
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // excluded from query results by default
    },
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      validate: {
        validator: isPlausibleName,
        message:
          "Please enter a real name (letters only, 2–60 characters).",
      },
    },
    currency: {
      type: String,
      default: "INR",
      maxlength: 3,
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