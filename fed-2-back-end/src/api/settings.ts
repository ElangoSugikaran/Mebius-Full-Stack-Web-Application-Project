import express from 'express';
import { 
  getStoreSettings,
  getPaymentSettings,
  updateStoreSettings,
  updatePaymentSettings,
} from '../application/settings.js';

import { isAuthenticated } from '../api/middleware/authentication-middleware.js';
import { isAdmin } from '../api/middleware/authorization-middleware.js';

const settingsRouter = express.Router();

// Apply middleware
settingsRouter.use(isAuthenticated);
settingsRouter.use(isAdmin);

// Store settings routes
settingsRouter.get('/store', getStoreSettings);
settingsRouter.put('/store', updateStoreSettings);

// Payment settings routes  
settingsRouter.get('/payment', getPaymentSettings);
settingsRouter.put('/payment', updatePaymentSettings);

export default settingsRouter;