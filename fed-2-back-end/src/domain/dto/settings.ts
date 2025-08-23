import { z } from 'zod';

// Store Settings DTO
export const updateStoreSettingsDTO = z.object({
  store: z.object({
    name: z.string().min(1, 'Store name is required').trim(),
    description: z.string().optional().or(z.literal('')),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    address: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    zipCode: z.string().optional().or(z.literal('')),
    openTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    closeTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    isOpen: z.boolean(),
    logo: z.string().optional().or(z.literal(''))
  })
});

// Payment Settings DTO
export const updatePaymentSettingsDTO = z.object({
  payment: z.object({
    stripe: z.object({
      enabled: z.boolean()
    }),
    cashOnDelivery: z.object({
      enabled: z.boolean()
    }),
    currency: z.object({
      code: z.string().length(3, 'Currency code must be 3 characters'),
      symbol: z.string().min(1, 'Currency symbol is required')
    })
  })
});

// Combined Settings DTO
export const updateSettingsDTO = z.object({
  store: updateStoreSettingsDTO.shape.store.optional(),
  payment: updatePaymentSettingsDTO.shape.payment.optional()
});