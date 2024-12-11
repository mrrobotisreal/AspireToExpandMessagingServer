const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userType: { type: String, required: true },
  preferredName: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  profilePictureUrl: { type: String, default: null },
  socketId: { type: String, default: null }, // Null when offline
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
