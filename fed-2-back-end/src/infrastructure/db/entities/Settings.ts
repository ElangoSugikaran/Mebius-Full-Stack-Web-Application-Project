import mongoose from 'mongoose';

// Simplified Settings schema - removed Stripe keys, simplified tax
const settingsSchema = new mongoose.Schema({
  // Store Settings
  store: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    openTime: {
      type: String,
      default: '09:00'
    },
    closeTime: {
      type: String,
      default: '18:00'
    },
    isOpen: {
      type: Boolean,
      default: true
    },
    logo: {
      type: String // URL to logo image
    }
  },

  // Simplified Payment Settings
  payment: {
    // Stripe Configuration - Just enable/disable
    stripe: {
      enabled: {
        type: Boolean,
        default: true
      }
    },

    // Cash on Delivery Configuration
    cashOnDelivery: {
      enabled: {
        type: Boolean,
        default: true
      }
    },

    // Currency Settings
    currency: {
      code: {
        type: String,
        default: 'USD',
        uppercase: true
      },
      symbol: {
        type: String,
        default: '$'
      }
    }

    // Tax settings removed - keeping it simple for now
  }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;