const app = require('./src/app');
const config = require('./src/config');
const { sequelize } = require('./src/models');

async function start() {
    try {
        await sequelize.authenticate();
        // Plain sync: creates tables/indexes if they don't exist. We avoid
        // `alter` because SQLite rebuilds tables on ALTER and can corrupt the
        // composite unique indexes across restarts. If you change a model,
        // delete the sqlite file (dev) or add a migration.
        await sequelize.sync();
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
