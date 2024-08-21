const UserModel = require("../../models/v1/user.model");
const err_constant = require("../../lib/constant/error_status");

const { ERROR_STATUS } = err_constant;

class UserController {
  async getAllUser(req, res) {
    try {
      const result = await UserModel.getAllUser();

      return res.status(200).json({
        status: "success",
        message: "Users found",
        data: { total: result.count, users: result.results },
      });
    } catch (error) {
      console.log('error getAllUser :>> ', error.message);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async getUserById(req, res) {
    try {
      const user_id = req.params.id;
      const result = await UserModel.getUserById(user_id);

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
        message: "User Found",
        data: result,
      });
    } catch (error) {
      console.log('error getUserById :>> ', error.message);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async userRegister(req, res) {
    try {
      const { name, email, password } = req.body;
      const result = await UserModel.userRegister(req.body);
    
      if(result.status === ERROR_STATUS.BAD_REQUEST){
        return res.status(400).json({
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
        message: "User created",
        data: result,
      });
    } catch (error) {
      console.log('error userRegister :>> ', error.message);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async deleteUserById(req, res) {
    try {
      const user_id = req.params.id;
      const result = await UserModel.deleteUserById(user_id, req.user);

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

      return res.status(200).json({
        status: "success",
        message: "User deleted",
        data: result,
      });
    } catch (error) {
      console.log('error deleteUserById :>> ', error.message);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async updateUserById(req, res) {
    try {
      const user_id = req.params.id;
      const result = await UserModel.updateUserById(user_id, req.user, req.body);

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

      return res.status(200).json({
        status: "success",
        message: "User updated",
        data: result,
      });
    } catch (error) {
      console.log('error updateUserById :>> ', error.message);
      return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
        error: error.message,
      })
    }
  }

  async userLogin(req,res) {
    const { email, password } = req.body;
    try {
      const result = await UserModel.userLogin(req.body);

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
        message: "Login success",
        data: result,
      });
    } catch (error) {
        console.log('error userLogin :>> ', error.message);
        return res.status(500).json({
          status: "error",
          message: "Internal Server Error",
          error: error.message,
      })
    }
  }
}

module.exports = new UserController();
