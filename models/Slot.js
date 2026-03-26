const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  slotNumber: String,
  isAvailable: {
    type: Boolean,
    default: true
  },
  bookedBy: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model("Slot", slotSchema);