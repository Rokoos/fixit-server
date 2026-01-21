const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const proposalSchema = new mongoose.Schema(
  {
    addedBy: {
      type: ObjectId,
      ref: "User",
    },
    orderId: { type: ObjectId, ref: "Order" },
    orderOwnerId: { type: ObjectId, ref: "User" },
    description: {
      type: "String",
      default: "",
    },
    accepted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Proposal", proposalSchema);
