# Restaurant management

## Description

This project features a frontend developed with Next.js and a backend powered by Express.js. It offers a user-friendly interface for managing employees, complete with authentication and role-based access control (RBAC). The backend is built using PostgreSQL for data storage, and JSON Web Tokens (JWT) are utilized for secure authentication and authorization, ensuring that users have the appropriate access based on their roles.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Scripts](#scripts)
- [Frontend Dependencies](#frontend-dependencies)
- [Backend Dependencies](#backend-dependencies)
- [Environment Variables](#environment-variables)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
2. Navigate to the frontend directory and install dependencies:
    ```bash
    cd frontend
    npm install
3. Navigate to the backend directory and install dependencies:
    ```bash
    cd backend
    npm install

## Usage
4. To start the development server for the frontend:
    ```bash
    cd frontend
    npm run dev
5. To start the backend server, use:
    ```bash
    cd backend/src
    node server.js

Make sure to run the backend server before accessing the frontend.

## Scripts
Frontend Scripts
dev: Starts the Next.js development server with Turbopack.
build: Builds the application for production.
start: Starts the production server.
lint: Runs ESLint for code quality checks.
Backend Scripts
Ensure you have the necessary scripts in your backend package.json for starting the server.

## Frontend Dependencies
Next.js: A React framework for server-rendered applications.
React: A JavaScript library for building user interfaces.
React DOM: Provides DOM-specific methods for React.
CORS: Middleware for enabling CORS in Express applications.
Tailwind CSS: A utility-first CSS framework.
## Backend Dependencies
Express: A web framework for Node.js.
Cookie-parser: Middleware for parsing cookies.
Cors: Middleware for enabling CORS.
Dotenv: Loads environment variables from a .env file.
Jsonwebtoken: For creating and verifying JSON Web Tokens.
Bcrypt: For hashing passwords.
Prisma: An ORM for database interactions.

## Environment Variables
6. Create a .env file in the backend directory with the following variables:
    ```bash
    DB_URL="your_database_url"
    PORT=5000
    JWT_SECRET="your_secret_key"
Replace your_database_url and your_secret_key with your actual database connection string and a secret key for JWT.

Feel free to replace `<repository-url>` and `<repository-directory>` with the actual details for your project!
