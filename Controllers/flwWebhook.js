const User = require('../model/user');
const Transaction = require('../model/transaction');
require('dotenv').config();

const transaction = async (res, req) => {
    try {
        const payload = req.body;
        const secretHash = process.env.FLW_SECRET_HASH;
        const signature = req.headers["verif-hash"];

        if (!signature || signature !== secretHash) {
            return res.status(401).json({ message: "Unauthorized webhook request" });
        }
        
        const { status, amount, account_id, flw_ref, tx_ref } = payload;

        if (status !== "successful") {
            return res.status(400).json({ message: "Transaction not successful" });
        }

        const user = await User.findOne({ virtualAccount: accountNumber });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.accountAmount += amount;
        await user.save();

        await Transaction.create({
            user: user._id,
            type: "deposit",
            amount,
            status: "successful",
            reference: tx_ref,
            flutterwaveReference: flw_ref
        });

        return res.status(200).json({ message: "Wallet funded successfully" });
    }
    catch (error) {
        console.error("webhook processing error:", error);
        res.status(500).json({message: "Internal server error"})
    }
}

module.exports = transaction;