const express = require('express');
const sequelize = require('./database');
const accountRoutes = require('./routes/accounts');
require('./models/Account');

const app = express();
app.use(express.json());

// Routes
app.use('/accounts', accountRoutes);

// Sync database and start server
sequelize.sync().then(() => {
    console.log('Database synced');
    app.listen(3000, () => console.log('Server running at http://localhost:3000'));
})