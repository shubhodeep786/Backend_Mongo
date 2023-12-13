const express = require("express");
const mongoose = require("mongoose");
const cron = require("node-cron");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3010;
const { MongoClient } = require("mongodb");

const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;

const MONGODB_URI = `mongodb+srv://shubhodeepsen0802:${encodeURIComponent(
  MONGODB_PASSWORD
)}@cluster0.bluiyqk.mongodb.net/CryptoExchange?retryWrites=true&w=majority`;

const client = new MongoClient(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

/**
 * Connects to the MongoDB database.
 * @throws {Error} If there is an error connecting to the database.
 */
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
}

connectToMongoDB();

const assetDetailsSchema = new mongoose.Schema({
  id: String,
  symbol: String,
  name: String,
  platforms: mongoose.Schema.Types.Mixed,
});

const AssetDetails = mongoose.model("AssetDetails", assetDetailsSchema);

app.use(express.json());

const axios = require("axios");

/**
 * Fetches the list of cryptocurrencies from an external API and inserts them into the database.
 * @throws {Error} If there is an error fetching or inserting the cryptocurrencies.
 */
async function fetchAndStoreCryptos() {
  try {
    const response = await axios.get(
      "https://api.coingecko.com/api/v3/coins/list"
    );
    const cryptos = response.data;

    const cryptoDocuments = cryptos.map((crypto) => ({
      id: crypto.id,
      symbol: crypto.symbol,
      name: crypto.name,
      platforms: {},
    }));

    await AssetDetails.insertMany(cryptoDocuments, { maxTimeMS: 900000 });

    console.log("Cryptocurrencies inserted on server start!");
  } catch (error) {
    console.error("Error inserting cryptocurrencies:", error.message);
  }
}

cron.schedule("0 * * * *", () => {
  console.log("Running cron job...");
  fetchAndStoreCryptos();
});

/**
 * Converts the price of a cryptocurrency based on historical data.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {Error} If there is an error converting the price.
 */
app.post("/convertPrice", async (req, res) => {
  console.log("Received request to convert price");
  const { fromCurrency, toCurrency, date } = req.body;

  try {
    const fromCrypto = await AssetDetails.findOne({ name: fromCurrency });
    const toCrypto = await AssetDetails.findOne({ name: toCurrency });

    if (!fromCrypto || !toCrypto) {
      console.log("Cryptocurrency not found");
      return res.status(404).json({ error: "Cryptocurrency not found" });
    }

    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${fromCrypto.id}/market_chart`,
      {
        params: {
          vs_currency: toCrypto.id,
          from: new Date(date).getTime() / 1000,
          to: new Date(date).getTime() / 1000,
        },
      }
    );

    const price = response.data.prices[0]?.[1];

    if (price === undefined) {
      console.log("Price data not found");
      return res.status(404).json({ error: "Price data not found" });
    }

    console.log("Price converted successfully");
    res.json({ price });
  } catch (error) {
    console.error("Error converting price:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Global error handler.
 * @param {Error} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
app.use((err, req, res, next) => {
  console.error("Global error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
