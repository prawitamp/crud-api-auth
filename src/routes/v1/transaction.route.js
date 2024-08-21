const { Router } = require("express");
const TransactionController = require("../../controllers/v1/transaction.controller");
const token_verify = require("../../middlewares/auth");
const router = Router();

// GET Transactions by Id
router.get("/:id", TransactionController.getTransactionById);

// GET all Transactions
router.get("/", TransactionController.getAllTransaction);

// POST Transactions
router.post("/", token_verify, TransactionController.createTransaction);

// DELETE Transactions by Id
// router.delete("/:id", TransactionController.deleteTransactionById);

// UPDATE Transactions by Id
// router.put("/:id", TransactionController.updateTransactionById);

module.exports = router;
