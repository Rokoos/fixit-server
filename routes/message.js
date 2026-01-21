const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { authCheck } = require("../middlewares/auth");
const { sendMessage } = require("../controllers/message");

router.post(
  "/send_message",
  [
    body("text")
      .trim()
      .isLength({ min: 100, max: 500 })
      .withMessage(
        "Wiadomość nie może zawierać mniej niż 100 i więcej niż 500 znaków."
      ),
  ],
  authCheck,
  sendMessage
);

module.exports = router;
