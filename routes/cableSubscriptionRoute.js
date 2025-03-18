const express = require('express');
const auth = require('../middlewares/auth');
const { buyCableSubscription, getCableSubscriptions } = require('../Controllers/cablecontroller');

const router = express.Router();

router.get('/cable/service', getCableSubscriptions);

router.post('/cable/buy', auth, buyCableSubscription);

module.exports = router;