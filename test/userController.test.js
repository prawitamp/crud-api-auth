const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

jest.mock('../src/models/v1/user.model.js');

const UserModel = require('../src/models/v1/user.model');
const { ERROR_STATUS } = require('../src/lib/constant/error_status');

const generateToken = (user_id) => {
    return jwt.sign({ user_id: user_id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  };

describe('UserController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });


  describe('GET /users', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'Admin 1',
          email: 'admin1@mail.com',
          accounts: [],
          profile: null,
        },
        {
          id: '2',
          name: 'Admin 2',
          email: 'admin2@mail.com',
          accounts: [],
          profile: null,
        },
      ];

      UserModel.getAllUser.mockResolvedValue({
        count: mockUsers.length,
        results: mockUsers,
      });

      const res = await request(app).get('/api/v1/users');

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.data.users).toHaveLength(mockUsers.length);
      expect(UserModel.getAllUser).toHaveBeenCalled();
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user by ID', async () => {
      const mockUser = {
        id: '1',
        name: 'Admin 1',
        email: 'admin1@mail.com',
        accounts: [],
        profile: null,
      };

      UserModel.getUserById.mockResolvedValue(mockUser);

      const res = await request(app).get('/api/v1/users/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.data).toEqual(mockUser);
      expect(UserModel.getUserById).toHaveBeenCalledWith('1');
    });

    it('should return 404 if user not found', async () => {
      UserModel.getUserById.mockResolvedValue({
        status: ERROR_STATUS.NOT_FOUND,
        message: 'User not found',
      });

      const res = await request(app).get('/api/v1/users/1');

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('User not found');
    });
  });

  describe('POST /users/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        name: 'Admin 1',
        email: 'admin1@mail.com',
        password: 'password123',
        profile: {
          identity_type: 'Passport',
          identity_number: '123456789',
          address: 'Banten',
        },
      };

      UserModel.userRegister.mockResolvedValue(newUser);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(newUser);

      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toEqual('success');
      expect(res.body.data).toEqual(newUser);
    });

    it('should return 400 if email or identity number already exists', async () => {
      UserModel.userRegister.mockResolvedValue({
        status: ERROR_STATUS.BAD_REQUEST,
        message: 'Email already exist',
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Admin 1',
          email: 'admin1@mail.com',
          password: 'password123',
          profile: {
            identity_type: 'Passport',
            identity_number: '123456789',
            address: 'Banten',
          },
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Email already exist');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete a user by ID', async () => {
      const mockToken = generateToken('1');

      UserModel.deleteUserById.mockResolvedValue({
        id: '1',
        name: 'Admin 1',
        email: 'admin1@mail.com',
      });

      const res = await request(app)
        .delete('/api/v1/users/1')
        .set('Authorization', `Bearer ${mockToken}  `)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.message).toEqual('User deleted');
    });

    it('should return 403 if user is not authorized', async () => {
      const mockToken = generateToken('2');

      UserModel.deleteUserById.mockResolvedValue({
        status: ERROR_STATUS.FORBIDDEN,
        message: 'You are not authorized to delete user',
      });

      const res = await request(app)
        .delete('/api/v1/users/1')
        .set('Authorization', `Bearer ${mockToken}`)
        .send();

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('You are not authorized to delete user');
    });
  });

  describe('PUT /users/:id', () => {
    it('should update a user by ID', async () => {
      const mockToken = generateToken('1');
      const updatedUser = {
        name: 'Admin 1',
        email: 'admin1@mail.com',
        password: 'newpassword123',
        profile: {
          identity_type: 'Passport',
          identity_number: '123456789',
          address: 'Banten',
        },
      };

      UserModel.updateUserById.mockResolvedValue(updatedUser);

      const res = await request(app)
        .put('/api/v1/users/1')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ ...updatedUser, user: { user_id: '1' } });

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.data).toEqual(updatedUser);
    });

    it('should return 403 if user is not authorized', async () => {
      const mockToken = generateToken('2');

      UserModel.updateUserById.mockResolvedValue({
        status: ERROR_STATUS.FORBIDDEN,
        message: 'You are not authorized to update',
      });

      const res = await request(app)
        .put('/api/v1/users/1')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          name: 'Admin 1',
          email: 'admin1@mail.com',
          password: 'newpassword123',
          profile: {
            identity_type: 'Passport',
            identity_number: '123456789',
            address: 'Banten',
          },
          user: { user_id: '2' },
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('You are not authorized to update');
    });
  });

  describe('POST /users/login', () => {
    it('should log in a user and return a token', async () => {
      const mockUser = {
        id: '1',
        name: 'Admin 1',
        email: 'admin1@mail.com',
        password: 'password123',
      };

      const mockToken = generateToken('1');
      UserModel.userLogin.mockResolvedValue({
        token: mockToken,
        user: mockUser,
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin1@mail.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.data.token).toEqual(mockToken);
      expect(UserModel.userLogin).toHaveBeenCalledWith({
        email: 'admin1@mail.com',
        password: 'password123',
      });
    });

    it('should return 400 if email or password is missing', async () => {
      UserModel.userLogin.mockResolvedValue({
        status: ERROR_STATUS.BAD_REQUEST,
        message: 'Email and password are required',
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin1@mail.com' });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Email and password are required');
    });

    it('should return 400 if credentials are invalid', async () => {
      UserModel.userLogin.mockResolvedValue({
        status: ERROR_STATUS.BAD_REQUEST,
        message: 'Invalid email or password',
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin1@mail.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Invalid email or password');
    });
  });
});
