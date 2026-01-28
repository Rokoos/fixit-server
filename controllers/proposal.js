const Order = require("../models/order");
const Proposal = require("../models/proposal");
const AppError = require("../AppError");
const { sendSimpleMessage } = require("../mailgun");
const { validationResult } = require("express-validator");
require("dotenv").config({
  path: "../.env",
});

exports.getProposal = async (req, res, next) => {
  try {
    const proposal = await Proposal.findOne({ _id: req.params.id })
      .populate("addedBy", "_id name surname mobile photoUrl location email")
      .populate("orderOwnerId", "email name surname")
      .populate("orderId", "_id category")
      .select("_id addedBy description createdAt orderId orderOwnerId accepted")
      .exec();

    if (!proposal) {
      throw new AppError("Nic nie znaleziono", 401);
    }

    const order = await Order.findOne({ _id: proposal.orderId._id.toString() })
      .select("acceptedProposalId")
      .exec();
    res.json({ proposal, acceptedProposalId: order.acceptedProposalId });
  } catch (error) {
    return next(error);
  }
};

//////////////////////////////
exports.addProposal = async (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      throw new AppError(result.array()[0].msg, 400);
    }
    const newProposal = new Proposal(req.body);
    await newProposal.save();
    let arr = [];
    if (req.user._id.toString() == req.body.orderOwnerId) {
      arr = await Proposal.find({
        orderId: req.body.orderId,
      }).populate("addedBy", "_id name surname location");
    } else {
      arr = await Proposal.find({
        addedBy: req.user._id.toString(),
        orderId: req.body.orderId,
      }).populate("addedBy", "_id name surname location");
    }

    let emailData = {
      email: req.body.recipientEmail,
      category: req.body.category,
      orderId: req.body.orderId,
      proposalId: newProposal._id.toString(),
      name: "proposal",
      subject: "Dodano propozycję",
      template: "proposaltemplate",
      text: "Dodano",
    };
    sendSimpleMessage(emailData);

    res.json({ proposals: arr, message: "Wysłano pytanie / propozycję. " });
  } catch (error) {
    return next(error);
  }
};
///////////////////////////////
exports.editProposal = async (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      throw new AppError(result.array()[0].msg, 400);
    }
    if (!req.body.accepted) {
      const proposal = await Proposal.findOneAndUpdate(
        { _id: req.params.id },

        req.body,
        { new: true },
      )
        .populate("addedBy", "_id name surname ")
        .select(
          "_id addedBy description createdAt updatedAt orderId orderOwnerId",
        )
        .exec();

      let emailData = {
        email: req.body.recipientEmail,
        category: req.body.category,
        orderId: req.body.orderId,
        proposalId: req.params.id,
        name: "proposal",
        subject: "Edytowano propozycję",
        template: "proposaltemplate",
        text: "Edytowano",
      };
      sendSimpleMessage(emailData);

      res.json({
        message: "Edycja zakończona powodzeniem",
        proposal,
      });
    } else {
      throw new AppError("Nie można edytować zaakceptowanej propozycji.", 404);
    }
  } catch (error) {
    return next(error);
  }
};
////////////////////////////////
exports.deleteProposal = async (req, res, next) => {
  try {
    if (!req.body.accepted) {
      const deletedProposal = await Proposal.findOneAndDelete({
        _id: req.params.id,
      }).exec();
      let emailData = {
        email: req.body.recipientEmail,
        category: req.body.category,
        orderId: req.body.orderId,
        proposalId: req.params.id,
        name: "proposal",
        subject: "Usunięto propozycję",
        template: "proposaltemplate",
        text: "Usunięto",
      };
      sendSimpleMessage(emailData);
      res.json({
        message: "Usunięto pytanie / propozycję.",
      });
    } else {
      throw new AppError("Nie można usunąć zaakceptowanej propozycji.", 404);
    }
  } catch (error) {
    return next(error);
  }
};
////////////////////////////////
exports.acceptanceToggle = async (req, res, next) => {
  try {
    const proposal = await Proposal.findOneAndUpdate(
      { _id: req.params.id },
      [{ $set: { accepted: { $not: "$accepted" } } }],
      { new: true },
    )
      .populate("addedBy", "_id name surname mobile photoUrl location email ")
      .populate("orderOwnerId", "email")
      .populate("orderId", "_id category")
      .select("_id addedBy description createdAt orderId orderOwnerId accepted")
      .exec();

    let acceptedProposalId = proposal.accepted ? req.params.id : "";

    const order = await Order.findOneAndUpdate(
      { _id: req.body.orderId._id },
      { acceptedProposalId },
    )
      .select("acceptedProposalId")
      .exec();

    let emailData = {
      email: req.body.addedBy.email,
      category: req.body.orderId.category,
      orderId: req.body.orderId._id,
      proposalId: req.params.id,
      userName: req.body.addedBy.name,
      name: "acceptance",
      subject: "Status Twojej propozycji uległ zmianie",
      template: "acceptancetemplate ",
      text: proposal.accepted
        ? "Zaakceptowano Twoją "
        : "Cofnięto akceptację Twojej ",
      proposal: proposal.accepted ? "propozycję" : "propozycji",
      message: proposal.accepted
        ? "Wybrano Twoją propozycję do realizacji. Poczekaj na wiadomość od  zleceniodawcy lub skontaktuj się z nim w celu ustalenia szczegółów, terminu, itp."
        : "Zleceniodawca zrezygnował z Twojej propozycji. Zalecamy edycję  i zmianę proponowanych warunków aby uczynić ją atrakcyjniejszą. ",
    };

    sendSimpleMessage(emailData);

    res.json({
      message: "Zmieniono status propozycji",
      proposal,
    });
  } catch (error) {
    return next(error);
  }
};
