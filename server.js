const app = require('./src/app');
const config = require('./src/config');
const { sequelize } = require('./src/models');

async function start() {
    try {
        await sequelize.authenticate();
        // `alter` keeps the schema in sync as models evolve during development.
        await sequelize.sync({ alter: config.env === 'development' });
        // eslint-disable-next-line no-console
        console.log('Database synced');

        app.listen(config.port, () => {
            // eslint-disable-next-line no-console
            console.log(`Server running at http://localhost:${config.port} (${config.env})`);
        });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

start();
