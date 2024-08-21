const { TransactionType } = require("@prisma/client");
const prisma = require("../../../config/prisma");
const err_constant = require("../../lib/constant/error_status");

const { ERROR_STATUS } = err_constant;

class TransactionModel {
  async getAllTransaction() {
    try {
      const results = await prisma.transactions.findMany({});

      const count = await prisma.transactions.count();
      return { count, results };
    } catch (error) {
      console.log(error.message);
      return { status: ERROR_STATUS.INTERNAL_ERROR, message: error.message };
    }
  }

  async getTransactionById(transaction_id) {
    try {
      const transactionExist = await prisma.transactions.findUnique({
        where: {
          id: transaction_id,
        },
      });

      if (!transactionExist) {
        return { status: ERROR_STATUS.NOT_FOUND, message: "Transaction not found" };
      }

      const result = await prisma.transactions.findUnique({
        where: {
          id: transaction_id,
        },
      });

      return result;
    } catch (error) {
      console.log(error.message);
      return { status: ERROR_STATUS.INTERNAL_ERROR, message: error.message };
    }
  }

  async createTransaction(data, token) {
    try {
      const sourceAccountExist = await prisma.bank_Accounts.findUnique({
        where: { id: data.source_account_id },
      });
      const destinationAccountExist = await prisma.bank_Accounts.findUnique({
        where: { id: data.destination_account_id },
      });
      const user = await prisma.users.findUnique({
        where: {
          id: sourceAccountExist.user_id,
        }
      })

      if (!data) {
        return { status: ERROR_STATUS.BAD_REQUEST, message: "Transaction is required"}
      }
      if ((data.source_account_id && data.destination_account_id) === "") {
        return { status: ERROR_STATUS.BAD_REQUEST, message: "Source and Destination account is required" }
      }
      if (!sourceAccountExist) {
        return { status: ERROR_STATUS.NOT_FOUND, message: "Source account not found" };
      }
      if (!destinationAccountExist) {
        return { status: ERROR_STATUS.NOT_FOUND, message: "Destination account not found" };
      }
      if (data.source_account_id === data.destination_account_id) {
        return { status: ERROR_STATUS.BAD_REQUEST, message: "Can't transaction with same account" };
      }
      if (sourceAccountExist.balance < data.amount) {
        return { status: ERROR_STATUS.FORBIDDEN, message: "Insufficient balance" };
      }
      if(user.id !== token.user_id) {
        return { status: ERROR_STATUS.FORBIDDEN, message: "You are not authorized to create transaction" }
      }

      const transaction = await prisma.transactions.create({
        data: {
          source_account_id: data.source_account_id,
          destination_account_id: data.destination_account_id,
          amount: data.amount,
          notes: data.notes,
        },
      });

      await prisma.bank_Accounts.update({
        where: {
          id: data.source_account_id,
        },
        data: {
          balance: sourceAccountExist.balance - data.amount,
        },
      });

      await prisma.bank_Accounts.update({
        where: {
          id: data.destination_account_id,
        },
        data: {
          balance: destinationAccountExist.balance + data.amount,
        },
      });

      return transaction;
    } catch (error) {
      console.log(error.message);
      return { status: ERROR_STATUS.INTERNAL_ERROR, message: error.message };
    }
  }

  // async deleteTransactionById(transaction_id,) {
  //   try {
  //     const transactionExist = await prisma.transactions.findUnique({
  //       where: {
  //         id: transaction_id,
  //       },
  //     });

  //     if (!transactionExist) {
  //       return { status: ERROR_STATUS.NOT_FOUND, message: "Transaction not found" };
  //     }

  //     const sourceAccount = await prisma.bank_Accounts.findUnique({
  //       where: { id: transactionExist.source_account_id },
  //     });

  //     const destinationAccount = await prisma.bank_Accounts.findUnique({
  //       where: { id: transactionExist.destination_account_id },
  //     });

  //     await prisma.bank_Accounts.update({
  //       where: {
  //         id: transactionExist.source_account_id,
  //       },
  //       data: {
  //         balance: sourceAccount.balance + transactionExist.amount,
  //       },
  //     });

  //     await prisma.bank_Accounts.update({
  //       where: {
  //         id: transactionExist.destination_account_id,
  //       },
  //       data: {
  //         balance: destinationAccount.balance - transactionExist.amount,
  //       },
  //     });

  //     const result = await prisma.transactions.delete({
  //       where: {
  //         id: transaction_id,
  //       },
  //     });

  //     return result;
  //   } catch (error) {
  //     console.log(error.message);
  //     return { status: ERROR_STATUS.INTERNAL_ERROR, message: error.message };
  //   }
  // }

  // async updateTransactionById(transaction_id, item) {
  //   try {
  //     const transactionExist = await prisma.transactions.findUnique({
  //       where: {
  //         id: transaction_id,
  //       },
  //     });

  //     if (!transactionExist) {
  //       return { status: ERROR_STATUS.NOT_FOUND, message: "Transaction not found" };
  //      }

  //     if (item.notes === undefined || Object.keys(item).length > 1) {
  //       return { status: ERROR_STATUS.BAD_REQUEST, message: "Invalid request" };
  //     }

  //     const result = await prisma.transactions.update({
  //       where: {
  //         id: transaction_id,
  //       },
  //       data: {
  //         notes: item.notes,
  //       },
  //     });

  //     return result;
  //   } catch (error) {
  //     console.log(error.message);
  //     return { status: ERROR_STATUS.INTERNAL_ERROR, message: error.message };
  //   }
  // }
}

module.exports = new TransactionModel();
