const Transaction = require("../model/transaction");

const getUserTransactions = async (req, res) => {
  try {
    const userId = req.user._id; // Get logged-in user's ID

    // Fetch all transactions where user ID matches
    const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });

    return res.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

module.exports = { getUserTransactions };
