const axios = require('axios');
require("dotenv").config();

const airtimeRecharge = async (res, req) => {
    try {
        const { network, amount, phoneNumber } = req.body;
        if ( !network || !amount || !phoneNumber ) {
            return res.status(400).json({ error: "Missing required fields" });  
        }

        const reference = `txn_${Date.now()}`;
        const user = req.user;

        if (user.virtualAccount.accountAmount < amount) {
            return res.status(400).json({ error: "Insufficient wallet balance" });
          }

          const WEBHOOK_URL = process.env.BASE_URL;

          const requestData = {
            network: network,
            amount: amount,
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
          const response = await axios.post("https://isquaredata.com/api/airtime/buy/", requestData, {
            headers: { Authorization: authHeader, "Content-Type": "application/json" },
          });

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
          return res.json({ message: "Airtime purchased successfully", data: response.data });
    }
    catch (error) {
        console.error("Error purchasing airtime:", error);
        res.status(500).json({ error: "Failed to buy airtime" })
    }
}

module.exports = airtimeRecharge;