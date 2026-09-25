const request = require('supertest');
const app = require('../src/app');

/**
 * End-to-end coverage of the core flows: auth, seeding, balance maths across
 * income/expense/transfer, editing, deletion reconciliation, budgets,
 * analytics, and ownership isolation between users.
 */
describe('Personal Expense Tracker API', () => {
    const agent = request(app);
    let token;
    let userId;
    let cash;
    let bank;
    let salaryCat;
    let foodCat;

    const auth = () => ({ Authorization: `Bearer ${token}` });

    test('health check is public', async () => {
        const res = await agent.get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    test('rejects registration with a short password', async () => {
        const res = await agent.post('/api/auth/register').send({
            name: 'Ron',
            email: 'ron@example.com',
            password: 'short',
        });
        expect(res.status).toBe(400);
    });

    test('registers a user and seeds defaults', async () => {
        const res = await agent.post('/api/auth/register').send({
            name: 'Ron',
            email: 'ron@example.com',
            password: 'supersecret',
        });
        expect(res.status).toBe(201);
        expect(res.body.token).toBeTruthy();
        token = res.body.token;
        userId = res.body.user.id;

        const cats = await agent.get('/api/categories').set(auth());
        expect(cats.body.length).toBeGreaterThan(0);

        const accounts = await agent.get('/api/accounts').set(auth());
        expect(accounts.body.length).toBe(2);
        cash = accounts.body.find((a) => a.title === 'Cash');
        bank = accounts.body.find((a) => a.title === 'Bank');

        salaryCat = cats.body.find((c) => c.title === 'Salary');
        foodCat = cats.body.find((c) => c.title === 'Food & Drink');
    });

    test('blocks access without a token', async () => {
        const res = await agent.get('/api/accounts');
        expect(res.status).toBe(401);
    });

    test('rejects duplicate email', async () => {
        const res = await agent.post('/api/auth/register').send({
            name: 'Other',
            email: 'ron@example.com',
            password: 'supersecret',
        });
        expect(res.status).toBe(409);
    });

    test('income increases the destination account balance', async () => {
        const res = await agent
            .post('/api/records')
            .set(auth())
            .send({ type: 'income', amount: 1000, toAccountId: bank.id, categoryId: salaryCat.id, notes: 'Payday' });
        expect(res.status).toBe(201);

        const acc = await agent.get(`/api/accounts/${bank.id}`).set(auth());
        expect(parseFloat(acc.body.amount)).toBe(1000);
    });

    test('expense decreases the source account balance', async () => {
        const res = await agent
            .post('/api/records')
            .set(auth())
            .send({ type: 'expense', amount: 150.5, fromAccountId: bank.id, categoryId: foodCat.id });
        expect(res.status).toBe(201);

        const acc = await agent.get(`/api/accounts/${bank.id}`).set(auth());
        expect(parseFloat(acc.body.amount)).toBe(849.5);
    });

    test('rejects an expense against an income category', async () => {
        const res = await agent
            .post('/api/records')
            .set(auth())
            .send({ type: 'expense', amount: 10, fromAccountId: bank.id, categoryId: salaryCat.id });
        expect(res.status).toBe(400);
    });

    test('transfer moves money between accounts', async () => {
        const res = await agent
            .post('/api/records')
            .set(auth())
            .send({ type: 'transfer', amount: 200, fromAccountId: bank.id, toAccountId: cash.id });
        expect(res.status).toBe(201);

        const bankAcc = await agent.get(`/api/accounts/${bank.id}`).set(auth());
        const cashAcc = await agent.get(`/api/accounts/${cash.id}`).set(auth());
        expect(parseFloat(bankAcc.body.amount)).toBe(649.5);
        expect(parseFloat(cashAcc.body.amount)).toBe(200);
    });

    test('rejects a transfer to the same account', async () => {
        const res = await agent
            .post('/api/records')
            .set(auth())
            .send({ type: 'transfer', amount: 10, fromAccountId: bank.id, toAccountId: bank.id });
        expect(res.status).toBe(400);
    });

    test('editing a record reconciles balances', async () => {
        // Create an expense of 100 from cash (cash: 200 -> 100).
        const created = await agent
            .post('/api/records')
            .set(auth())
            .send({ type: 'expense', amount: 100, fromAccountId: cash.id, categoryId: foodCat.id });
        expect(parseFloat((await agent.get(`/api/accounts/${cash.id}`).set(auth())).body.amount)).toBe(100);

        // Change it to 40 (cash should become 160).
        const updated = await agent
            .patch(`/api/records/${created.body.id}`)
            .set(auth())
            .send({ type: 'expense', amount: 40, fromAccountId: cash.id, categoryId: foodCat.id });
        expect(updated.status).toBe(200);
        expect(parseFloat((await agent.get(`/api/accounts/${cash.id}`).set(auth())).body.amount)).toBe(160);
    });

    test('deleting a record reverts its effect', async () => {
        const created = await agent
            .post('/api/records')
            .set(auth())
            .send({ type: 'expense', amount: 60, fromAccountId: cash.id, categoryId: foodCat.id });
        expect(parseFloat((await agent.get(`/api/accounts/${cash.id}`).set(auth())).body.amount)).toBe(100);

        const del = await agent.delete(`/api/records/${created.body.id}`).set(auth());
        expect(del.status).toBe(200);
        expect(parseFloat((await agent.get(`/api/accounts/${cash.id}`).set(auth())).body.amount)).toBe(160);
    });

    test('records list supports filtering and pagination', async () => {
        const res = await agent.get('/api/records?type=expense&limit=2&page=1').set(auth());
        expect(res.status).toBe(200);
        expect(res.body.data.every((r) => r.type === 'expense')).toBe(true);
        expect(res.body.pagination.limit).toBe(2);
        expect(res.body.data.length).toBeLessThanOrEqual(2);
    });

    test('analytics summary reports net worth and totals', async () => {
        const res = await agent.get('/api/analytics/summary').set(auth());
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('netWorth');
        expect(res.body.income).toBeGreaterThan(0);
        expect(res.body.expense).toBeGreaterThan(0);
    });

    test('by-category analytics returns expense breakdown', async () => {
        const res = await agent.get('/api/analytics/by-category?type=expense').set(auth());
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('percentage');
    });

    test('budgets track spending progress', async () => {
        const res = await agent
            .post('/api/budgets')
            .set(auth())
            .send({ categoryId: foodCat.id, limit: 100 });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('spent');
        expect(res.body).toHaveProperty('percentUsed');
        expect(res.body.overBudget).toBe(true); // spent 190.5 > 100
    });

    test('budgets cannot be set on income categories', async () => {
        const res = await agent
            .post('/api/budgets')
            .set(auth())
            .send({ categoryId: salaryCat.id, limit: 100 });
        expect(res.status).toBe(400);
    });

    test('users cannot see each other data', async () => {
        const other = await agent.post('/api/auth/register').send({
            name: 'Mallory',
            email: 'mallory@example.com',
            password: 'supersecret',
        });
        const otherToken = other.body.token;

        // Mallory tries to read Ron's bank account.
        const res = await agent.get(`/api/accounts/${bank.id}`).set({ Authorization: `Bearer ${otherToken}` });
        expect(res.status).toBe(404);
    });

    test('login returns a working token', async () => {
        const res = await agent.post('/api/auth/login').send({ email: 'ron@example.com', password: 'supersecret' });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeTruthy();

        const me = await agent.get('/api/auth/me').set({ Authorization: `Bearer ${res.body.token}` });
        expect(me.body.user.email).toBe('ron@example.com');
        expect(me.body.user).not.toHaveProperty('passwordHash');
    });

    test('deleting an account cascades and reconciles transfers', async () => {
        // cash currently 160, bank 649.5. Delete cash: the earlier transfer
        // (bank -> cash 200) is reversed, restoring 200 to bank => 849.5.
        const del = await agent.delete(`/api/accounts/${cash.id}`).set(auth());
        expect(del.status).toBe(200);

        const bankAcc = await agent.get(`/api/accounts/${bank.id}`).set(auth());
        expect(parseFloat(bankAcc.body.amount)).toBe(849.5);
    });
});
