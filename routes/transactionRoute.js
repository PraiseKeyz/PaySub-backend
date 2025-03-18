const express = require("express");
const { getUserTransactions } = require("../Controllers/transactioncontroller");
const auth = require('../middlewares/auth');

const router = express.Router();

// Get all transactions for a logged-in user
router.get("/transactions", auth, getUserTransactions);

module.exports = router;
