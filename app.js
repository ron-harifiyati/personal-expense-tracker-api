const express = require('express');
const sequelize = require('./database');
const accountRoutes = require('./routes/accounts');
const categoryRoutes = require('./routes/categories');
require('./models/Account');
require('./models/Category');

const app = express();
app.use(express.json());

// Routes
app.use('/accounts', accountRoutes);
app.use('/categories', categoryRoutes);

// Sync database and start server
sequelize.sync().then(() => {
    console.log('Database synced');
    app.listen(3000, () => console.log('Server running at http://localhost:3000'));
})