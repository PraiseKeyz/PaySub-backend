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


// router.post('/register', async (req, res) => {
//     try {
//         const user = new User(req.body);
//         await user.save();
        
//         // Generate JWT token
//         const token = jwt.sign(
//             { _id: user._id.toString() },
//             process.env.JWT_SECRET,
//             { expiresIn: '24h' }
//         );

//         res.status(201).send({ user, token });
//     } catch (error) {
//         res.status(400).send(error);
//     }
// });

// // Login user
// router.post('/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });

//         if (!user) {
//             throw new Error('Unable to login');
//         }

//         const isMatch = await user.comparePassword(password);

//         if (!isMatch) {
//             throw new Error('Unable to login');
//         }

//         const token = jwt.sign(
//             { _id: user._id.toString() },
//             process.env.JWT_SECRET,
//             { expiresIn: '24h' }
//         );

//         res.send({ user, token });
//     } catch (error) {
//         res.status(400).send({ error: 'Unable to login' });
//     }
// });

// // Get current user profile
// router.get('/profile', auth, async (req, res) => {
//     res.send(req.user);
// });

// // Logout user
// router.post('/logout', auth, async (req, res) => {
//     try {
//         res.send({ message: 'Logged out successfully' });
//     } catch (error) {
//         res.status(500).send();
//     }
// });

// // Update user profile
// router.patch('/profile', auth, async (req, res) => {
//     const updates = Object.keys(req.body);
//     const allowedUpdates = ['username', 'email', 'password'];
//     const isValidOperation = updates.every(update => allowedUpdates.includes(update));

//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid updates!' });
//     }

//     try {
//         updates.forEach(update => req.user[update] = req.body[update]);
//         await req.user.save();
//         res.send(req.user);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// });

module.exports = router;