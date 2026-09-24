# Personal Expense Tracker API

A secure, multi-user REST API for tracking personal finances — accounts,
categories, transactions, budgets and analytics. Built with Node.js, Express
and Sequelize (SQLite).

> **v2** rebuilt the project around real users and authentication, fixed the
> balance-reconciliation bugs from v1, and added budgets, analytics, filtering
> and a full test suite. See the companion web client:
> **[personal-expense-tracker-web](https://github.com/ron-harifiyati/personal-expense-tracker-web)**.

---

## Features

- 🔐 **JWT authentication** — register / login, bcrypt-hashed passwords, every
  resource scoped to its owner.
- 💳 **Accounts** — Cash, Bank, Mobile Money, etc. with live balances.
- 🏷️ **Categories** — income & expense categories (sensible defaults seeded per user).
- 📒 **Records** — income, expense and transfer entries that update balances
  **atomically** (wrapped in DB transactions) and reconcile correctly on edit/delete.
- 🎯 **Budgets** — per-category limits with live "spent / remaining / % used".
- 📊 **Analytics** — net-worth summary, spend-by-category breakdown, and a
  monthly income/expense trend.
- 🔎 **Filtering & pagination** on the records list (type, account, category,
  date range, note search, sort).
- 🛡️ **Hardening** — Helmet, CORS, rate limiting, input validation and a
  central error handler.
- ✅ **Tested** — 20 end-to-end tests covering the money maths and access control.

---

## Getting started

```bash
npm install
cp .env.example .env      # then set a strong JWT_SECRET
npm run dev               # http://localhost:3000
```

Run the tests:

```bash
npm test
```

> If you cloned with a prebuilt `node_modules`, run `npm rebuild sqlite3` once so
> the native binding matches your platform.

---

## Configuration

| Variable           | Default                | Notes                                        |
| ------------------ | ---------------------- | -------------------------------------------- |
| `NODE_ENV`         | `development`          | `production` requires a real `JWT_SECRET`.   |
| `PORT`             | `3000`                 | HTTP port.                                    |
| `DATABASE_STORAGE` | `./database.sqlite`    | SQLite file path.                             |
| `JWT_SECRET`       | dev placeholder        | **Set a long random value in production.**    |
| `JWT_EXPIRES_IN`   | `7d`                   | Token lifetime.                               |
| `CORS_ORIGIN`      | `*`                    | Comma-separated origins, or `*`.              |
| `BCRYPT_ROUNDS`    | `10`                   | Password hashing cost.                        |

---

## API reference

All routes are available both at the root (`/accounts`) and under `/api`
(`/api/accounts`). Send `Authorization: Bearer <token>` on every protected route.

### Auth
| Method | Path             | Body                                  | Description            |
| ------ | ---------------- | ------------------------------------- | ---------------------- |
| POST   | `/auth/register` | `name, email, password, currency?`    | Create account + token |
| POST   | `/auth/login`    | `email, password`                     | Get a token            |
| GET    | `/auth/me`       | —                                     | Current user           |
| PATCH  | `/auth/me`       | `name?, currency?, password?`         | Update profile         |

### Accounts
`GET /accounts` · `GET /accounts/:id` · `POST /accounts` · `PATCH /accounts/:id` · `DELETE /accounts/:id`

```json
{ "title": "Bank", "amount": 150, "icon": "bank", "color": "#6366f1" }
```
Deleting an account removes its records and reverses their balance effects on
any other accounts involved.

### Categories
`GET /categories?type=income|expense` · `GET /categories/:id` · `POST /categories` · `PATCH /categories/:id` · `DELETE /categories/:id`

```json
{ "title": "Food & Drink", "type": "expense", "icon": "utensils", "color": "#f97316" }
```

### Records
`GET /records` · `GET /records/:id` · `POST /records` · `PATCH /records/:id` · `DELETE /records/:id`

List query params: `type`, `accountId`, `categoryId`, `from`, `to`, `search`,
`page`, `limit`, `sort` (e.g. `date:desc`). Returns `{ data, pagination }`.

```jsonc
// expense: money leaves fromAccountId
{ "type": "expense", "amount": 50, "fromAccountId": "…", "categoryId": "…", "notes": "Lunch" }
// income: money enters toAccountId
{ "type": "income",  "amount": 2500, "toAccountId": "…", "categoryId": "…" }
// transfer: fromAccountId -> toAccountId (no category)
{ "type": "transfer", "amount": 200, "fromAccountId": "…", "toAccountId": "…" }
```

### Budgets
`GET /budgets` · `POST /budgets` · `PATCH /budgets/:id` · `DELETE /budgets/:id`

```json
{ "categoryId": "…", "limit": 400, "period": "monthly" }
```
Responses include live `spent`, `remaining`, `percentUsed`, `overBudget`.

### Analytics
| Path                                   | Description                                   |
| -------------------------------------- | --------------------------------------------- |
| `GET /analytics/summary?from&to`       | Net worth, income, expense, net, savings rate |
| `GET /analytics/by-category?type&from&to` | Totals grouped by category with percentages |
| `GET /analytics/trend?months=6`        | Monthly income/expense trend                  |

### Health
`GET /health` → `{ "status": "ok" }`

---

## Architecture

```
src/
├── config/        env config + Sequelize instance
├── models/        User, Account, Category, Record, Budget + associations
├── middleware/    auth (JWT), validation, error handling
├── services/      TransactionService (atomic balance maths), Analytics, seed
├── controllers/   request/response handlers
└── routes/        route definitions + validators
server.js          entry point (sync + listen)
tests/             Jest + Supertest end-to-end suite
```

Money is stored as `DECIMAL(12,2)`; all arithmetic goes through
`src/utils/money.js` so balances never accumulate floating-point drift, and
every create/update/delete runs inside a database transaction.

---

## Deployment

A `render.yaml` blueprint and a `Dockerfile` are included. On [Render](https://render.com)
(free tier): **New → Blueprint**, point it at this repo, and set a strong
`JWT_SECRET`. Any Node host works — run `npm start` with the env vars above.

---

## License

ISC © Ron Harifiyati
