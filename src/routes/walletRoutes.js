const express = require('express');
const walletController = require('../controllers/walletController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for transaction endpoints
const transactionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: 'Too many transaction requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting for read endpoints
const readLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
        success: false,
        error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Health check
router.get('/health', walletController.healthCheck);

// Asset types
router.get('/assets', readLimiter, walletController.getAssetTypes);

// Wallet operations
router.get('/balance', readLimiter, walletController.getBalance);
router.get('/wallets/:userId', readLimiter, walletController.getUserWallets);
router.get('/history', readLimiter, walletController.getTransactionHistory);

// Transaction endpoints
router.post('/topup', transactionLimiter, walletController.topup);
router.post('/bonus', transactionLimiter, walletController.bonus);
router.post('/spend', transactionLimiter, walletController.spend);

module.exports = router;
