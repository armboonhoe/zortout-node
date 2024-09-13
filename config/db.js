const mongoose = require("mongoose");
const logger = require("../logger");
require("dotenv").config();

const mongoURI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB")
    logger.info("Connected to MongoDB");
  } catch (e) {
    logger.error(`Error connecting to MongoDB: ${e.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
