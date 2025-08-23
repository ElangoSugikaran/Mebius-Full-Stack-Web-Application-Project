import express from 'express';
import { 
  getStoreSettings,
  getPaymentSettings,
  updateStoreSettings,
  updatePaymentSettings,
} from '../application/settings.js';

// Import your middleware
import { isAuthenticated } from '../api/middleware/authentication-middleware.js';
import { isAdmin } from '../api/middleware/authorization-middleware.js';

const settingsRouter = express.Router();

// Debug middleware to log all settings requests
settingsRouter.use((req, res, next) => {
  console.log(`📋 Settings API: ${req.method} ${req.path}`);
  next();
});


// Store settings routes
settingsRouter.get('/store', isAuthenticated, isAdmin, getStoreSettings);
settingsRouter.put('/store', isAuthenticated, isAdmin, updateStoreSettings);

// Payment settings routes
settingsRouter.get('/payment', isAuthenticated, isAdmin, getPaymentSettings);
settingsRouter.put('/payment', isAuthenticated, isAdmin, updatePaymentSettings);

export default settingsRouter;