const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  users: [{ type: String }], // userId of participants
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
});

const Room = mongoose.model("Room", roomSchema);

module.exports = { Room };
