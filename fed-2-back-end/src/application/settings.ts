import Settings from '../infrastructure/db/entities/Settings';
import ValidationError from "../domain/errors/validation-error";
import { Request, Response, NextFunction } from "express";
import { updateStoreSettingsDTO, updatePaymentSettingsDTO, updateSettingsDTO } from '../domain/dto/settings';

// Settings ID (singleton pattern - always use the same ID)
const SETTINGS_ID = 'store_settings';

// Get all settings
const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await Settings.findById(SETTINGS_ID);
    
    // If no settings exist, create default ones
    if (!settings) {
      console.log('No settings found, creating default settings...');
      
      const defaultSettings = {
        _id: SETTINGS_ID,
        store: {
          name: 'Mebius',
          description: 'Your premier destination for fashion-forward clothing and accessories. Style that speaks your language, quality that lasts.',
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
          stripe: {
            enabled: true
          },
          cashOnDelivery: {
            enabled: true
          },
          currency: {
            code: 'USD',
            symbol: '$'
          }
        }
      };

      try {
        settings = await Settings.create(defaultSettings);
        console.log('Default settings created successfully');
      } catch (createError) {
        console.error('Error creating default settings:', createError);
        // If creation fails, try to find existing settings again
        settings = await Settings.findOne();
        if (!settings) {
          // Return default settings without saving to DB
          console.log('Returning default settings without saving to DB');
          return res.json({
            data: defaultSettings,
            message: 'Using default settings'
          });
        }
      }
    }

    console.log('Settings fetched successfully:', settings?._id);
    res.json({
      data: settings,
      success: true
    });
  } catch (error) {
    console.error('Error in getSettings:', error);
    next(error);
  }
};

// Update store settings only
const updateStoreSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Updating store settings with data:', req.body);
    
    const result = updateStoreSettingsDTO.safeParse(req.body);
    if (!result.success) {
      console.error('Store settings validation failed:', result.error.issues);
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues,
        success: false
      });
    }

    // Ensure settings document exists first
    let settings = await Settings.findById(SETTINGS_ID);
    if (!settings) {
      console.log('Creating new settings document for store update');
      settings = new Settings({
        _id: SETTINGS_ID,
        store: result.data.store,
        payment: {
          stripe: { enabled: true },
          cashOnDelivery: { enabled: true },
          currency: { code: 'USD', symbol: '$' }
        }
      });
    } else {
      // Update existing settings
      settings.store = { ...settings.store, ...result.data.store };
    }

    await settings.save();

    console.log('Store settings updated successfully:', settings.store);
    res.json({
      data: settings,
      success: true
    });
  } catch (error) {
    console.error('Error updating store settings:', error);
    next(error);
  }
};

// Update payment settings only - Simplified
const updatePaymentSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Updating payment settings with data:', req.body);
    
    const result = updatePaymentSettingsDTO.safeParse(req.body);
    if (!result.success) {
      console.error('Payment settings validation failed:', result.error.issues);
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues,
        success: false
      });
    }

    // Ensure settings document exists first
    let settings = await Settings.findById(SETTINGS_ID);
    if (!settings) {
      console.log('Creating new settings document for payment update');
      settings = new Settings({
        _id: SETTINGS_ID,
        store: {
          name: 'Mebius',
          openTime: '09:00',
          closeTime: '18:00',
          isOpen: true
        },
        payment: result.data.payment
      });
    } else {
      // Update existing settings
      settings.payment = { ...settings.payment, ...result.data.payment };
    }

    await settings.save();

    console.log('Payment settings updated successfully');
    res.json({
      data: settings,
      success: true
    });
  } catch (error) {
    console.error('Error updating payment settings:', error);
    next(error);
  }
};

// Update all settings (partial update)
const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Updating all settings with data:', req.body);
    
    const result = updateSettingsDTO.safeParse(req.body);
    if (!result.success) {
      console.error('Settings validation failed:', result.error.issues);
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues,
        success: false
      });
    }

    // Ensure settings document exists first
    let settings = await Settings.findById(SETTINGS_ID);
    if (!settings) {
      console.log('Creating new settings document for full update');
      settings = new Settings({
        _id: SETTINGS_ID,
        store: result.data.store || {
          name: 'Mebius',
          openTime: '09:00',
          closeTime: '18:00',
          isOpen: true
        },
        payment: result.data.payment || {
          stripe: { enabled: true },
          cashOnDelivery: { enabled: true },
          currency: { code: 'USD', symbol: '$' }
        }
      });
    } else {
      // Update existing settings
      if (result.data.store) {
        settings.store = { ...settings.store, ...result.data.store };
      }
      if (result.data.payment) {
        settings.payment = { ...settings.payment, ...result.data.payment };
      }
    }

    await settings.save();

    console.log('All settings updated successfully');
    res.json({
      data: settings,
      success: true
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    next(error);
  }
};

export {
  getSettings,
  updateStoreSettings,
  updatePaymentSettings,
  updateSettings
};