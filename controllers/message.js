const AppError = require("../AppError");
const { sendSimpleMessage } = require("../mailgun");
const { validationResult, matchedData } = require("express-validator");
require("dotenv").config({
  path: "../.env",
});

exports.sendMessage = async (req, res, next) => {
  // console.log("sendMessage", req.body);
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      throw new AppError(result.array()[0].msg, 400);
    }

    const {
      text,
      recipientEmail,
      recipientName,
      senderFullName,
      senderId,
      orderId,
      category,
      proposalId,
    } = req.body;

    let data = {
      name: "message",
      template: "messagetemplate",
      subject: "Otrzymano wiadomość",
      email: recipientEmail,
      proposalId,
      text,
      recipientName,
      senderFullName,
      senderId,
      orderId,
      category,
    };
    sendSimpleMessage(data);

    res.json({
      message: "Wysłano wiadomość",
    });
  } catch (error) {
    return next(error);
  }
};
