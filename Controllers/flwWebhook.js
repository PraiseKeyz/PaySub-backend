const User = require('../model/user');
const Transaction = require('../model/transaction');
require('dotenv').config();

const transaction = async (req, res) => {
    try {
        console.log("Received Webhook:", req.body); // Log incoming request

        // Verify Secret Hash
        const secretHash = process.env.FLW_SECRET_HASH;
        const signature = req.headers["verif-hash"];
        
        if (!signature || signature !== secretHash) {
            console.log("Unauthorized webhook attempt");
            return res.status(401).json({ message: "Unauthorized webhook request" });
        }

        // Extract webhook data
        const { status, amount, id, fee, reference } = req.body.data;
        const accountNumber = req.body.data.account_number;
        
        if (status !== "successful") {
            console.log("Transaction not successful:", status);
            return res.status(400).json({ message: "Transaction not successful" });
        }

        // Find user by virtual account ID
        const user = await User.findOne({ "virtualAccount.accountNumber": accountNumber });

        if (!user) {
            console.log("User not found for account ID:", accountNumber);
            return res.status(404).json({ message: "User not found" });
        }

        // Update user's balance
        user.virtualAccount.accountAmount += amount;
        await user.save();

        // Log transaction
        await Transaction.create({
            user: user._id,
            type: "deposit",
            amount,
            id: id,
            status: status,
            reference: reference,
            fee: fee,
        });

        console.log("Wallet funded successfully for user:", user._id);
        return res.status(200).json({ message: "Wallet funded successfully" });
    } 
    catch (error) {
        console.error("Webhook processing error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = transaction;
