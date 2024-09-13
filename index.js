const express = require("express");
const cron = require("node-cron");
const connectDB = require("./config/db");
const fetchOrderData = require("./services/orderService");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3030;

connectDB();

cron.schedule("*/1 * * * *", () => {
  console.log("Running the cron job every minute...");
  fetchOrderData()
    .then(() => console.log("Data fetched and processed."))
    .catch((error) => console.log("Error during data fetching:", error));
});

app.get("/check", (req, res) => {
  res.send("Server is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});