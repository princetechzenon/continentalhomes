const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



exports.register = async (req, res) => {
    const { name, email, password, isAdmin } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        // Check if email already exists
        const existingUser = await User.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use!" });
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with isAdmin field
        const newUser = await User.createUser(name, email, hashedPassword, isAdmin);

        // Generate JWT token including isAdmin
        const token = jwt.sign(
            { userId: newUser.id, isAdmin: newUser.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(201).json({
            message: "User registered successfully!",
            user: { id: newUser.id, name: newUser.name, email: newUser.email, isAdmin: newUser.isAdmin },
            token
        });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const user = await User.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials!" });
        }

        // Generate JWT token including isAdmin
        const token = jwt.sign(
            { userId: user.id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful!",
            user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin },
            token
        });
    } catch (error) {
        res.status(500).json({ message: "Login error", error });
    }
};



exports.logout = async (req, res) => {
    res.json({ message: "Logout successful!" });
};
