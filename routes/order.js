const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  getOrder,
  addOrder,
  editOrder,
  deleteOrder,
  getFilteredOrders,
} = require("../controllers/order");
const { authCheck } = require("../middlewares/auth");

//////////////////////////////////
router.post(
  "/new_order",
  [
    body("category").trim().notEmpty().withMessage("Wybierz kategorię."),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Dodaj opis.")
      .isLength({ min: 100, max: 1000 })
      .withMessage(
        "Opis zlecenia musi zawierać minimalnie 100 i maksymalnie 1000 znaków."
      ),
    body("location")
      .trim()
      .notEmpty()
      .withMessage("Dodaj lokalizację.")
      .isLength({ min: 3, max: 30 })
      .withMessage("Lokalizacja może składać się z min 3 i max 32 znaków."),
  ],
  authCheck,
  addOrder
);
router.patch(
  "/edit_order/:orderId",
  [
    body("location")
      .trim()
      .notEmpty()
      .withMessage("Podaj lokalizację.")
      .isLength({ min: 3, max: 30 })
      .withMessage("Lokalizacja może składać się z min 3 i max 32 znaków."),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Podaj opis.")
      .isLength({ min: 100, max: 3000 })
      .withMessage(
        "Opis zlecenia może zawierać minimalnie 100 i maksymalnie 3000 znaków."
      ),
  ],
  authCheck,
  editOrder
);
router.post("/delete_order/:orderId", authCheck, deleteOrder);
router.post("/order/:orderId", authCheck, getOrder);
router.post("/filters", getFilteredOrders);

module.exports = router;
