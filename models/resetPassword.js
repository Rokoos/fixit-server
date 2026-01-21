const mongoose = require("mongoose");

const resetPasswordSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now() },
  siteUrl: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("ResetPassword", resetPasswordSchema);
