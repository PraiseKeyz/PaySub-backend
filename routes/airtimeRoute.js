const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const airtimePurchase = require('../Controllers/airtimeRecharge');

router.post('/buy/airtime', auth, airtimePurchase);

module.exports = router;