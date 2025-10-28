// server.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
require('./src/db');
const sequelize = require('./src/models'); // Sequelize instance
const Country = require('./src/models/Country'); // Model
const countryRoutes = require('./src/routes/countryRoutes');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Basic test route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running 🚀' });
});
app.use('/countries', countryRoutes);

// PORT from .env or default 5000
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  sequelize.sync({ alter: true })
  .then(() => console.log('Database synchronized successfully!'))
  .catch(err => console.error('Database sync failed:', err.message));
});
