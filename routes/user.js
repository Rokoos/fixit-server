const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  userById,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/user");
const { authCheck } = require("../middlewares/auth");

router.get("/users", getUsers);
router.post("/user/:userId", authCheck, userById);
router.patch(
  "/edit_profile/:userId",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Podaj imię.")
      .isString()
      .withMessage("Imię musi składać się z liter.")
      .isLength({ min: 3, max: 32 })
      .withMessage("Imię może składać się z min 3 i max 32 liter."),
    body("surname")
      .trim()
      .notEmpty()
      .withMessage("Podaj nazwisko")
      .isString()
      .withMessage("Nazwisko musi składać się z liter.")
      .isLength({ min: 3, max: 32 })
      .withMessage("Nazwisko musi zawierać min 3 i max 32 liter."),
    body("location")
      .trim()
      .notEmpty()
      .withMessage("Podaj lokalizację.")
      .isLength({ min: 3, max: 30 })
      .withMessage("Lokalizacja musi zawierać min 3 i max 32 znaków."),
  ],
  updateUser,
);
router.post("/delete_user/:userId", authCheck, deleteUser);

module.exports = router;
