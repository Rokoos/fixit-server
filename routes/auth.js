const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

//middlewares;
const { authCheck } = require("../middlewares/auth");

//controllers
const { signup, signin, currentUser } = require("../controllers/auth");

router.post("/current-user", authCheck, currentUser);
router.post(
  "/signup",
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
      .withMessage("Nazwisko może składać się z min 3 i max 32 liter."),
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Podaj email")
      .isEmail()
      .withMessage("Email musi zawierać znak '@'."),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Podaj hasło")
      .isLength({ min: 6 })
      .withMessage("Hasło musi składać się z przynajmniej 6 znaków."),
  ],
  signup
);
router.post("/signin", signin);

module.exports = router;
