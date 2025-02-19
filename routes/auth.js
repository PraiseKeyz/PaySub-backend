const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth')
const { register, login, profile, update } = require('../Controllers/authcontroller')

// Register a new user
router.post('/register', register);

//Login a user
router.post('/login', login);

//get user's profile
router.get('/profile', auth, profile);

//update user's profile
router.patch('/update', auth, update);


module.exports = router;