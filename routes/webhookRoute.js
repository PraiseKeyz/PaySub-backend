const express = require('express');
const {transaction, purchaseWebhook} = require('../Controllers/flwWebhook');

const router = express.Router();

router.post('/flw-webhook', transaction);

router.post('/isquare-webhook', purchaseWebhook);

module.exports = router;