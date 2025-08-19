import Settings from '../infrastructure/db/entities/Settings';
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";
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
      settings = await Settings.create({
        _id: SETTINGS_ID,
        store: {
          name: 'My Store',
          description: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          openTime: '09:00',
          closeTime: '18:00',
          isOpen: true
        },
        payment: {
          stripe: {
            enabled: true,
            publicKey: '',
            secretKey: ''
          },
          cashOnDelivery: {
            enabled: true
          },
          currency: {
            code: 'USD',
            symbol: '$'
          },
          tax: {
            enabled: true,
            rate: 8.5,
            name: 'Sales Tax'
          }
        }
      });
    }
    
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// Update store settings only
const updateStoreSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = updateStoreSettingsDTO.safeParse(req.body);
    if (!result.success) {
      console.error('❌ Store settings validation failed:', result.error.issues);
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues
      });
    }

    const settings = await Settings.findByIdAndUpdate(
      SETTINGS_ID,
      { $set: { store: result.data.store } },
      { new: true, upsert: true, runValidators: true }
    );

    console.log('✅ Store settings updated successfully:', settings?.store);
    res.json(settings);
  } catch (error) {
    console.error('❌ Error updating store settings:', error);
    next(error);
  }
};

// Update payment settings only
const updatePaymentSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = updatePaymentSettingsDTO.safeParse(req.body);
    if (!result.success) {
      console.error('❌ Payment settings validation failed:', result.error.issues);
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues
      });
    }

    const settings = await Settings.findByIdAndUpdate(
      SETTINGS_ID,
      { $set: { payment: result.data.payment } },
      { new: true, upsert: true, runValidators: true }
    );

    console.log('✅ Payment settings updated successfully:', settings?.payment);
    res.json(settings);
  } catch (error) {
    console.error('❌ Error updating payment settings:', error);
    next(error);
  }
};

// Update all settings (partial update)
const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = updateSettingsDTO.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Invalid settings data');
    }

    const updateData: any = {};
    if (result.data.store) {
      updateData.store = result.data.store;
    }
    if (result.data.payment) {
      updateData.payment = result.data.payment;
    }

    const settings = await Settings.findByIdAndUpdate(
      SETTINGS_ID,
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export {
  getSettings,
  updateStoreSettings,
  updatePaymentSettings,
  updateSettings
};