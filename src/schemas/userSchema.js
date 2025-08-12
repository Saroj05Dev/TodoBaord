import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"]
    },

    password: {
        type: String,
        required: true,
        trim: true,
        match: [/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^A-Za-z0-9]).{8,}$/, "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character"]
    },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // Only hash if modified
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  const isPasswordValidate = await bcrypt.compare(enteredPassword, this.password);

  if(!isPasswordValidate) {
    throw {reason: "Invalid password, please try again later", statusCode: 401};
  }
};


const User = mongoose.model('User', userSchema);

export default User;