const bcrypt = require('bcrypt');
const { prisma } = require('../config/database');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const generateToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};

// Register new employee by admin
const registerEmployee = async (req, res) => {
    const { username, password, role } = req.body;

    const allowedRoles = ['ADMIN', 'CHEF', 'CASHIER'];
    if (!allowedRoles.includes(role.toUpperCase())) {
        return res.status(400).json({ error: 'Invalid role' });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { username } });

        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: { username, password: hashedPassword, role: role.toUpperCase() },
        });

        res.status(201).json({ id: newUser.id, username: newUser.username, role: newUser.role });
    } catch (error) {
        console.error('Error registering employee:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Fetch all employees
const getEmployees = async (req, res) => {
    try {
        const employees = await prisma.user.findMany();
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { username } });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        const redirectPath = user.role === 'CASHIER' ? '/cashier' : user.role === 'CHEF' ? '/kitchen' : '/admin';
        const token = generateToken(user);
        res.json({ success: true, role: user.role, redirectPath, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

// Edit employee role
const editRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const allowedRoles = ['ADMIN', 'CHEF', 'CASHIER'];
    if (!role || !allowedRoles.includes(role.toUpperCase())) {
        return res.status(400).json({ error: 'Valid role is required' });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: { role: role.toUpperCase() },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating role:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Delete employee
const deleteEmployee = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.user.delete({ where: { id: Number(id) } });
        res.status(204).send(); // No content
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { registerEmployee, getEmployees, loginUser, editRole, deleteEmployee };