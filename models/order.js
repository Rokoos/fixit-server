const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const orderSchema = new mongoose.Schema(
  {
    addedBy: {
      type: ObjectId,
      ref: "User",
    },
    acceptedProposalId: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "",
    },

    mobile: {
      type: String,
      default: "",
    },
    gardenCategory: {
      type: String,
      default: "",
    },

    agdCategory: {
      type: String,
      default: "",
    },
    rtvCategory: {
      type: String,
      default: "",
    },
    computerCategory: {
      type: String,
      default: "",
    },
    make: {
      type: String,
      default: "",
    },
    model: {
      type: String,
      default: "",
    },
    year: {
      type: String,
      default: "",
    },
    engine: {
      type: String,
      default: "",
    },
    urgent: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
      default: "",
    },
    description: {
      type: "String",
    },
    // proposals: Array,
    photos: Array,
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
