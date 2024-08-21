const transactionModel = require("../../models/v1/transaction.model");
const err_constant = require("../../lib/constant/error_status");

const { ERROR_STATUS } = err_constant;

class TransactionController {
  async getAllTransaction(req, res) {
    try {
      const result = await transactionModel.getAllTransaction();

      return res.status(200).json({
        status: "success",
        message: "Transactions found",
        data: { total: result.count, transactions: result.results },
      });
    } catch (error) {
      console.log('error getAllTransaction :>> ', error.message);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async getTransactionById(req, res) {
    try {
      const transaction_id = req.params.id;
      const result = await transactionModel.getTransactionById(transaction_id);

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
        message: "Transaction Found",
        data: result,
      });
    } catch (error) {
      console.log('error getTransactionById :>> ', error.message);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async createTransaction(req, res) {
    try {
      const { source_account_id, destination_account_id, amount, notes } =
        req.body;

      const result = await transactionModel.createTransaction(req.body, req.user);

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
        message: "Transaction created",
        data: result,
      });
    } catch (error) {
      console.log('error createTransaction :>> ', error.message);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  // async deleteTransactionById(req, res) {
  //   try {
  //     const transaction_id = req.params.id;
  //     const result = await transactionModel.deleteTransactionById(
  //       transaction_id,
  //       req.user
  //     );

  //     if(result.status === ERROR_STATUS.NOT_FOUND){
  //       res.status(404).json({
  //         message: result.message,
  //       });
  //     }
  //     if(result.status === ERROR_STATUS.INTERNAL_ERROR){
  //       res.status(500).json({
  //         message: result.message,
  //       });
  //     }

  //     res.status(200).json({
  //       status: "success",
  //       message: "Transaction deleted",
  //       data: result,
  //     });
  //   } catch (error) {
  //     console.log('error deleteTransaction :>> ', error.message);
  //   }
  // }

  // async updateTransactionById(req, res) {
  //   try {
  //     const transaction_id = req.params.id;
  //     const result = await transactionModel.updateTransactionById(
  //       transaction_id,
  //       req.body,
  //       req.user
  //     );

  //     if(result.status === ERROR_STATUS.BAD_REQUEST){
  //       res.status(400).json({
  //         message: result.message,
  //       });
  //     }
  //     if(result.status === ERROR_STATUS.FORBIDDEN){
  //       res.status(403).json({
  //         message: result.message,
  //       });
  //     }
  //     if(result.status === ERROR_STATUS.NOT_FOUND){
  //       res.status(404).json({
  //         message: result.message,
  //       });
  //     }
  //     if(result.status === ERROR_STATUS.INTERNAL_ERROR){
  //       res.status(500).json({
  //         message: result.message,
  //       });
  //     }

  //     res.status(200).json({
  //       status: "success",
  //       message: "Transaction updated",
  //       data: result,
  //     });
  //   } catch (error) {
  //     console.log('error updateTransaction :>> ', error.message);
  //   }
  // }
}

module.exports = new TransactionController();
