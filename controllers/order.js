const Order = require("../models/order");
const Proposal = require("../models/proposal");
const { v1: uuidv1 } = require("uuid");
const { sendSimpleMessage } = require("../mailgun");
const AppError = require("../AppError");
const { validationResult, matchedData } = require("express-validator");
require("dotenv").config({
  path: "../.env",
});

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/////////////////////////GET ORDER///////////////////
exports.getOrder = async (req, res, next) => {
  try {
    let order = await Order.findOne({ _id: req.params.orderId })
      .populate("addedBy", "_id name surname mobile email")
      .select(
        "_id addedBy description category subCategory make model year engine urgent agdCategory rtvCategory computerCategory gardenCategory active  createdAt updatedAt location mobile photos acceptedProposalId",
      )
      .exec();

    if (!order) {
      throw new AppError("Nic nie znaleziono.", 404);
    }

    let arr = [];

    if (req.user._id.toString() == order.addedBy._id) {
      arr = await Proposal.find({
        orderId: req.params.orderId,
      }).populate("addedBy", "_id name surname location");

      if (order.acceptedProposalId) {
        if (!arr.some((el) => el._id.toString() === order.acceptedProposalId)) {
          order = await Order.findOneAndUpdate(
            { _id: req.params.orderId },
            { acceptedProposalId: "" },
          )
            .populate("addedBy", "_id name surname mobile ")
            .select(
              "_id addedBy description category subCategory make model year engine urgent agdCategory rtvCategory computerCategory gardenCategory active  createdAt updatedAt location mobile photos acceptedProposalId",
            )
            .exec();
        }
      }
    } else {
      arr = await Proposal.find({
        addedBy: req.user._id.toString(),
        orderId: req.params.orderId,
      }).populate("addedBy", "_id name surname location");
    }

    res.json({ order, proposals: arr });
  } catch (error) {
    return next(error);
  }
};

///////////////////////ADD ORDER/////////////////

exports.addOrder = async (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      throw new AppError(result.array()[0].msg, 400);
    }
    let imgs = [];
    if (req.body.images.length > 0) {
      for (image of req.body.images) {
        let result = await cloudinary.uploader.upload(image, {
          folder: `order/${req.body.addedBy}`,
          public_id: `${uuidv1()}`,
          resource_type: "auto",
        });
        imgs.push({ public_id: result.public_id, url: result.secure_url });
      }
    }

    const {
      addedBy,
      category,
      subCategory,
      autoCategory,
      agdCategory,
      rtvCategory,
      computerCategory,
      make,
      model,
      engine,
      year,
      mobile,
      urgent,
      description,
      active,
      location,
      recipientName,
      recipientEmail,
    } = req.body;
    let orderData = {
      addedBy,
      description,
      category,
      subCategory,
      autoCategory,
      agdCategory,
      rtvCategory,
      computerCategory,
      mobile,
      location,
      urgent,
      active,
      photos: imgs,
      make,
      model,
      engine,
      year,
    };

    const newOrder = new Order(orderData);
    console.log("newOrder", newOrder._id.toString());
    await newOrder.save();
    const orders = await Order.find()
      .populate("addedBy", "_id name surname photoUrl")
      .sort({ createdAt: -1 })
      .exec();

    let emailData = {
      recipientName,
      email: recipientEmail,
      category,
      orderId: newOrder._id.toString(),
      name: "order",
      subject: "Dodano zlecenie",
      template: "ordertemplate",
      text: "Dodano",
    };
    sendSimpleMessage(emailData);
    res.json({
      message: "Dodano nowe zlecenie.",
      orders,
    });
  } catch (error) {
    return next(error);
  }
};
exports.editOrder = async (req, res, next) => {
  try {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      throw new AppError(result.array()[0].msg, 400);
    }

    if (req.body.imagesToDelete.length > 0) {
      await cloudinary.api.delete_resources(req.body.imagesToDelete);

      await Order.findOneAndUpdate(
        { _id: req.params.orderId },
        { $pull: { photos: { public_id: { $in: req.body.imagesToDelete } } } },
      ).exec();
    }

    let imgs = [];
    if (req.body.images.length > 0) {
      for (image of req.body.images) {
        let result = await cloudinary.uploader.upload(image, {
          folder: `order/${req.body.addedBy}`,
          public_id: `${uuidv1()}`,
          resource_type: "auto",
        });
        imgs.push({ public_id: result.public_id, url: result.secure_url });
      }
    }

    const {
      recipientName,
      recipientEmail,
      location,
      category,
      subCategory,
      urgent,
      make,
      model,
      engine,
      year,
      agdCategory,
      rtvCategory,
      computerCategory,
      gardenCategory,
      description,
    } = req.body;

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: req.params.orderId },
      {
        location,
        category,
        subCategory,
        urgent,
        make,
        model,
        engine,
        year,
        agdCategory,
        rtvCategory,
        computerCategory,
        gardenCategory,
        description,
        $push: { photos: { $each: imgs } },
      },
      { new: true },
    ).exec();

    let emailData = {
      recipientName,
      email: recipientEmail,
      category,
      orderId: req.params.orderId,
      name: "order",
      subject: "Edytowano zlecenie",
      template: "ordertemplate",
      text: "Edytowano",
    };
    sendSimpleMessage(emailData);

    res.json({
      message: "Zaktualizowano zlecenie",
      updatedOrder,
    });
  } catch (error) {
    return next(error);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    if (req.body.arr.length > 0) {
      await cloudinary.api.delete_resources(req.body.arr);
    }

    const { orderId } = req.params;
    const deletedReview = await Order.findOneAndDelete({
      _id: orderId,
    }).exec();
    await Proposal.deleteMany({ orderId });

    let emailData = {
      recipientName: req.body.recipientName,
      email: req.body.recipientEmail,
      category: req.body.category,
      orderId,
      name: "order",
      subject: "Usunięto zlecenie",
      template: "ordertemplate",
      text: "Usunięto",
    };
    sendSimpleMessage(emailData);
    res.json({
      message: "Usunięto zlecenie.",
    });
  } catch (error) {
    return next(error);
  }
};

