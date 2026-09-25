# Personal Expense Tracker — Web

A beautiful, responsive web client for the
**[Personal Expense Tracker API](https://github.com/ron-harifiyati/personal-expense-tracker-api)**.
Built with React, TypeScript, Vite, Tailwind CSS and Recharts.

> This replaces the original SwiftUI iOS shell with a full web app that
> actually talks to the API.

---

## Features

- 🔐 **Auth** — register / login against your own API (JWT).
- 📊 **Dashboard** — net worth, monthly income/expenses, savings rate, a 6-month
  income-vs-expense trend, spend-by-category donut, recent activity and budget progress.
- 💳 **Accounts** — colourful cards with live balances; create / edit / delete.
- 🏷️ **Categories** — income & expense categories with icon + colour pickers.
- 📒 **Transactions** — add income / expense / transfer, with filtering (type,
  account, category, date range), note search and pagination.
- 🎯 **Budgets** — per-category limits with live progress bars.
- 🌗 **Light & dark mode**, fully responsive (mobile drawer + desktop sidebar).
- 🔌 **Runtime-configurable API URL** — the same static build can point at any
  backend via the login screen's *Connection settings* (no rebuild needed).

---

## Getting started

```bash
npm install
cp .env.example .env          # set VITE_API_URL to your API (optional)
npm run dev                   # http://localhost:5173
```

Make sure the API is running (default `http://localhost:3000`). You can also set
the API URL at runtime from the login screen → **Connection settings**.

Build for production:

```bash
npm run build && npm run preview
```

---

## Configuration

| Variable       | Purpose                                                        |
| -------------- | ------------------------------------------------------------- |
| `VITE_API_URL` | Base URL of the API (no trailing `/api`). Optional.            |
| `BASE_PATH`    | Sub-path for deployment (e.g. `/repo-name/` for GitHub Pages). |

---

## Deployment (free)

### GitHub Pages
A workflow at `.github/workflows/deploy.yml` builds and publishes to Pages on
every push to `main`.

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
3. (Optional) **Settings → Secrets and variables → Actions → Variables**: add
   `VITE_API_URL` pointing at your deployed API — or just set it later on the
   login screen.

The site is served at `https://<user>.github.io/<repo>/`.

### Netlify / Vercel / Cloudflare Pages
Build command `npm run build`, output directory `dist`. Set `VITE_API_URL` as an
environment variable (leave `BASE_PATH` unset for root hosting).

---

## Tech

React 18 · TypeScript · Vite 6 · Tailwind CSS 3 · React Router · Recharts ·
Axios · lucide-react · react-hot-toast.

## License

ISC © Ron Harifiyati
