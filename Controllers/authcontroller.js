const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../model/user');

dotenv.config();

//register logic...
const register = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();

        const token = jwt.sign(
            { _id: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );  
        const { password: _, ...isWithoutPassword} = user.toObject();

        res.status(201).json({ message: "New account created", user: isWithoutPassword, token});
    }
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
};

const login = async (req, res) => {
    try {
        const { email, password} = req.body;
        const user = await User.findOne({ email });

        if(!user) {
            throw new Error('Invalid credentials');
        }
         const isMatch = await user.comparePassword(password);
         if (!isMatch) {
            throw new Error('Password is not correct');
         }

         const { password: _, ...isWithoutPassword } = user.toObject();
         const token = jwt.sign(
            { _id: user._id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.status(201).json({ message: "Logged in successfully", user: isWithoutPassword, token });
    }
    catch (error) {
        console.error(error);
        res.status(400).send(error);
    }
};

//Get user's profile
const profile = async (req, res) => {
    const user = await user.find({ username, email, password })
    res.status(200).send(user);
}


//update user profile
const update = async (req,res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['username', 'email', 'password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    } catch (error) {
        res.status(400).send(error);
    }
}; 


module.exports = { register, login, profile, update }