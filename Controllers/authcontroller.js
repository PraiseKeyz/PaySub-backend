const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const User = require('../model/user');
const nodemailer = require('nodemailer');

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
    try {
        // Extract user ID from the authentication middleware (assumed to be set in `req.user`)
        const userId = req.user.id;

        // Fetch user details, excluding sensitive fields like password
        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Server error" });
    }
};


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


const sendResetEmail = async (to, link) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: "Password Reset Request",
        html: `<p>Click <a href="${link}">here</a> to reset your password. The link expires in 1 hour.</p>`
    };

    await transporter.sendMail(mailOptions);
};

// Forget password logic
const forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
    
        const resetToken = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '1h'});
    
        const resetLink = `https://pay-sub.vercel.app/reset-password?token=${resetToken}`;
    
        await sendResetEmail(user.email, resetLink);
    
        res.status(200).json({ message: "Password reset link sent to your email"})
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.email) {
            return res.status(400).json({ message: "Invalid token" });
        }

        // Find user by email
        const user = await User.findOne({ email: decoded.email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Invalid or expired token" });
    }
};



module.exports = { register, login, profile, update, forgotPassword, resetPassword }
