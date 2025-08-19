import { z } from 'zod';

// Store Settings DTO
export const updateStoreSettingsDTO = z.object({
  store: z.object({
    name: z.string().min(1, 'Store name is required').trim(),
    description: z.string().optional(),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    phone: z.string().min(10, 'Phone must be at least 10 characters').optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    isOpen: z.boolean(),
    logo: z.string().url().optional().or(z.literal(''))
  })
});

// Payment Settings DTO
export const updatePaymentSettingsDTO = z.object({
  payment: z.object({
    stripe: z.object({
      enabled: z.boolean(),
      publicKey: z.string().optional(),
      secretKey: z.string().optional()
    }),
    cashOnDelivery: z.object({
      enabled: z.boolean()
    }),
    currency: z.object({
      code: z.string().length(3, 'Currency code must be 3 characters'),
      symbol: z.string().min(1, 'Currency symbol is required')
    }),
    tax: z.object({
      enabled: z.boolean(),
      rate: z.number().min(0).max(100),
      name: z.string().min(1, 'Tax name is required')
    })
  })
});

// Combined Settings DTO
export const updateSettingsDTO = z.object({
  store: updateStoreSettingsDTO.shape.store.optional(),
  payment: updatePaymentSettingsDTO.shape.payment.optional()
});