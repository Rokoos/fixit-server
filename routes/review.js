const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { authCheck } = require("../middlewares/auth");
const {
  addReview,
  updateReview,
  deleteReview,
} = require("../controllers/review");

router.post(
  "/add_review",
  [
    body("stars").trim().notEmpty().withMessage("Wybierz ilość gwiazdek"),
    body("text")
      .trim()
      .isLength({ max: 500 })
      .withMessage("Opinia nie może zawierać więcej niż 500 znaków."),
  ],
  authCheck,
  addReview
);
router.patch(
  "/edit_review/:id",
  [
    body("stars").trim().notEmpty().withMessage("Wybierz ilość gwiazdek"),
    body("text")
      .trim()
      .isLength({ max: 500 })
      .withMessage("Opinia nie może zawierać więcej niż 500 znaków."),
  ],
  authCheck,
  updateReview
);
router.post("/delete_review", authCheck, deleteReview);

module.exports = router;
