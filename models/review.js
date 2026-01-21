const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const reviewSchema = new mongoose.Schema(
  {
    reviewedBy: {
      type: ObjectId,
      ref: "User",
    },
    stars: {
      type: Number,
      default: 0,
    },
    reviewedUserId: { type: ObjectId, ref: "User" },
    text: {
      type: "String",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
