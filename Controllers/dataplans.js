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
      url: "https://isquaredata.com/api/data/plans/",
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
    const { planId, phoneNumber, amount } = req.body;

    if (!planId || !phoneNumber || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const reference = `txn_${Date.now()}`;
    const user = req.user;

    // Check if user has enough balance
    if (user.virtualAccount.accountAmount < amount) {
      return res.status(400).json({ error: "Insufficient wallet balance" });
    }

    const WEBHOOK_URL = process.env.BASE_URL;

    // VTU API request setup
    const requestData = {
      plan: planId,
      phone_number: phoneNumber,
      reference: reference,
      disable_validation: false,
      webhook_url: `${WEBHOOK_URL}/api/v1/isquare-webhook`
    };

    const username = process.env.API_USERNAME;
    const password = process.env.API_PASSWORD;

    if (!username || !password) {
      return res.status(500).json({ error: "Missing API credentials" });
    }

    // Encode credentials in Base64
    const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;

    // Send request to VTU API
    const response = await axios.post("https://isquaredata.com/api/data/buy/", requestData, {
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
    });


      // Save transaction
      const newTransaction = new Transaction({
        user: user._id,
        type: "data",
        reference: reference,
        plan: planId,
        amount: amount,
        phoneNumber: phoneNumber,
        status: "pending"
      });

      await newTransaction.save();

      return res.json({ message: "Data plan purchased successfully", data: response.data });

  } catch (error) {
    console.error("Error buying data plan:", error);
    res.status(500).json({ error: "Failed to buy data plan" });
  }
};

  


module.exports = { buyDataPlan, dataPlans};
