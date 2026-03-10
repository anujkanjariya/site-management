const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to create token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'your_fallback_secret', {
        expiresIn: '365d'
    });
};

exports.register = async (req, res) => {
    try {
        const { name, number, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ number });
        if (userExists) {
            return res.status(400).json({ message: 'User with this number already exists' });
        }

        const user = await User.create({ name, number, password });
        const token = createToken(user._id);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            number: user.number,
            token
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { number, password } = req.body;

        const user = await User.findOne({ number });
        if (user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                number: user.number,
                token: createToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid number or password' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
