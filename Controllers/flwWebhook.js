const User = require('../model/user');
const Transaction = require('../model/transaction');
require('dotenv').config();

const transaction = async (req, res) => { // Fix parameter order
    try {
        console.log("Received webhook:", req.body); // Debugging

        const payload = req.body;
        const secretHash = process.env.FLW_SECRET_HASH;
        const signature = req.headers["verif-hash"];

        if (!signature || signature !== secretHash) {
            console.log("Unauthorized request: Invalid signature");
            return res.status(401).json({ message: "Unauthorized webhook request" });
        }

        const { status, amount, account_id, flw_ref, tx_ref } = payload;

        if (status !== "successful") {
            console.log("Transaction not successful:", status);
            return res.status(400).json({ message: "Transaction not successful" });
        }

        // Find user by virtual account number
        const user = await User.findOne({ "virtualAccount.accountNumber": account_id });

        if (!user) {
            console.log("User not found for account:", account_id);
            return res.status(404).json({ message: "User not found" });
        }

        // Update user balance
        user.virtualAccount.accountAmount += amount;
        await user.save();

        // Save transaction details
        await Transaction.create({
            user: user._id,
            type: "deposit",
            amount,
            status: "successful",
            reference: tx_ref,
            flutterwaveReference: flw_ref
        });

        console.log("Wallet updated successfully for:", user.username);
        return res.status(200).json({ message: "Wallet funded successfully" });
    }
    catch (error) {
        console.error("Webhook processing error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = transaction;
