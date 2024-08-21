const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

const AccountModel = require('../src/models/v1/account.model');
const { ERROR_STATUS } = require('../src/lib/constant/error_status');

jest.mock('../src/models/v1/account.model');
jest.mock('jsonwebtoken');

const generateToken = (user_id) => {
    return jwt.sign({ user_id: user_id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });
  };

describe('AccountController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/accounts - getAllAccounts', () => {
    it('should return all accounts', async () => {
      const mockAccounts = [
        { id: '1', bank_name: 'Test Bank 1', balance: 1000, user_id: '1' },
        { id: '2', bank_name: 'Test Bank 2', balance: 2000, user_id: '2' },
      ];

      AccountModel.getAllAccount.mockResolvedValue({
        count: mockAccounts.length,
        results: mockAccounts,
      });

      const res = await request(app).get('/api/v1/accounts')

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.data).toEqual({
        total: mockAccounts.length,
        accounts: mockAccounts,
      });
      expect(res.body.data.accounts).toHaveLength(mockAccounts.length);
      expect(AccountModel.getAllAccount).toHaveBeenCalled();
    });
  });

  describe('GET /api/v1/accounts/:id - getAccountById', () => {
    it('should return an account by ID', async () => {
      const mockAccount = { id: '1', bank_name: 'Test Bank', balance: 1000, user_id: '1' };

      AccountModel.getAccountById.mockResolvedValue(mockAccount);

      const res = await request(app).get('/api/v1/accounts/1')

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.data).toEqual(mockAccount);
    });

    it('should return 404 if the account is not found', async () => {
      AccountModel.getAccountById.mockResolvedValue({
        status: ERROR_STATUS.NOT_FOUND,
        message: 'Account not found',
      });

      const res = await request(app).get('/api/v1/accounts/1')

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Account not found');
    });
  });

  describe('POST /api/v1/accounts - createAccount', () => {
    it('should create a new account', async () => {
      const newAccount = { bank_name: 'New Bank', bank_account_number: '123456789', balance: 500 };
      const mockAccount = { id: '1', ...newAccount, user_id: '1' };
      const mockToken = generateToken('1')

      AccountModel.createAccount.mockResolvedValue(mockAccount);

      const res = await request(app)
        .post('/api/v1/accounts')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(newAccount);

      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toEqual('success');
      expect(res.body.data).toEqual(mockAccount);
    });
  });

  describe('DELETE /api/v1/accounts/:id - deleteAccountById', () => {
    it('should delete an account by ID if authorized', async () => {
      const mockAccount = { id: '1', user_id: '1' };
      const mockToken = generateToken('1');

      AccountModel.deleteAccountById.mockResolvedValue(mockAccount);

      const res = await request(app)
        .delete('/api/v1/accounts/1')
        .set('Authorization', `Bearer ${mockToken}`)
        .send()

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.message).toEqual('Account deleted');
    });

    it('should return 404 if the account is not found', async () => {
      const mockAccount = { status: 404, message: 'Account not found' };
      const mockToken = generateToken('1');

      AccountModel.deleteAccountById.mockResolvedValue(mockAccount);

      const res = await request(app)
        .delete('/api/v1/accounts/1')
        .set('Authorization', `Bearer ${mockToken}`)
        .send()

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Account not found');
    });
  });

  describe('PUT /api/v1/accounts/:id - updateAccountById', () => {
    it('should update an account by ID if authorized', async () => {
      const updatedAccount = {
        bank_name: 'Updated Bank',
        bank_account_number: '987654321',
        balance: 1000,
      };
      const mockAccount = { id: '1', ...updatedAccount, user_id: '1' };
      const mockToken = generateToken('1');

      AccountModel.updateAccountById.mockResolvedValue(mockAccount);

      const res = await request(app)
        .put('/api/v1/accounts/1')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updatedAccount)

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.data).toEqual(mockAccount);
    });

    it('should return 404 if the account is not found', async () => {
      const updatedAccount = { status: 404, message: 'Account not found' };
      const mockToken = generateToken('1');

      AccountModel.updateAccountById.mockResolvedValue(updatedAccount);

      const res = await request(app)
        .put('/api/v1/accounts/1')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(updatedAccount);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Account not found');
    });
  });

});
