const mongoose = require("mongoose");

const processedOrderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
});

module.exports = mongoose.model("ProcessedOrder", processedOrderSchema);