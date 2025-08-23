import { z } from 'zod';

// Store Settings Validation Schema
export const updateStoreSettingsDTO = z.object({
  store: z.object({
    name: z.string()
      .min(2, 'Store name must be at least 2 characters')
      .max(100, 'Store name cannot exceed 100 characters')
      .trim(),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .optional()
      .or(z.literal('')),
    email: z.string()
      .email('Please enter a valid email address')
      .optional()
      .or(z.literal('')),
    phone: z.string()
      .optional()
      .or(z.literal('')),
    address: z.string()
      .max(200, 'Address cannot exceed 200 characters')
      .optional()
      .or(z.literal('')),
    city: z.string()
      .max(50, 'City name cannot exceed 50 characters')
      .optional()
      .or(z.literal('')),
    state: z.string()
      .max(50, 'State name cannot exceed 50 characters')
      .optional()
      .or(z.literal('')),
    zipCode: z.string()
      .max(20, 'ZIP code cannot exceed 20 characters')
      .optional()
      .or(z.literal('')),
    openTime: z.string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)'),
    closeTime: z.string()
      .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (use HH:MM)'),
    isOpen: z.boolean(),
    logo: z.string()
      .optional()
      .or(z.literal(''))
  })
});

// Payment Settings Validation Schema
export const updatePaymentSettingsDTO = z.object({
  payment: z.object({
    stripe: z.object({
      enabled: z.boolean()
    }),
    cashOnDelivery: z.object({
      enabled: z.boolean()
    }),
    currency: z.object({
      code: z.string()
        .length(3, 'Currency code must be exactly 3 characters')
        .regex(/^[A-Z]{3}$/, 'Currency code must be uppercase letters only'),
      symbol: z.string()
        .min(1, 'Currency symbol is required')
        .max(3, 'Currency symbol cannot exceed 3 characters')
    })
  })
});