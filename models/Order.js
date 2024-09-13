const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderId: String,
  shippingAddress: String,
  shippingEmail: String,
  customerName: String,
  customerPhone: String,
  grandTotal: Number,
  shippingAmount: Number,
  paymentMethod: String,
  paymentDate: Date,
  items: [
    {
      sku: String,
      name: String,
      quantity: Number,
      pricePerItem: Number,
      totalPrice: Number,
    },
  ],
});

module.exports = mongoose.model("Order", orderSchema);