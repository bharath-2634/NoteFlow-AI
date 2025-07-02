const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
        return this.authType === "email"; 
    },
  },
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  authType: { 
    type: String, 
    enum: ["email", "google"],
    required: true 
  },
  className : [String],
  permissions: {
    type: Boolean,
    default : false,
  },
  metadata: {
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
  },
});

const User = mongoose.model("User", UserSchema);
module.exports = User;