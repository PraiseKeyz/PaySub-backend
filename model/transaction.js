const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The user making the transaction
    type: { type: String, enum: ["deposit", "data", "airtime", "withdrawal"], required: true }, // Type of transaction
    amount: { type: Number, required: true }, // Amount credited after fees
    charged_amount: { type: Number }, // Full amount before fees
    fee: { type: Number }, // Processing fee deducted
    currency: { type: String, default: "NGN" }, // Transaction currency
    status: { type: String, enum: ["pending", "successful", "failed"], default: "pending" }, // Status
    reference: { type: String, unique: true, required: true }, // Your unique reference for tracking
    flw_ref: { type: String }, // Flutterwave reference ID
    plan: { type: String},
    narration: { type: String }, // Transaction description
    createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
