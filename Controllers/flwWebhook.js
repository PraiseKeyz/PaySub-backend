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
        console.log(amountToCredit);
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

const purchaseWebhook = async (req, res) => {
    try {
      console.log("Received Webhook:", JSON.stringify(req.body, null, 2));
  
      const { reference, status } = req.body;
  
      if (!reference || !status) {
        return res.status(400).json({ error: "Invalid webhook data" });
      }
  
      // Find the transaction by reference
      const transaction = await Transaction.findOne({ reference });
  
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
  
      // If transaction is already successful, ignore
      if (transaction.status === "successful") {
        return res.status(200).json({ message: "Transaction already processed" });
      }
      const updatedStatus = status === "success" ? "successful" : "failed";
  
      // If successful, update status and deduct balance
      if (updatedStatus === "successful") {
        const user = await User.findById(transaction.user);
  
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
  
        // Deduct from user's wallet
        user.virtualAccount.accountAmount -= transaction.amount;
        await user.save();
  
        // Update transaction status
        transaction.status = updatedStatus;
        await transaction.save();
      }
      await transaction.save();
  
      res.status(200).json({ message: "Webhook processed successfully" });
  
    } catch (error) {
      console.error("Error processing webhook:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  };
  

module.exports = {transaction, purchaseWebhook};
