const axios = require("axios");
const ProcessedOrder = require("../models/ProcessedOrder");
const Order = require("../models/Order");
const getAccessToken = require("./tokenService"); 
const logger = require("../logger");


async function fetchOrderData() {
  const accessToken = await getAccessToken(); 
  const url = "https://order.bentoweb.com/api/order/list/35022";

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    if (response.data.status === 1) {
      const orderList = response.data.data.order_list;

      for (const order of orderList) {
        if (order.is_paid) {
          const orderDetailUrl = `https://order.bentoweb.com/api/order/order-full/${order.order_id}`;
          
          try {
            const existingOrder = await ProcessedOrder.findOne({ orderId: order.order_id.toString() });
            
            if (existingOrder) {
                logger.info(`Order ID ${order.order_id} already processed.`);
                console.log(`Order ID ${order.order_id} already processed.`);
            } else {
                logger.info(`Processing new Order ID ${order.order_id}`);
                console.log(`Processing new Order ID ${order.order_id}`);
              
              const newProcessedOrder = new ProcessedOrder({ orderId: order.order_id.toString() });
              await newProcessedOrder.save();

              const detailResponse = await axios.get(orderDetailUrl, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Accept: "application/json",
                },
              });

              if (detailResponse.data.status === 1) {
                const orderData = detailResponse.data.data.order;

                const newOrder = new Order({
                  orderId: orderData.order_id,
                  shippingAddress: orderData.shipping_address_1,
                  shippingEmail: orderData.shipping_email,
                  customerName: `${orderData.full_order_code} : ${orderData.firstname} ${orderData.lastname}`,
                  customerPhone: orderData.shipping_phone,
                  grandTotal: parseFloat(order.grand_total),
                  shippingAmount: parseFloat(orderData.shipping),
                  paymentMethod: orderData.payment_method,
                  paymentDate: orderData.payment_datetime,
                  items: orderData.order_item.map((item) => ({
                    sku: item.sku,
                    name: item.name,
                    quantity: parseFloat(item.qty.toString()),
                    pricePerItem: parseFloat(item.price.toString()),
                    totalPrice: parseFloat(item.total.toString()),
                  })),
                });

                await newOrder.save();
                logger.info(`Order ${newOrder.orderId} saved to MongoDB.`);
                console.log(`Order ${newOrder.orderId} saved to MongoDB.`);
              }
            }
          } catch (error) {
            logger.error("Error fetching order detail:", error);
            console.error("Error processing order:", error);
          }
        }
      }
    }
  } catch (error) {
    logger.error("Error fetching order data:", error);
    console.error("Error fetching order data:", error.response?.data || error.message);
  }
}

module.exports = fetchOrderData;