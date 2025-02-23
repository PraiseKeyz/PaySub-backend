const axios = require("axios");
const dotenv = require('dotenv');

dotenv.config();

const virtualAccount = async (req, res) => {
    try {
        // ✅ Extract the authenticated user’s email from req.user
        const userEmail = req.user.email;
        const userPhone = req.user.phone;
        const { bvn } = req.body
        if (!userEmail) {
          return res.status(400).json({ error: "User email is required" });
        };

        if (!bvn) {
            return res.status(400).json({error: "BVN is required"});
        }

    if (!userPhone) {
      return res.status(400).json({ error: "Phone number is required" });
    }
    
        // ✅ Define the Flutterwave API request
        const options = {
          method: "POST",
          url: "https://api.flutterwave.com/v3/virtual-account-numbers",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`, // ✅ Secure API key
            "Content-Type": "application/json",
          },
          data: {
            email: userEmail, // ✅ Use the authenticated user's email
            amount: 5000,
            tx_ref: `txn-${Date.now()}`, // ✅ Unique transaction reference
            is_permanent: true,
            bvn, // Add the BVN here
            phone: userPhone,
            fullname: req.user.fullname,
            narration: `${req.user.fullname}`,
          },
        };
    
        // ✅ Send request to Flutterwave
        const response = await axios.request(options);


        const virtualAccountData = response.data.data;
         if(!virtualAccountData) {
            return res.status(400).json({error: "Failed to generate a virtual account"})
         }
         req.user.virtualAccount = {
            accountName: virtualAccountData.narration,
            accountNumber: virtualAccountData.account_number,
            bankName: virtualAccountData.bank_name,
            reference: virtualAccountData.flw_ref,
            accountAmount: virtualAccountData.amount,
            orderRef: virtualAccountData.order_ref
         }

         await req.user.save();

         res.status(200).json({ message: "Virtual account created", virtualAccount: req.user.virtualAccount });
      } catch (error) {
        console.error("Error generating virtual account:", error);
        res.status(500).json({ error: "Server error. Could not generate virtual account." });
      }
}
module.exports = virtualAccount;
