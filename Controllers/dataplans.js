const axios = require("axios");
const Transaction = require('../model/transaction');
require("dotenv").config();

const dataPlans = async (req, res) => {
  try {
    const username = process.env.API_USERNAME;
    const password = process.env.API_PASSWORD;

    if (!username || !password) {
      return res.status(500).json({ error: "Missing API credentials" });
    }

    // Encode credentials in Base64
    const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;

    // API request configuration
    const config = {
      method: "get",
      maxBodyLength: Infinity,
      url: "https://isquaredata.com/api/data/services/",
      headers: {
        "Authorization": authHeader
      }
    };

    // Make the request
    const response = await axios(config);
    
    // Send response to the client
    res.status(200).json(response.data);

  } catch (error) {
    console.error("Error fetching data plans:", error);
    res.status(500).json({ error: "Failed to fetch data plans" });
  }
};


const buyDataPlan = async (req, res) => {
  try {
    const { plan, phone_number, reference } = req.body;
    if (!plan || !phone_number || !reference) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get user from auth middleware
    const user = req.user;

    // Check for duplicate reference (to avoid duplicate transactions)
    const existingTransaction = await Transaction.findOne({ reference });
    if (existingTransaction) {
      return res.status(400).json({ error: "Duplicate transaction reference" });
    }

    // Check wallet balance
    const planPrice = getPlanPrice(plan); // Define this function
    if (user.virtualAccount.accountAmount < planPrice) {
      return res.status(400).json({ error: "Insufficient wallet balance" });
    }

    // VTU API request setup
    const username = process.env.API_USERNAME;
    const password = process.env.API_PASSWORD;
    const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;

    const requestData = { plan, phone_number, reference };

    // Send request to VTU API
    const response = await axios.post("https://isquaredata.com/api/data/buy/", requestData, {
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
    });

    if (response.data.status !== "successful") {
      return res.status(400).json({ error: "VTU purchase failed" });
    }

    // Deduct from user's wallet AFTER successful transaction
    user.virtualAccount.accountAmount -= planPrice;
    await user.save();

    // Log transaction
    await Transaction.create({
      user: user._id,
      type: "purchase",
      amount: planPrice,
      status: "successful",
      reference,
      details: `Data plan purchase for ${phone_number}`,
    });

    return res.json({ message: "Data plan purchased successfully", data: response.data });
  } catch (error) {
    console.error("Error buying data plan:", error);
    res.status(500).json({ error: "Failed to buy data plan" });
  }
};
  


module.exports = { buyDataPlan, dataPlans};
