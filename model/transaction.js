const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The user making the transaction
    type: { type: String, enum: ["deposit", "data", "airtime", "withdrawal"], required: true }, // Type of transaction
    amount: { type: Number, required: true }, // Transaction amount
    status: { type: String, enum: ["pending", "successful", "failed"], default: "pending" }, // Status
    reference: { type: String, unique: true, required: true }, // Your unique reference for tracking
    flutterwaveReference: { type: String, unique: true }, // FLW reference (for deposits)
    providerReference: { type: String }, // VTU provider reference (for airtime/data purchases)
    createdAt: { type: Date, default: Date.now }
})

const transaction = mongoose.model('transaction', transactionSchema)

module.exports = transaction;