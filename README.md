# Personal Expense Tracker

---

## About the project

A streamlined digital platform designed for personal financial clarity. This app allows users to track daily expenses, manage multiple account balances (cash, bank, mobile money), set budgets, and visualize spending habits to achieve financial independence.

---

### Project Goal

To eliminate the "where did my money go?" mystery. The goal is to replace manual spreadsheets and crumpled receipts with a structured, mobile-first application that provides real-time insights into net worth, spending categories, and debt management.

---

### Project Scope

- **Multi-Account Tracking:** Manage separate balances for Cash, Bank, and Mobile Money (EcoCash, InnBucks, etc.).

- **Automated Ledger:** Categorize transactions as Income, Expense, or Internal Transfers.

- **Dynamic Net Worth:** Real-time calculation of total assets minus outstanding liabilities.

- **Transaction History:** A searchable, digital audit trail of every cent spent or earned.

- **Recurring Expenses:** Tracking for fixed costs like rent, subscriptions, and utilities.

- **Visual Reporting:** Simple dashboards to view spending distribution across categories.

---

### Architecture

- **Frontend:** Built with SwiftUI (iOS) for a smooth, mobile-first user experience.
  
- **Backend:** A Node.js/Express server handling the business logic of "rounds" and interest.
  
- **Database:** Sqlite for relational data (accounts, categories, records).

![Architecture Diagram](/Assets/Architecture.png)

---

### How to run

Install packages: 
- run `npm install`

Run program:
- run `node app.js`

---

### How it works

1. **Account Setup:** The user creates virtual "Accounts" (e.g., "Wallet," "Savings," "Work Phone") and sets their initial opening balances.

2. **Logging Transactions:** As expenses occur, the user logs them, choosing the source account and the category (e.g., Food, Transport).

3. **Income & Transfers:** Users can record salary/freelance income or move money between their own accounts (Transfers) without affecting their total net worth.

4. **Reconciliation:** The app automatically updates account balances in real-time. If a transaction is deleted or "undone," the system reverts the account balance to its previous state.

5. **Budget Monitoring:** Users can review their total "In Hand" cash versus what they owe to ensure they stay within their financial limits.

---

### Endpoints

The Personal Expense Tracker API is a RESTful service that returns JSON.


GET /accounts - Fetches all accounts (Cash, Bank, etc.) for the user.

POST /accounts - Creates a new account with a starting balance.

DELETE /accounts/:id - Removes an account and its history.

2. **Account Management**  
   
    - `GET /accounts` Fetches all accounts
  
    - `POST /accounts` Creates a new account

       // Request Body

       ```
       {
        "title": "Bank",
        "amount": 150,
        "imageTitle": "money.png"
       }
       ```

    - `PATCH /accounts/:id` Edits information about an existant account.

       // Request Body

       ```
       {
        "title": "Cash",
        "amount": 100,
        "imageTitle": "money.png"
       }
       ```

    - `DELETE /accounts/:id` Deletes an existing club and any records associated with it.
  

3. **Categories Management**  
   
   - `GET /categories` Fetches all categories.
  

    - `POST /categories` Creates a new category

       // Request Body

       ```
       {
       "title": "Food",
        "type": "expense",
        "imageTitle": "bank.png"
       }
       ```

    - `PATCH /categories/:id` Makes a transaction for a member.

       // Request Body

       ```
       {
        "title": "Salary",
        "type": "income",
        "imageTitle": "bank.png"
        }
       ```

    - `DELETE /categories/:id` Deletes the category and any records associated with it.

---


3. **Records Management**  
   
   - `GET /records` Fetches all records.
  

    - `POST /records` Creates a new record, from exsting accounts and/or categories

       // Request Body

       ```
       {
        "type": "expense",
        "amountString": "50",
        "fromAccountId": "d420f4db-5a7e-4442-ba4b-a9df2682dc7e",
        "categoryId": "0605e971-7d84-42e1-a3ba-c73f9fe8da03",
        "notes": "Trial"
       }
       ```

    - `PATCH /records/:id` Edits the details of a record.

       // Request Body

       ```
       {
        "type": "income",
        "amountString": "20",
        "toAccountId": "c8b76ca2-bbb9-41c0-8a08-68d4574a2c43",
        "categoryId": "384b9a31-e456-43fc-bdf0-27d87d2d32d4",
        "notes": "Trial"
        }
       ```

    - `DELETE /records/:id` Deletes the record.

---
