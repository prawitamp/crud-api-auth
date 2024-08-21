const { Router } = require("express");
const UserController = require("../../controllers/v1/user.controller");
const router = Router();

router.post("/login", UserController.userLogin);
router.post("/register", UserController.userRegister);

module.exports = router;