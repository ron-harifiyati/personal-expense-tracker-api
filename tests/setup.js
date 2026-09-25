const { sequelize } = require('../src/models');

// Fresh in-memory schema before the suite; tear down after.
beforeAll(async () => {
    await sequelize.sync({ force: true });
});

afterAll(async () => {
    await sequelize.close();
});
