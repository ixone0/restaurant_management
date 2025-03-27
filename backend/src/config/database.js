// database.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const connectToDatabase = async () => {
    try {
        await prisma.$connect();
        console.log('Connected to the database successfully.');
    } catch (error) {
        console.error('Error connecting to the database:', error);
    }
};

const disconnectFromDatabase = async () => {
    await prisma.$disconnect();
};

module.exports = {
    prisma,
    connectToDatabase,
    disconnectFromDatabase,
};