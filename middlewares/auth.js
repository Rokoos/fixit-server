const Order = require("../models/order");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
require("dotenv").config();

//////////////////////////////////////////////

exports.authCheck = async (req, res, next) => {
  try {
    const decoded = jwt.verify(req.headers.authtoken, process.env.JWT_SECRET);
    if (decoded) {
      const userOrders = await Order.find(
        { addedBy: decoded._id },
        { new: true }
      )
        .select("_id category createdAt")
        .sort({ createdAt: -1 })
        .exec();

      const user = await User.findById(decoded._id).select(
        "_id name surname role  email mobile  showMobile  location reviewsStarsAverage"
      );

      req.user = user;

      req.user.orders = userOrders;

      next();
    }
  } catch (err) {
    res.status(401).json({
      message: "Zaloguj się aby przeglądać zawartość",
    });
  }
};
