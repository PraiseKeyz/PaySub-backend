const express = require("express");
const auth = require('../middlewares/auth');
const  { buyDataPlan, dataPlans} = require('../Controllers/dataplans')

const router = express.Router();

router.get('/dataplans', dataPlans);

router.post('/dataplan/buy', auth, buyDataPlan)

module.exports = router;