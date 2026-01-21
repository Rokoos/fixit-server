const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();
const bodyParser = require("body-parser");
const cors = require("cors");

//Routes

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const orderRoutes = require("./routes/order");
const proposalRoutes = require("./routes/proposal");
const reviewRoutes = require("./routes/review");
const messageRoutes = require("./routes/message");
//errorHandler
const errorHandler = require("./middlewares/errorHandler");

//mongoDB  connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected!!"));

mongoose.connection.on("error", (err) => {
  console.log(`DB connection error: ${err.message}`);
});

app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(bodyParser.text({ limit: "200mb" }));
app.use(cors());

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", orderRoutes);
app.use("/api", proposalRoutes);
app.use("/api", reviewRoutes);
app.use("/api", messageRoutes);
app.use(errorHandler);

app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({
      error: "Unauthorized",
    });
  }
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  "Server is up and running on port " + port;
});
