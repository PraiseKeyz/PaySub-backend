const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth')
const virtualAccount = require('../Controllers/virtualaccount');
const getVirtualAccount = require('../Controllers/getVirtualAccount');

router.post('./generate-virtualaccount', auth, virtualAccount);

router.get('./virtual-account', auth, getVirtualAccount);

module.exports = router;