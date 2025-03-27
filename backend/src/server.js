// server.js
const app = require('./app');
const { connectToDatabase } = require('./config/database');

const PORT = process.env.PORT || 5000;

connectToDatabase();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});