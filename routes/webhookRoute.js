const express = require('express');
const transaction = require('../Controllers/flwWebhook');

const router = express.Router();

router.post('/flw-webhook', transaction);

module.exports = router;