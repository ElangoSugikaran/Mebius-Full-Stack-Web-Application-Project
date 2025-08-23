import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'store_settings' // Singleton pattern
  },
  store: {
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'Mebius'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    city: {
      type: String,
      trim: true,
      default: ''
    },
    state: {
      type: String,
      trim: true,
      default: ''
    },
    zipCode: {
      type: String,
      trim: true,
      default: ''
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
      type: String,
      default: ''
    }
  },
  payment: {
    stripe: {
      enabled: {
        type: Boolean,
        default: true
      }
    },
    cashOnDelivery: {
      enabled: {
        type: Boolean,
        default: true
      }
    },
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
  }
}, {
  timestamps: true,
  _id: false // Disable auto _id since we're setting it manually
});

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;