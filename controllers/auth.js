const User = require("../models/user");
const Review = require("../models/review");
const Order = require("../models/order");
const jwt = require("jsonwebtoken");
const AppError = require("../AppError");
const { validationResult, matchedData } = require("express-validator");
require("dotenv").config();

//////////////////////////////Signup
exports.signup = async (req, res, next) => {
  try {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      throw new AppError(result.array()[0].msg, 400);
    }

    const data = matchedData(req);
    const userExists = await User.findOne({ email: data.email });
    console.log(userExists);
    if (userExists) {
      throw new AppError(
        "Podany e-mail już istnieje w naszej bazie danych",
        403
      );
    }
    const user = new User(data);
    await user.save();

    res.json({
      message: "Rejestracja przebiegła pomyślnie. Możesz się zalogować.",
      user,
    });
  } catch (error) {
    return next(error);
  }
};

/////////////////////////////Signin

exports.signin = async (req, res, next) => {
  try {
    const query = User.where({ email: req.body.email });
    const user = await query.findOne();
    if (!user) {
      throw new AppError("Błędne dane logowania.", 401);
    }

    if (!user.authenticate(req.body.password)) {
      throw new AppError("Błędne dane logowania.", 401);
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.cookie("t", token);
    let favs;
    let newFavUsers = [];
    if (user.favUsers.length > 0) {
      favs = await User.find()
        .where("_id")
        .in(user.favUsers)
        .select("_id photoUrl name surname")
        .exec();
      favs.forEach((el) => newFavUsers.push(el._id.toString()));

      if (newFavUsers.length < user.favUsers.length) {
        await User.updateOne(
          {
            _id: user._id,
          },
          {
            $set: {
              favUsers: newFavUsers,
            },
          }
        );
      }
    }
    const reviews = await Review.find({ nannyId: user._id }, { new: true })
      .populate("reviewedBy", "_id name surname")
      .select("_id text reviewedBy nannyId stars createdAt")
      .sort({ createdAt: -1 })
      .exec();
    const orders = await Order.find({ addedBy: user._id }, { new: true })
      .select("_id category hourlyRate createdAt")
      .sort({ createdAt: -1 })
      .exec();

    const {
      _id,
      name,
      surname,
      role,
      email,
      mobile,
      photoUrl,
      favUsers,
      reviewsStarsAverage,
      location,
      proposals,
    } = user;

    return res.json({
      token,
      user: {
        _id,
        name,
        surname,
        role,
        email,
        mobile,
        photoUrl,
        favUsers: user.favUsers.length > 0 ? newFavUsers : favUsers,
        favs,
        reviews,
        reviewsStarsAverage,
        location,
        proposals,
        orders,
      },
    });
  } catch (error) {
    return next(error);
  }
};

exports.currentUser = (req, res) => {
  res.json(req.user);
};
