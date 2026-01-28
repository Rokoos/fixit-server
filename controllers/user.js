require("dotenv").config({
  path: "../.env",
});
const User = require("../models/user");

const Review = require("../models/review");
const Order = require("../models/order");
const Proposal = require("../models/proposal");
const AppError = require("../AppError");
const { validationResult } = require("express-validator");

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.userById = async (req, res, next) => {
  try {
    const query = User.where({ _id: req.params.userId });
    const user = await query
      .findOne()
      .select("_id name surname  role mobile showMobile  email location  ");

    if (!user) {
      throw new AppError("Nie znaleziono użytkownika", 401);
    }

    req.profile = user;

    const reviews = await Review.find(
      { reviewedUserId: req.params.userId },
      { new: true },
    )
      .populate("reviewedBy", "_id name surname")
      .select("_id text reviewedBy reviewedUserId stars createdAt")
      .sort({ createdAt: -1 })
      .exec();

    let averageStars = 0;
    if (reviews.length > 0) {
      reviews.forEach((el) => {
        averageStars = averageStars + el.stars;
      });
      averageStars = averageStars / reviews.length;
    }

    const orders = await Order.find(
      { addedBy: req.params.userId },
      { new: true },
    )
      .select(
        "_id category   make model year engine  description urgent location proposals updatedAt ",
      )
      .sort({ updatedAt: -1 })
      .exec();

    res.json({
      user,
      reviews,
      averageStars,
      orders,
    });

    next();
  } catch (error) {
    return next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      throw new AppError(result.array()[0].msg, 400);
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.userId },
      req.body,
      {
        new: true,
      },
    )
      .select("_id name surname location mobile showMobile")
      .exec();

    res.json({ message: "Profil zaktualizowany.", updatedUser });
  } catch (error) {
    return next(error);
  }
};
///////////////////DELETE USER//////////////////////
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const deletedUser = await User.findOneAndDelete({
      _id: userId,
    }).exec();

    await Order.deleteMany({ addedBy: userId });
    await Proposal.deleteMany({
      $or: [{ addedBy: userId }, { orderOwnerId: userId }],
    });
    await Review.deleteMany({
      $or: [{ reviewedUserId: userId }, { reviewedBy: userId }],
    });

    // check if cloudinary subfolder exists
    const result = await cloudinary.api.sub_folders("order");
    const folderExists = result.folders.some(
      (folder) => folder.name === userId,
    );
    if (folderExists) {
      await cloudinary.api.delete_resources_by_prefix("order/" + userId);
      await cloudinary.api.delete_folder("order/" + userId);
    }
    res.json({ message: "Profil usunięty z powodzeniem! Do zobaczenia!" });
  } catch (error) {
    res.json({ message: error });
  }
};

/////////////////////////////////

exports.getUsers = async (req, res, next) => {
  try {
    let users = await User.find({
      role: "user",
    }).exec();
    res.json(users);
  } catch (error) {
    return next(error);
  }
};
