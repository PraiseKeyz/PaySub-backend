const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRouter = require('./routes/auth');
const virtualaccountRouter = require('./routes/virtualAccount');
const dataPlans = require('./routes/dataplans');
const webhookRouter = require('./routes/webhookRoute');
const transactionRoute = require('./routes/transactionRoute');
const cableRoute = require('./routes/cableSubscriptionRoute');
const airtimePurchase = require('./routes/airtimeRoute');
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDb Connected"))
    .catch((err) =>{ console.error("There is an error in connection:",err)});

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1', virtualaccountRouter);
app.use('/api/v1', dataPlans);
app.use('/api/v1', webhookRouter);
app.use('/api/v1', transactionRoute);
app.use('/api/v1', cableRoute);
app.use('/api/v1', airtimePurchase);



// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

