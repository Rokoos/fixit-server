const Review = require("../models/review");
const AppError = require("../AppError");
const { sendSimpleMessage } = require("../mailgun");
const { validationResult } = require("express-validator");
require("dotenv").config({
  path: "../.env",
});

/////////////////////////////AddReview
exports.addReview = async (req, res, next) => {
  console.log("addReview data", req.body);
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      throw new AppError(result.array()[0].msg, 400);
    }

    const {
      reviewedBy,
      reviewedByUser,
      reviewedUserId,
      reviewedUserName,
      reviewedUserEmail,
      stars,
      text,
    } = req.body;

    let rev = {
      reviewedBy,
      reviewedUserId,
      stars,
      text,
    };

    const newReview = new Review(rev);
    await newReview.save();

    const reviews = await Review.find({ reviewedUserId }, { new: true })
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

    let data = {
      recipientName: reviewedUserName,
      recipientId: reviewedUserId,
      reviewingUserId: reviewedBy,
      reviewingUserFullName: reviewedByUser,
      email: reviewedUserEmail,
      text: "dodał/a opinię do Twojego ",
      subject: "Dodano opinię.",
      name: "review",
      template: "reviewtemplate",
    };

    sendSimpleMessage(data);

    res.json({
      message: "Dodano opinię",
      reviews,
      averageStars,
    });
  } catch (error) {
    return next(error);
  }
};

//////////////////////////////////////UpdateReview

exports.updateReview = async (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      throw new AppError(result.array()[0].msg, 400);
    }
    await Review.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
    }).exec();
    const updatedReviews = await Review.find(
      { reviewedUserId: req.body.reviewedUserId },
      { new: true },
    )
      .populate("reviewedBy", "_id name surname photoUrl")
      .select("_id text reviewedBy reviewedUserId stars createdAt updatedAt")
      .sort({ createdAt: -1 })
      .exec();

    let averageStars = 0;
    if (updatedReviews.length > 0) {
      updatedReviews.forEach((el) => {
        averageStars = averageStars + el.stars;
      });
      averageStars = averageStars / updatedReviews.length;
    }

    const {
      reviewedBy,
      reviewedByUser,
      reviewedUserId,
      reviewedUserName,
      reviewedUserEmail,
    } = req.body;

    let data = {
      recipientName: reviewedUserName,
      recipientId: reviewedUserId,
      reviewingUserId: reviewedBy,
      reviewingUserFullName: reviewedByUser,
      email: reviewedUserEmail,
      text: "edytował/a opinię do Twojego ",
      subject: "Edytowano opinię.",
      name: "review",
      template: "reviewtemplate",
    };

    sendSimpleMessage(data);

    res.json({
      message: "Edytowano opinię",
      reviews: updatedReviews,
      averageStars,
    });
  } catch (error) {
    return next(error);
  }
};

////////////////////////////DeleteReview
exports.deleteReview = async (req, res, next) => {
  console.log("deleteReview", req.body);
  try {
    const {
      _id,
      reviewedBy,
      reviewedByUser,
      reviewedUserId,
      reviewedUserName,
      reviewedUserEmail,
    } = req.body;
    const deletedReview = await Review.findOneAndDelete({
      _id,
    }).exec();
    const reviews = await Review.find({ reviewedUserId }, { new: true })
      .populate("reviewedBy", "_id name surname photoUrl")
      .select("_id text reviewedBy reviewedUserId stars createdAt")
      .sort({ createdAt: -1 })
      .exec();

    let averageStars = 0;
    if (reviews.length > 0) {
      reviews.forEach((el) => (averageStars = averageStars + el.stars));
      averageStars = averageStars / reviews.length;
    } else if (reviews.length === 0) {
      averageStars = 0;
    }

    let data = {
      recipientName: reviewedUserName,
      recipientId: reviewedUserId,
      reviewingUserId: reviewedBy,
      reviewingUserFullName: reviewedByUser,
      email: reviewedUserEmail,
      text: "usunął/ęła opinię do Twojego ",
      subject: "Usunięto opinię.",
      name: "review",
      template: "reviewtemplate",
    };

    sendSimpleMessage(data);

    res.json({
      message: "Usunięto opinię",
      reviews,
      averageStars,
    });
  } catch (error) {
    return next(error);
  }
};
