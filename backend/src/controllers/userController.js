const bcrypt = require('bcrypt');
const { prisma } = require('../config/database');

// Register new employee by admin
const registerEmployee = async (req, res) => {
    const { username, password, role } = req.body;

    try {
        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role: role.toUpperCase(),
            },
        });

        res.status(201).json(newUser); // Respond with the created user
    } catch (error) {
        console.error('Error registering employee:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Fetch all employees (for admin view)
const getEmployees = async (req, res) => {
    try {
        const employees = await prisma.user.findMany(); // Fetch all users (employees)
        res.json(employees);
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: { username },
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // ตรวจสอบรหัสผ่าน
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // กำหนดเส้นทางสำหรับแต่ละ role
        let redirectPath = '/';
        if (user.role === 'CASHIER') {
            redirectPath = '/cashier';
        } else if (user.role === 'CHEF') {
            redirectPath = '/kitchen';
        } else if (user.role === 'ADMIN') {
            redirectPath = '/admin'; // Admin redirect path
        }

        // ส่งข้อมูลไปให้ frontend
        res.json({ success: true, role: user.role, redirectPath });
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
    
    if (!role) {
        return res.status(400).json({ error: 'Role is required' });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: Number(id) },
            data: { role: role.toUpperCase() },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating role:', error);
        
        if (error.code === 'P2025') { // Prisma Error: Record not found
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Delete employee
const deleteEmployee = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.user.delete({
            where: { id: Number(id) },
        });
        res.status(204).send(); // No content
    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { registerEmployee, getEmployees, loginUser, editRole, deleteEmployee };
