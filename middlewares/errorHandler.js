const AppError = require("../AppError");

const errorHandler = (error, req, res, next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      statusCode: error.statusCode,
    });
  }

  return res.status(500).send({ message: "Network error. Try again later." });
};
module.exports = errorHandler;
