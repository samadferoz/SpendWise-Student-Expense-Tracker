import express from 'express';
import {
  getHealth,
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction
} from '../controllers/transactionController.js';
import { validateTransaction } from '../middleware/validator.js';

const router = express.Router();

// System & Database Health Check
router.get('/health', getHealth);

// Transaction CRUD Endpoints
router.get('/transactions', getAllTransactions);
router.get('/transactions/:id', getTransactionById);
router.post('/transactions', validateTransaction, createTransaction);
router.put('/transactions/:id', validateTransaction, updateTransaction);
router.delete('/transactions/:id', deleteTransaction);

export default router;
