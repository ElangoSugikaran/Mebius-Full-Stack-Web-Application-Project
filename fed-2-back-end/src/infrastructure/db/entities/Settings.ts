import mongoose from 'mongoose';

// Combined Settings schema for both store and payment settings
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

  // Payment Settings
  payment: {
    // Stripe Configuration
    stripe: {
      enabled: {
        type: Boolean,
        default: true
      },
      publicKey: {
        type: String,
        trim: true
      },
      secretKey: {
        type: String,
        trim: true
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
    },

    // Tax Settings
    tax: {
      enabled: {
        type: Boolean,
        default: true
      },
      rate: {
        type: Number,
        default: 8.5,
        min: 0,
        max: 100
      },
      name: {
        type: String,
        default: 'Sales Tax',
        trim: true
      }
    }
  }
}, {
  timestamps: true
});

// Note: We use a fixed _id in the application layer to ensure singleton pattern

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;