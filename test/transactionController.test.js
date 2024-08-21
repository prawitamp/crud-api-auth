const request = require('supertest');
const app = require('../app');
const jwt = require('jsonwebtoken');

const TransactionModel = require('../src/models/v1/transaction.model');
const { ERROR_STATUS } = require('../src/lib/constant/error_status');

jest.mock('../src/models/v1/transaction.model');

const generateToken = (user_id) => {
  return jwt.sign({ user_id: user_id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

describe('TransactionController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/transactions', () => {
    it('should return all transactions', async () => {
      const mockTransactions = [
        { id: '1', amount: 100 },
        { id: '2', amount: 200 },
      ];
      TransactionModel.getAllTransaction.mockResolvedValue({
        count: mockTransactions.length,
        results: mockTransactions,
      });

      const res = await request(app).get('/api/v1/transactions');

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.data.total).toEqual(mockTransactions.length);
      expect(res.body.data.transactions).toEqual(mockTransactions);
    });

  });

  describe('GET /api/v1/transactions/:id', () => {
    it('should return a transaction by ID', async () => {
      const mockTransaction = { id: '1', amount: 100 };
      TransactionModel.getTransactionById.mockResolvedValue(mockTransaction);

      const res = await request(app).get('/api/v1/transactions/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('success');
      expect(res.body.data).toEqual(mockTransaction);
    });

    it('should return 404 if transaction is not found', async () => {
      TransactionModel.getTransactionById.mockResolvedValue({
        status: ERROR_STATUS.NOT_FOUND,
        message: 'Transaction not found',
      });

      const res = await request(app).get('/api/v1/transactions/999');

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Transaction not found');
    });

  });

  describe('POST /api/v1/transactions', () => {
    it('should create a transaction if valid', async () => {
      const mockTransaction = {
        id: '1',
        source_account_id: '1',
        destination_account_id: '2',
        amount: 100,
        notes: 'Payment',
      };
      const mockToken = generateToken('1');

      TransactionModel.createTransaction.mockResolvedValue(mockTransaction);

      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(mockTransaction);

      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toEqual('success');
      expect(res.body.data).toEqual(mockTransaction);
    });

    it('should return 400 if data is invalid', async () => {
      const invalidTransaction = {};
      const mockToken = generateToken('1');

      TransactionModel.createTransaction.mockResolvedValue({
        status: ERROR_STATUS.BAD_REQUEST,
        message: 'Transaction is required',
      });

      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidTransaction);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Transaction is required');
    });

    it('should return 403 if user is not authorized', async () => {
      const mockTransaction = {
        id: '1',
        source_account_id: '1',
        destination_account_id: '2',
        amount: 100,
        notes: 'Payment',
      };
      const mockToken = generateToken('2'); // Assuming '2' is not authorized

      TransactionModel.createTransaction.mockResolvedValue({
        status: ERROR_STATUS.FORBIDDEN,
        message: 'You are not authorized to create transaction',
      });

      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(mockTransaction);

      expect(res.statusCode).toEqual(403);
      expect(res.body.message).toEqual('You are not authorized to create transaction');
    });

    it('should return 404 if source or destination account is not found', async () => {
      const mockTransaction = {
        id: '1',
        source_account_id: '999',
        destination_account_id: '2',
        amount: 100,
        notes: 'Payment',
      };
      const mockToken = generateToken('1');

      TransactionModel.createTransaction.mockResolvedValue({
        status: ERROR_STATUS.NOT_FOUND,
        message: 'Source account not found',
      });

      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(mockTransaction);

      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Source account not found');
    });

  });
});
