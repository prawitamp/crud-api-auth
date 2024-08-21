const { Router } = require("express");
const UserController = require("../../controllers/v1/user.controller");
const token_verify = require("../../middlewares/auth");
const router = Router();


// GET Users by id
router.get("/:id", UserController.getUserById);

// GET all Users
router.get("/", UserController.getAllUser);

// POST Users
// router.post("/", UserController.createUser);

// DELETE Users by id
router.delete("/:id", token_verify, UserController.deleteUserById);

// UPDATE Users by id
router.put("/:id", token_verify, UserController.updateUserById);

module.exports = router;
