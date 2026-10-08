const User = require('../models/User');
const jwt = require("jsonwebtoken");

async function getUser(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "User must register or log in." });
        }

        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ message: "User authenticated.", user });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}

async function registerUser(req, res) {
    try {
        const { username, email, password } = req.body;
        if (typeof username !== "string" || !username.trim() || typeof email !== "string" || !email.trim() || typeof password !== "string") {
            return res.status(400).json({ message: "Enter a username, email, and password." });
        }
        const foundUser = await User.findOne({ email: req.body.email });

        if(foundUser !== null) return res.status(400).json({ message: "This user already exists." });

        const newUser = await User.create({ username, email: email.trim(), password });

        const payload = { _id: newUser._id };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        return res.status(201).json({ message: "User registered successfully!", token });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message })
    }
}

async function loginUser(req, res) {
    try {
        if (typeof req.body.email !== "string" || !req.body.email.trim() || typeof req.body.password !== "string" || !req.body.password) {
            return res.status(400).json({ message: "Enter an email and password." });
        }
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).json({ message: "Incorrect email or password." });
        }

        const correctPassword = await user.isCorrectPassword(req.body.password);

        if(!correctPassword) {
            return res.status(400).json({ message: "Incorrect email or password." });
        }

        const payload = { _id: user._id };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "User logged in successfully!", token });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    getUser,
    registerUser,
    loginUser,
}
