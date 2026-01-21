const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  addProposal,
  deleteProposal,
  getProposal,
  editProposal,
  acceptanceToggle,
} = require("../controllers/proposal");
const { authCheck } = require("../middlewares/auth");

router.post("/proposal/:id", authCheck, getProposal);
router.post(
  "/new_proposal",
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Opisz propozycję.")
    .isLength({ max: 500 })
    .withMessage("Opis propozycji może zawierać maksymalnie 500 znaków."),
  authCheck,
  addProposal
);
router.patch(
  "/edit_proposal/:id",
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Opisz propozycję.")
    .isLength({ max: 500 })
    .withMessage("Opis propozycji może zawierać maksymalnie 500 znaków."),
  authCheck,
  editProposal
);
router.post("/delete_proposal/:id", authCheck, deleteProposal);
router.patch("/proposal_acceptance/:id", authCheck, acceptanceToggle);

module.exports = router;
