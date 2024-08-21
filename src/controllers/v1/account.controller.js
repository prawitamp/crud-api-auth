const AccountModel = require("../../models/v1/account.model");
const err_constant = require("../../lib/constant/error_status");

const { ERROR_STATUS } = err_constant;

class AccountController {
  async getAllAccount(req, res) {
    try {
      const result = await AccountModel.getAllAccount();

      return res.status(200).json({
        status: "success",
        message: "Accounts found",
        data: { total: result.count, accounts: result.results },
      });
    } catch (error) {
      console.log('error getAllAcounts :>> ', error.message);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async getAccountById(req, res) {
    try {
      const account_id = req.params.id;
      const result = await AccountModel.getAccountById(account_id);

      if(result.status === ERROR_STATUS.NOT_FOUND){
        return res.status(404).json({
          message: result.message,
        });
      }
      if(result.status === ERROR_STATUS.INTERNAL_ERROR){
        return res.status(500).json({
          message: result.message,
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Account Found",
        data: result,
      });
    } catch (error) {
      console.log('error getAccountById :>> ', error.message);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async createAccount(req, res) {
    try {
      const {
        user_id, bank_name, bank_account_number, balance
      } = req.body;

      const result = await AccountModel.createAccount(
        user_id, bank_name, bank_account_number, balance, req.user
      );

      if(result.status === ERROR_STATUS.BAD_REQUEST){
        return res.status(400).json({
          message: result.message,
        });
      }
      if(result.status === ERROR_STATUS.FORBIDDEN){
        return res.status(403).json({
          message: result.message,
        });
      }
      if(result.status === ERROR_STATUS.NOT_FOUND){
        return res.status(404).json({
          message: result.message,
        });
      }
      if(result.status === ERROR_STATUS.INTERNAL_ERROR){
        return res.status(500).json({
          message: result.message,
        });
      }

      return res.status(201).json({
        status: "success",
        message: "Account created",
        data: result,
      });
    } catch (error) {
      console.log('error createAccount :>> ', error.message);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async deleteAccountById(req, res) {
    try {
      const account_id = req.params.id;
      const result = await AccountModel.deleteAccountById(account_id, req.user);

      if(result.status === ERROR_STATUS.BAD_REQUEST){
        return res.status(400).json({
          message: result.message,
        });
      }
      if(result.status === ERROR_STATUS.NOT_FOUND){
        return res.status(404).json({
          message: result.message,
        });
      }
      if(result.status === ERROR_STATUS.INTERNAL_ERROR){
        return res.status(500).json({
          message: result.message,
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Account deleted",
        data: result,
      });
    } catch (error) {
      console.log('error deleteAccount :>> ', error.message);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async updateAccountById(req, res) {
    try {
      const account_id = req.params.id;
      const {
        bank_name, bank_account_number, balance
      } = req.body;

      const result = await AccountModel.updateAccountById(
        account_id,
        req.body,
        req.user,
      );

      if(result.status === ERROR_STATUS.BAD_REQUEST){
        return res.status(400).json({
          message: result.message,
        });
      }
      if(result.status === ERROR_STATUS.NOT_FOUND){
        return res.status(404).json({
          message: result.message,
        });
      }
      if(result.status === ERROR_STATUS.INTERNAL_ERROR){
        return res.status(500).json({
          message: result.message,
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Account updated",
        data: result,
      });
    } catch (error) {
      console.log('error updateAccount :>> ', error.message);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }
}

module.exports = new AccountController();