//////////////////////////////////////////

///////////////////////Filtering
const filterOrders = (obj) => {
  let filters = {
    active: true,
  };

  if (obj?.category !== "") {
    filters["category"] = obj.category;
  }
  if (obj?.carMake !== "") {
    filters["make"] = obj.carMake;
  }
  if (obj?.carModel !== "") {
    filters["model"] = obj.carModel;
  }
  if (obj?.year !== "") {
    filters["year"] = obj.year;
  }
  if (obj?.engine !== "") {
    filters["engine"] = obj.engine;
  }
  if (obj?.agdCategory !== "") {
    filters["agdCategory"] = obj.agdCategory;
  }
  if (obj?.rtvCategory !== "") {
    filters["rtvCategory"] = obj.rtvCategory;
  }
  if (obj?.computerCategory !== "") {
    filters["computerCategory"] = obj.computerCategory;
  }
  if (obj?.gardenCategory !== "") {
    filters["gardenCategory"] = obj.gardenCategory;
  }
  if (obj?.location !== "") {
    filters["location"] = obj.location;
  }
  if (obj?.urgent) {
    filters["urgent"] = obj.urgent;
  }

  return filters;
};
exports.getFilteredOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page);
    const limit = 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let results = {};
    const orders = await Order.find(filterOrders(req.body)).exec();
    const numberOfPages = Math.ceil(orders.length / limit);
    results.numberOfPages = numberOfPages;
    results.numberOfRecords = orders.length;

    let ordersWithPagination = await Order.find(filterOrders(req.body))
      .limit(limit)
      .skip(startIndex)
      .populate("addedBy", "_id name surname ")
      .select(
        "_id category  make model year engine  agdCategory rtvCategory computerCategory description urgent createdAt location",
      )
      .sort([["createdAt", "desc"]])
      .exec();

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    if (endIndex < orders.length) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    res.json({ orders: ordersWithPagination, results });
  } catch (error) {
    return next(error);
  }
};
