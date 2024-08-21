const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const err_constant = require("../../lib/constant/error_status");


const { ERROR_STATUS } = err_constant;
class UserModel {
  async getAllUser() {
    try {
      const results = await prisma.users.findMany({
        include: {
          accounts: true,
          profile: true,
        },
      });
      const count = await prisma.users.count();

      const removePasswordData = results.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      return { count, results: removePasswordData };
    } catch (error) {
      console.log(error.message);
      return { status: ERROR_STATUS.INTERNAL_ERROR, message: error.message };
    }
  }

  async getUserById(user_id) {
    try {
      const userExist = await prisma.users.findUnique({
        where: {
          id: user_id,
        },
      });
      
      if (!userExist) {
        return { status: ERROR_STATUS.NOT_FOUND, message: "User not found" };
      }
      
      const result = await prisma.users.findUnique({
        where: {
          id: user_id,
        },
        include: {
          accounts: true,
          profile: true,
        }
      });

      // Remove password data
      const { password, ...userWithoutPassword } = result;

      return userWithoutPassword ;
    } catch (error) {
      console.log(error.message);
      return { status: ERROR_STATUS.INTERNAL_ERROR, message: error.message };
    }
  }

  async userRegister(data) {
    try {
      const emailExist = await prisma.users.findFirst({
        where: {
          email: data.email,
        },
      });

      const identity_numberExist = await prisma.profiles.findFirst({
        where: {
          identity_number: data.profile.identity_number
        }
      })

      if (!data.name || !data.email || !data.password) {
        return { status: ERROR_STATUS.BAD_REQUEST, message: "Name, email, and password are required",
        };
      }
      if (identity_numberExist) {
        return { status: ERROR_STATUS.BAD_REQUEST, message: "Identity number already exist" };
      }

      if (emailExist) {
        return { status: ERROR_STATUS.BAD_REQUEST, message: "Email already exist" };
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await prisma.users.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          profile: {
            create: {
              identity_type: data.profile.identity_type,
              identity_number: data.profile.identity_number,
              address: data.profile.address,
            },
          },
        },
        include: {
          profile: true,
        },
      });

    } catch (error) {
      console.log(error.message);
      return { status: ERROR_STATUS.INTERNAL_ERROR, message: error.message };
    }
  }

  async deleteUserById(user_id, token) {
    try {
      const userExist = await prisma.users.findUnique({
        where: {
          id: user_id,
        },
      });
      
      if (!userExist) {
        return { status: ERROR_STATUS.NOT_FOUND, message: "User not found" };
      }
      if(userExist.id !== token.user_id) {
        return { status: ERROR_STATUS.FORBIDDEN, message: "You are not authorized to delete user" }
      } 

      await prisma.profiles.deleteMany({
        where: {
          user_id: user_id,
        },
      });

      await prisma.bank_Accounts.deleteMany({
        where: {
          user_id: user_id,
        },
      });

      const result = await prisma.users.delete({
        where: {
          id: user_id,
        },
      });
      return result;
    } catch (error) {
      console.log(error.message);
      return { status: ERROR_STATUS.INTERNAL_ERROR, message: error.message };
    }
  }

  async updateUserById(user_id, token, data) {
    try {
      const userExist = await prisma.users.findUnique({
        where: {
          id: user_id,
        },
      });
      const emailExist = await prisma.users.findFirst({
        where: {
          email: data.email,
          id: {
            not: user_id,
          },
        },
      });
      const identity_numberExist = await prisma.profiles.findFirst({
        where: {
          identity_number: data.profile.identity_number
        }
      })

      if(!data) {
        return { status: ERROR_STATUS.BAD_REQUEST, message: "Please input data" }
      }
      if (!userExist) {
        return { status: ERROR_STATUS.NOT_FOUND, message: "User not Found" }
      }
      if (identity_numberExist) {
        return { status: ERROR_STATUS.BAD_REQUEST, message: "Identity Number already exist" }
      }
      if (emailExist) {
        return { status: ERROR_STATUS.BAD_REQUEST, message: "Email already exist" }
      }
      if(userExist.id !== token.user_id) {
        return { status: ERROR_STATUS.FORBIDDEN, message: "You are not authorized to update" }
      } 

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const result = await prisma.users.update({
        where: {
          id: user_id,
        },
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
          profile: {
            update: {
              identity_type: data.profile.identity_type,
              identity_number: data.profile.identity_number,
              address: data.profile.address,
            },
          },
        },
        include: {
          profile: true,
        },
      });
      return result;
    } catch (error) {
      console.log(error.message);
      return { status: ERROR_STATUS.INTERNAL_ERROR, message: error.message };
    }
  }

  async userLogin(data) {
    try {
      const user = await prisma.users.findUnique({
        where: {
          email: data.email,
        }
      })

      if(!data.email || !data.password || data.email.length === 0 || data.password.length === 0){
        return { status: ERROR_STATUS.BAD_REQUEST, message: "Email and password are required" }
      }

      if(!user || data.email !== user.email){
        return { status: ERROR_STATUS.NOT_FOUND, message: "Email not Found" }
      }

      const isValid = await bcrypt.compare(
          data.password,
          user.password
        )

      if(!isValid){
        return { status: ERROR_STATUS.BAD_REQUEST, message: "Invalid email or password" }
      }

      delete user.password

      const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
      });

      return { token, user };
    } catch (error) {
      console.log(error.message);
      return { status: ERROR_STATUS.INTERNAL_ERROR, message: error.message };
    }
  }
}

module.exports = new UserModel();
