const cron = require("node-cron");
const axios = require("axios");
const fs = require("fs");

async function getAccessToken() {
  const url = "https://login.bentoweb.com/oauth/token";
  const payload = new URLSearchParams({
    grant_type: "password",
    client_id: "98",
    client_secret: "UuZFKI9feDFjltRTT99W1FjE7W81avoFzQMJL/BLlg8=",
    username: "gucut1@gmail.com",
    password: "aA151225",
  });

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return response.data.access_token;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      throw new Error(
        "Unauthorized: Invalid client credentials or other authentication issue."
      );
    }
    throw error;
  }
}

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
      orderList.forEach(async (order) => {
        if (order.is_paid) {
          const orderDetailUrl = `https://order.bentoweb.com/api/order/order-full/${order.order_id}`;

          fs.readFile("storage.json", "utf8", async (err, data) => {
            if (err) {
              console.error("Error reading file:", err);
              return;
            }

            try {
              const parsedData = JSON.parse(data);
              // Example: Check if a specific order ID exists in the storage array
              const orderIdToCheck = order.order_id.toString(); // Change this to the ID you want to check
              const exists = parsedData.storage.some(
                (item) => item === orderIdToCheck
              );

              if (exists) {
                console.log(`Order ID ${orderIdToCheck} found in storage.`);
              } else {
                console.log(`Order ID ${orderIdToCheck} not found in storage.`);
                parsedData.storage.push(order.order_id.toString());
                fs.writeFileSync("storage.json", JSON.stringify(parsedData));
                try {
                  const detailResponse = await axios.get(orderDetailUrl, {
                    headers: {
                      Authorization: `Bearer ${accessToken}`,
                      Accept: "application/json",
                    },
                  });
                  if (detailResponse.data.status === 1) {
                    const zortoutUrl = `https://open-api.zortout.com/v4/Order/AddOrder`;
                    try {
                      const zortoutPayload = {
                        shippingaddress:
                          detailResponse.data.data.order.shipping_address_1,
                        shippingemail:
                          detailResponse.data.data.order.shipping_email,
                        status: "Success",
                        paymentstatus: "Paid",
                        customername: `${detailResponse.data.data.order.full_order_code} : ${detailResponse.data.data.order.firstname} ${detailResponse.data.data.order.lastname}`,
                        customerphone:
                          detailResponse.data.data.order.shipping_phone,
                        amount: parseFloat(order.grand_total),
                        shippingamount: parseFloat(
                          detailResponse.data.data.order.shipping
                        ),
                        paymentamount:
                          detailResponse.data.data.order.grand_total,
                        paymentmethod:
                          detailResponse.data.data.order.payment_method,
                        paymentdate:
                          detailResponse.data.data.order.payment_datetime,
                        list: detailResponse.data.data.order.order_item.map(
                          (item, index) => {
                            return {
                              sku: item.sku,
                              name: item.name,
                              number: parseFloat(item.qty.toString()),
                              pricepernumber: parseFloat(item.price.toString()),
                              discount: "0",
                              totalprice: parseFloat(item.total.toString()),
                            };
                          }
                        ),
                      };
                      // console.log(zortoutPayload);
                      const zortoutResponse = await axios.post(
                        zortoutUrl,
                        zortoutPayload,
                        {
                          headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                            storename: "gucut@icloud.com",
                            apikey:
                              "fvqzSTdF/xQtlfaBHKI4g8zSvLIAaG82GGWNwsNsO/w=",
                            apisecret:
                              "3AHTMk9SdSuhG5f0WJW3aJToYvqunLPTR9rY4vkhDw=",
                          },
                        }
                      );
                    } catch (error) {
                      console.error("Error zortout fetching :", error);
                    }
                  }
                } catch (error) {
                  console.error("Error fetching order detail:", error);
                }
              }
            } catch (parseError) {
              console.error("Error parsing JSON:", parseError);
            }
          });
        }
      });
    }
  } catch (error) {
    console.error("Error fetching order data:", error);
  }
}

cron.schedule("*/10 * * * *", () => {
  console.log("Running the cron job every 10 minutes...");
  fetchOrderData()
    .then(() => console.log("Data fetched and processed."))
    .catch((error) => console.error("Error during data fetching:", error));
});

console.log("Cron job has been set up.");
