const axios = require("axios");
require("dotenv").config();

async function getAccessToken() {
  const url = "https://login.bentoweb.com/oauth/token";
    const payload = new URLSearchParams({
      grant_type: "password",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      username: process.env.USERNAME_BENTOWEB,
      password: process.env.PASSWORD_BENTOWEB,
    });

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    console.log("response: " + response)
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

module.exports = getAccessToken;
