const axios = require('axios');
require('dotenv').config()

const getCableSubscriptions = async (req, res) => {
    try {
        const username = process.env.API_USERNAME;
        const password = process.env.API_PASSWORD;
    
        if (!username || !password) {
          return res.status(500).json({ error: "Missing API credentials" });
        }
    
        // Encode credentials in Base64
        const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;

        const config = {
            method: 'get',
          maxBodyLength: Infinity,
            url: 'https://isquaredata.com/api/cable/services/',
            headers: { "Authorization": authHeader }
          };
          const response = await axios(config)

          res.status(200).json(response.data);
          }
          catch (error) {
            console.error("Error fetching cable subscriptons:", error)
            res.status(500).json({ error: "Failed to fetch cable subscriptions"})
          }
};

const buyCableSubscription = async (req, res) => {
    try {
        const { service, plan, smartcard, phone_number, subscription_type, amount, reference } = req.body;

        // Validate request body
        if (!service || !plan || !smartcard || !phone_number || !subscription_type || !amount || !reference) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Get user from auth middleware
        const user = req.user;

        // Check if user has sufficient balance
        if (user.virtualAccount.accountAmount < amount) {
            return res.status(400).json({ error: "Insufficient wallet balance" });
        }

        // Deduct amount from user balance
        user.virtualAccount.accountAmount -= amount;
        await user.save();

        // Prepare request payload
        const requestData = {
            service,
            plan,
            smartcard,
            phone_number,
            subscription_type,
            amount,
            reference,
            webhook_url: "https://yourdomain.com/api/cable/webhook"
        };


        const username = process.env.API_USERNAME;
        const password = process.env.API_PASSWORD;
        const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;


        // Send request to VTU API
        const response = await axios.post("https://isquaredata.com/api/cable/buy/", requestData, {
            maxBodyLength: Infinity,
            headers: {
                "Authorization": authHeader,
                "Content-Type": "application/json"
            }
        });

        // Respond with the API result
        res.status(200).json(response.data);
    } catch (error) {
        console.error("Error buying cable subscription:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to process cable subscription" });
    }
};

module.exports = { buyCableSubscription, getCableSubscriptions }