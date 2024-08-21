const { Router } = require("express");
const AccountController = require("../../controllers/v1/account.controller");
const token_verify = require("../../middlewares/auth");
const router = Router();

// GET Accounts by id
router.get("/:id", AccountController.getAccountById);

// GET all Accounts
router.get("/", AccountController.getAllAccount);

// POST Accounts
router.post("/", token_verify, AccountController.createAccount);

// DELETE Accounts by id
router.delete("/:id", token_verify, AccountController.deleteAccountById);

// UPDATE Users by id
router.put("/:id", token_verify, AccountController.updateAccountById);

module.exports = router;
