import express from 'express';
import { 
  getSettings,
  updateStoreSettings,
  updatePaymentSettings,
  updateSettings
} from '../application/settings';
// FIXED: Proper middleware imports (adjust paths as needed)
import {isAuthenticated} from '../api/middleware/authentication-middleware'; // or { isAuthenticated }
import {isAdmin} from '../api/middleware/authorization-middleware'; // or { isAdmin }

const settingsRouter = express.Router();

// All settings operations require authentication and admin privileges
settingsRouter.use(isAuthenticated);
settingsRouter.use(isAdmin);

// GET /api/settings - Get all settings
settingsRouter.get('/', getSettings);

// PUT /api/settings - Update all settings (partial)
settingsRouter.put('/', updateSettings);

// PUT /api/settings/store - Update only store settings
settingsRouter.put('/store', updateStoreSettings);

// PUT /api/settings/payment - Update only payment settings
settingsRouter.put('/payment', updatePaymentSettings);

export default settingsRouter;