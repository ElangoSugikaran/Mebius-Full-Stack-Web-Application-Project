
import { Request, Response, NextFunction } from 'express';
import Settings from '../infrastructure/db/entities/Settings.js';
import { updateStoreSettingsDTO, updatePaymentSettingsDTO } from '../domain/dto/settings.js';

const SETTINGS_ID = 'store_settings'; // Constant ID for our singleton settings

// Helper function to ensure settings exist
const ensureSettingsExist = async () => {
  let settings = await Settings.findOne({ _id: SETTINGS_ID });
  
  if (!settings) {
    console.log('📝 Creating default settings...');
    const defaultSettings = new Settings({
      _id: SETTINGS_ID,
      store: {
        name: 'Mebius',
        description: 'Your premier destination for fashion-forward clothing and accessories.',
        email: 'support@mebius.com',
        phone: '+1 (234) 567-8900',
        address: '123 Fashion Street',
        city: 'Style City',
        state: 'SC',
        zipCode: '12345',
        openTime: '09:00',
        closeTime: '18:00',
        isOpen: true
      },
      payment: {
        stripe: { enabled: true },
        cashOnDelivery: { enabled: true },
        currency: { code: 'USD', symbol: '$' }
      }
    });
    
    settings = await defaultSettings.save();
    console.log('✅ Default settings created successfully');
  }
  
  return settings;
};

// GET /api/settings/store - Fetch store settings
export const getStoreSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 Fetching store settings...');
    
    const settings = await ensureSettingsExist();
    
    console.log('✅ Store settings fetched successfully');
    res.json({
      success: true,
      data: settings.store,
      message: 'Store settings retrieved successfully'
    });
    
  } catch (error: unknown) {
    console.error('❌ Error fetching store settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch store settings',
      message: (error as Error).message
    });
  }
};

// GET /api/settings/payment - Fetch payment settings
export const getPaymentSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 Fetching payment settings...');
    
    const settings = await ensureSettingsExist();
    
    console.log('✅ Payment settings fetched successfully');
    res.json({
      success: true,
      data: settings.payment,
      message: 'Payment settings retrieved successfully'
    });
    
  } catch (error: unknown) {
    console.error('❌ Error fetching payment settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment settings',
      message: (error as Error).message
    });
  }
};

// PUT /api/settings/store - Update store settings
export const updateStoreSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔄 Updating store settings...', req.body);
    
    // Validate input data
    const result = updateStoreSettingsDTO.safeParse(req.body);
    if (!result.success) {
      console.log('❌ Validation failed:', result.error.issues);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.issues,
        message: 'Please check your input data'
      });
    }

    // Get or create settings document
    let settings = await ensureSettingsExist();
    
    // FIX: Properly handle optional fields with defaults
    const storeData = {
      name: result.data.store.name,
      description: result.data.store.description || '',
      email: result.data.store.email || '',
      phone: result.data.store.phone || '',
      address: result.data.store.address || '',
      city: result.data.store.city || '',
      state: result.data.store.state || '',
      zipCode: result.data.store.zipCode || '',
      openTime: result.data.store.openTime,
      closeTime: result.data.store.closeTime,
      isOpen: result.data.store.isOpen,
      logo: result.data.store.logo || ''
    };
    
    // Update store settings
    if (settings.store) {
      Object.assign(settings.store, storeData);
    } else {
      settings.store = storeData;
    }
    
    // Save changes to database
    await settings.save();
    
    console.log('✅ Store settings updated successfully');
    res.json({
      success: true,
      data: settings.store,
      message: 'Store settings updated successfully'
    });
    
  } catch (error: unknown) {
    console.error('❌ Error updating store settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update store settings',
      message: (error as Error).message
    });
  }
};

// PUT /api/settings/payment - Update payment settings
export const updatePaymentSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔄 Updating payment settings...', req.body);
    
    // Validate input data
    const result = updatePaymentSettingsDTO.safeParse(req.body);
    if (!result.success) {
      console.log('❌ Validation failed:', result.error.issues);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: result.error.issues,
        message: 'Please check your input data'
      });
    }

    // Get or create settings document
    let settings = await ensureSettingsExist();
    
    // Update payment settings with validated data
    const paymentData = result.data.payment;
    
    if (settings.payment) {
      Object.assign(settings.payment, paymentData);
    } else {
      settings.payment = paymentData;
    }
    
    // Save changes to database
    await settings.save();
    
    console.log('✅ Payment settings updated successfully');
    res.json({
      success: true,
      data: settings.payment,
      message: 'Payment settings updated successfully'
    });
    
  } catch (error: unknown) {
    console.error('❌ Error updating payment settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payment settings',
      message: (error as Error).message
    });
  }
};