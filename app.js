const express = require('express');
const sequelize = require('./database');
const accountRoutes = require('./routes/accounts');
const categoryRoutes = require('./routes/categories');
const recordsRoutes = require('./routes/records');
require('./models/Account');
require('./models/Category');
require('./models/Record');

const app = express();
app.use(express.json());

// Routes
app.use('/accounts', accountRoutes);
app.use('/categories', categoryRoutes);
app.use('/records', recordsRoutes);

// Sync database and start server
sequelize.sync().then(() => {
    console.log('Database synced');
    app.listen(3000, () => console.log('Server running at http://localhost:3000'));
})