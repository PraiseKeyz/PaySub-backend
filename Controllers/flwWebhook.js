const User = require('../model/user');
const Transaction = require('../model/transaction');
require('dotenv').config();

const transaction = async (req, res) => {
    try {
        console.log("Received Webhook:", JSON.stringify(req.body, null, 2)); // Log the full webhook for debugging

        // Verify Secret Hash
        const secretHash = process.env.FLW_SECRET_HASH;
        const signature = req.headers["verif-hash"];
        
        if (!signature || signature !== secretHash) {
            console.log("Unauthorized webhook attempt");
            return res.status(401).json({ message: "Unauthorized webhook request" });
        }

        // Ensure it's a bank transfer event
        if (req.body["event.type"] !== "BANK_TRANSFER_TRANSACTION") {
            console.log("Ignoring non-bank transfer event:", req.body["event.type"]);
            return res.status(400).json({ message: "Invalid event type" });
        }

        // Extract webhook data
        const { status, charged_amount, id, app_fee, tx_ref, customer, flw_ref } = req.body.data;
        
        if (status.toLowerCase() !== "successful") {
            console.log("Transaction not successful:", status);
            return res.status(400).json({ message: "Transaction not successful" });
        }

        // Find user by email (since account number is not in the webhook)
        const user = await User.findOne({ "email": customer.email });

        if (!user) {
            console.log("User not found for email:", customer.email);
            return res.status(404).json({ message: "User not found" });
        }

        // Update user's balance
        const amountToCredit = charged_amount - app_fee;
        user.virtualAccount.accountAmount += amountToCredit;
        await user.save();

        // Log transaction
        await Transaction.create({
            user: user._id,
            type: "deposit",
            amount: amountToCredit,
            id,
            status,
            reference: tx_ref,
            flw_ref,
            fee: app_fee,
            charged_amount
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
