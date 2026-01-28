const FormData = require("form-data"); // form-data v4.0.1
const Mailgun = require("mailgun.js"); // mailgun.js v11.1.0
const dotenv = require("dotenv");
dotenv.config();

const getData = (data) => {
  let obj = {
    test: "test",
    template: data.template,
    subject: data.subject,
    name: data.name,
    email: data.email,
  };
  if (data.name === "signup") {
    obj.fullName = data.fullName;
  } else if (data.name === "profile") {
    obj.userId = data.userId;
  } else if (data.name === "order") {
    obj.category = data.category;
    obj.orderId = data.orderId;
    obj.recipientName = data.recipientName;
    obj.text = data.text;
  } else if (data.name === "review") {
    obj.recipientName = data.recipientName;
    obj.recipientId = data.recipientId;
    obj.reviewingUserId = data.reviewingUserId;
    obj.reviewingUserFullName = data.reviewingUserFullName;
    obj.text = data.text;
  } else if (data.name === "proposal") {
    obj.proposalId = data.proposalId;
    obj.orderId = data.orderId;
    obj.text = data.text;
    obj.category = data.category;
  } else if (data.name === "acceptance") {
    obj.proposalId = data.proposalId;
    obj.orderId = data.orderId;
    obj.text = data.text;
    obj.category = data.category;
    obj.message = data.message;
    obj.proposal = data.proposal;
  } else if (data.name === "message") {
    obj.text = data.text;
    obj.senderFullName = data.senderFullName;
    obj.senderId = data.senderId;
    obj.recipientName = data.recipientName;
    obj.proposalId = data.proposalId;
    obj.orderId = data.orderId;
    obj.category = data.category;
  }
  return obj;
};

exports.sendSimpleMessage = async (obj) => {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.SENDING_API_KEY || "API_KEY",
    // When you have an EU-domain, you must specify the endpoint:
    url: process.env.BASE_URL,
  });
  try {
    const data = await mg.messages.create("fixitservice.pl", {
      from: "fixitservice.pl <postmaster@fixitservice.pl>",
      // to: ["Marcin Widomski <joanna.chrominska@gmail.com>"],
      // to: ["Marcin Widomski <m.widomski@tlen.pl>"],
      to: [obj.email],
      subject: obj.subject,
      template: obj.template,
      "h:X-Mailgun-Variables": JSON.stringify(getData(obj)),
    });

    console.log(data); // logs response data
  } catch (error) {
    console.log(error); //logs any error
  }
};
