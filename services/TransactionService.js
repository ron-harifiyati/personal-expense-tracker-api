const Account = require('../models/Account');
const Category = require('../models/Category');
const Record = require('../models/Record');

// Convents string amount into a number
const parseAmount = (amountString) => {
    const amount = parseFloat(amountString);
    if (isNaN(amount) || amount <= 0) {
        throw new Error(`Invalid amount provided. Must be greater than 0`)
    };
    return amount
};

// Class that creates a record
class TransactionService {
    // Create an expense record
    static async createExpense({ id, fromAccount, category, amountString, notes = "" }) {
        try {
            const amount = parseAmount(amountString);
            await fromAccount.spend(amount);

            const record = await Record.create({
                id,
                type: 'expense',
                amount,
                notes,
                accountId: fromAccount.id,
                categoryId: category.id
            });

            return { message: 'Expense recorded and account updated' }
        } catch (error) {
            return { message: "An unexpected sever error occured" }
        }
    };

    // Create an income record
    static async createIncome({ id, toAccount, category, amountString, notes = "" }) {
        try {
            const amount = parseAmount(amountString);
            await toAccount.receive(amount);

            const record = await Record.create({
                id,
                type: 'income',
                amount,
                notes,
                toAccountId: toAccount.id,
                categoryId: category.id
            });

            return { success: true, message: 'Income recorded and account updated' }
        } catch (error) {
            console.log(error)
            return { message: "An unexpected sever error occured" }
        }
    };

    // Create an transfer record
    static async createTransfer({ id, fromAccount, toAccount, amountString, notes = "" }) {
        try {
            if (fromAccount.id === toAccount.id) {
                throw new Error(`Cannot transfer to the same account`)
            };

            const amount = parseAmount(amountString);
            await fromAccount.transfer(amount, toAccount);

            const record = await Record.create({
                id,
                type: 'transfer',
                amount,
                notes,
                accountId: fromAccount.id,
                toAccountId: toAccount.id
            });

            return { message: 'Transfer recorded and accounts updated', }
        } catch (error) {
            return { message: "An unexpected sever error occured" }
        }
    }

    // Revert the changes that were made by the record
    static async reverseTransaction(id) {

        const record = await Record.findByPk(id);
        if (!record) return { status: 404, error: 'Record not found' };

        try {
            const oldFromAccount = await Account.findOne({ where: { id: record.accountId } });
            const oldToAccount = await Account.findOne({ where: { id: record.toAccountId } });

            switch (record.type.toLowerCase()) {
                case 'income':
                    oldToAccount.amount = (parseFloat(oldToAccount.amount) - record.amount).toFixed(2);
                    await oldToAccount.save();
                    break;

                case 'expense':
                    oldFromAccount.amount = (parseFloat(oldFromAccount.amount) + record.amount).toFixed(2);
                    await oldFromAccount.save();
                    break;

                case 'transfer':
                    oldToAccount.amount = (parseFloat(oldToAccount.amount) - record.amount).toFixed(2);
                    oldFromAccount.amount = (parseFloat(oldFromAccount.amount) + record.amount).toFixed(2);

                    await Promise.all([oldFromAccount.save(), oldToAccount.save()])
                    break;

                default: 'default'
                    return { message: 'Invalid transaction type' }
            };
            await record.destroy();
            return { message: "Deleted old record" }

        } catch (error) {
            return { message: "An unexpected sever error occured" }
        }
    }
}

module.exports = TransactionService;