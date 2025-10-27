const Account = require('../models/Account');
const Category = require('../models/Category');
const Record = require('../models/Record');

const parseAmount = (amountString) => {
    const amount = parseFloat(amountString);
    if (isNaN(amount) || amount <= 0) {
        throw new Error(`Invalid amount provided. Must be greater than 0`)
    };
    return amount
};

class TransactionService {
    static async createExpense({ fromAccount, category, amountString, notes = "" }) {
        try {
            const amount = parseAmount(amountString);
            await fromAccount.spend(amount);

            const record = Record.create({
                type: 'expense',
                amount,
                notes,
                accountId: fromAccount.id,
                categoryId: category.id
            });

            return { success: true, message: 'Expense recorded and account updated', record }
        } catch (error) {
            return { success: false, error: error.message }
        }
    };

    static async createIncome({ category, toAccount, amountString, notes = ""}) {
        try {
            const amount = parseAmount(amountString);
            await toAccount.receive(amount);

            const record = Record.create({
                type: 'income',
                amount,
                notes,
                toAccountId: toAccount.id,
                categoryId: category.id
            });

            return { success: true, message: 'Income recorded and account updated', record}
        } catch (error) {
            return { success: false, error: error.message }
        }
    };

    static async createTransfer({ fromAccount, toAccount, amountString, notes = "" }) {
        try {
            if (fromAccount.id === toAccount.id) {
                throw new Error(`Cannot transfer to the same account`)
            };

            const amount = parseAmount(amountString);
            await fromAccount.transfer(amount, toAccount);

            const record = Record.create({
                type: 'transfer',
                amount,
                notes,
                accountId: fromAccount.id,
                toAccountId: toAccount.id
            });

            return {success: true, message: 'Transfer recorded and accounts updated', record}
        } catch (error) {
            return { success: false, error: error.message }
        }
    }
}

module.exports = TransactionService;