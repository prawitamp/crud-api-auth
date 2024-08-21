const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// const prisma = require("../../../config/prisma");
const err_constant = require("../../lib/constant/error_status");

const { ERROR_STATUS } = err_constant;

class AccountModel {
  async getAllAccount() {
    try {
      const results = await prisma.bank_Accounts.findMany({
        include: {
          sentTransactions: true,
          receivedTransactions: true,
        },
      });
      const count = await prisma.bank_Accounts.count();

      return { count, results };
    } catch (error) {
      console.log(error.message);
      return { status: ERROR_STATUS.INTERNAL_ERROR, message: error.message };
    }
  }

  async getAccountById(account_id) {
    try {
      const accountExist = await prisma.bank_Accounts.findUnique({
        where: {
          id: account_id,
        },
      });

      if (!accountExist) {
        return { status: ERROR_STATUS.NOT_FOUND, message: "Account not found" };
      }

      const account = await prisma.bank_Accounts.findUnique({
        where: {
          id: account_id,
        },
        include: {
          sentTransactions: true,
          receivedTransactions: true,
        },
      });
      return account;
    } catch (error) {
      console.log(error.message);
      return { status: ERROR_STATUS.INTERNAL_ERROR, message: error.message };
    }
  }

  async createAccount(user_id, bank_name, bank_account_number, balance, token) {
    try {
      if (!user_id || !bank_name || !bank_account_number || !balance) {
        return { status: ERROR_STATUS.BAD_REQUEST, message: "Please fill all fields" };
      }

      const acc_numbExist = await prisma.bank_Accounts.findFirst({
        where: {
          bank_account_number: bank_account_number
        },
      });

      const userExist = await prisma.users.findUnique({
        where: { id: user_id },
      });

      if (!userExist) {
        return { status: ERROR_STATUS.NOT_FOUND, message: "User not found" };
      }
      if (acc_numbExist) {
        return { status: ERROR_STATUS.BAD_REQUEST, message: "Account number already exists" };
      }
      if(userExist.id !== token.user_id) {
        return { status: ERROR_STATUS.FORBIDDEN, message: "You are not authorized to create account" }
      }

      const result = await prisma.bank_Accounts.create({
        data: {
          user_id,
          bank_name,
          bank_account_number,
          balance,
        },
      });

      return result;
    } catch (error) {
      console.log(error.message);
      return { status: ERROR_STATUS.INTERNAL_ERROR, message: error.message };
    }
  }

  async deleteAccountById(account_id, token) {
    try {
      const accountExist = await prisma.bank_Accounts.findUnique({
        where: {
          id: account_id,
        },
      });
      if (!accountExist) {
        return { status: ERROR_STATUS.NOT_FOUND, message: "Account not found" };
      }
      
      const account_user = accountExist.user_id;

      const user = await prisma.users.findUnique({
        where: { id: account_user },
      });

      if(user.id !== token.user_id) {
        return { status: ERROR_STATUS.FORBIDDEN, message: "You are not authorized to delete account" }
      }

      const result = await prisma.bank_Accounts.delete({
        where: {
          id: account_id,
        },
      });

      return result;
    } catch (error) {
      console.log(error);
      return { status: ERROR_STATUS.INTERNAL_ERROR, message: error.message };
    }
  }

  async updateAccountById(account_id, data, token ) {
    try {
      const accountExist = await prisma.bank_Accounts.findUnique({
        where: {
          id: account_id,
        },
      });
      const acc_numbExist = await prisma.bank_Accounts.findFirst({
        where: {
          bank_account_number: data.bank_account_number,
          id: {
            not: account_id,
          },
        },
      });

      if (!accountExist) {
        return { status: ERROR_STATUS.NOT_FOUND, message: "Account not found" };
      }

      const account_user = accountExist.user_id

      const user = await prisma.users.findUnique({
        where: { id: account_user },
      });

      if (acc_numbExist) {
        return { status: ERROR_STATUS.BAD_REQUEST, message: "Account Number already exist"}
      }
      if(user.id !== token.user_id) {
        return { status: ERROR_STATUS.FORBIDDEN, message: "You are not authorized to update" }
      }

      const result = await prisma.bank_Accounts.update({
        where: {
          id: account_id,
        },
        data: data,
      });

      return result;
    } catch (error) {
      console.log(error.message);
      return { status: ERROR_STATUS.INTERNAL_ERROR, message: error.message };
    }
  }
}

module.exports = new AccountModel();
