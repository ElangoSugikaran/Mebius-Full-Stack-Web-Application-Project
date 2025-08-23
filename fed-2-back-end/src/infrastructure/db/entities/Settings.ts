import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'store_settings' // This ensures we only have one settings document
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
      default: 'Your premier destination for fashion-forward clothing and accessories.'
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'support@mebius.com'
    },
    phone: {
      type: String,
      trim: true,
      default: '+1 (234) 567-8900'
    },
    address: {
      type: String,
      trim: true,
      default: '123 Fashion Street'
    },
    city: {
      type: String,
      trim: true,
      default: 'Style City'
    },
    state: {
      type: String,
      trim: true,
      default: 'SC'
    },
    zipCode: {
      type: String,
      trim: true,
      default: '12345'
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
  _id: false // Important: This prevents mongoose from creating auto _id
});

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
