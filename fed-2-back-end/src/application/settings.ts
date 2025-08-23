import { Request, Response, NextFunction } from 'express';
import Settings from '../infrastructure/db/entities/Settings.js';
import { updateStoreSettingsDTO, updatePaymentSettingsDTO } from '../domain/dto/settings.js';

const SETTINGS_ID = 'store_settings';

// Get store settings only
const getStoreSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching store settings...');
    
    let settings = await Settings.findOne({ _id: SETTINGS_ID });
    
    if (!settings) {
      // Create default settings if none exist
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
        }
      });
      
      settings = await defaultSettings.save();
    }

    res.json({
      data: { store: settings.store },
      success: true
    });
  } catch (error: unknown) {
    console.error('❌ Error fetching store settings:', error);
    res.status(500).json({
      error: 'Failed to fetch store settings',
      message: (error as Error).message,
      success: false
    });
  }
};

// Get payment settings only  
const getPaymentSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching payment settings...');
    
    let settings = await Settings.findOne({ _id: SETTINGS_ID });
    
    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = new Settings({
        _id: SETTINGS_ID,
        payment: {
          stripe: { enabled: true },
          cashOnDelivery: { enabled: true },
          currency: { code: 'USD', symbol: '$' }
        }
      });
      
      settings = await defaultSettings.save();
    }

    res.json({
      data: { payment: settings.payment },
      success: true
    });
  } catch (error: unknown) {
    console.error('❌ Error fetching payment settings:', error);
    res.status(500).json({
      error: 'Failed to fetch payment settings',
      message: (error as Error).message,
      success: false
    });
  }
};

// Update store settings
const updateStoreSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = updateStoreSettingsDTO.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues,
        success: false
      });
    }

    let settings = await Settings.findOne({ _id: SETTINGS_ID });
    if (!settings) {
      settings = new Settings({
        _id: SETTINGS_ID,
        store: result.data.store
      });
    } else {
      if (settings.store) {
        Object.assign(settings.store, result.data.store);
      }
    }

    await settings.save();

    res.json({
      data: { store: settings.store },
      success: true
    });
  } catch (error: unknown) {
    console.error('❌ Error updating store settings:', error);
    res.status(500).json({
      error: 'Failed to update store settings',
      message: (error as Error).message,
      success: false
    });
  }
};

// Update payment settings
const updatePaymentSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = updatePaymentSettingsDTO.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed', 
        details: result.error.issues,
        success: false
      });
    }

    let settings = await Settings.findOne({ _id: SETTINGS_ID });
    if (!settings) {
      settings = new Settings({
        _id: SETTINGS_ID,
        payment: result.data.payment
      });
    } else {
      if (settings.payment) {
        Object.assign(settings.payment, result.data.payment);
      }
    }

    await settings.save();

    res.json({
      data: { payment: settings.payment },
      success: true
    });
  } catch (error: unknown) {
    console.error('❌ Error updating payment settings:', error);
    res.status(500).json({
      error: 'Failed to update payment settings',
      message: (error as Error).message,
      success: false
    });
  }
};

export {
  getStoreSettings,
  getPaymentSettings,
  updateStoreSettings,
  updatePaymentSettings
};