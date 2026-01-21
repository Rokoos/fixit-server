const mongoose = require("mongoose");
const crypto = require("crypto");
const { v1: uuidv1 } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    surname: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      default: "",
    },
    showMobile: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: "user",
    },

    hashed_password: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: "",
    },
    salt: String,
    favUsers: Array,
    favs: Array,
    // reviews: Array,
    // reviewsStarsAverage: { type: Number, default: 0 },
    // proposals: Array,
    orders: Array,
    averageStars: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

//VIrtual field

userSchema
  .virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = uuidv1();
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

//methods

userSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },
  encryptPassword: function (password) {
    if (!password) return "";

    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      return "";
    }
  },
};

module.exports = mongoose.model("User", userSchema);
