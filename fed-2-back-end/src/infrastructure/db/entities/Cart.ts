import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    finalPrice: {
        type: Number,
        required: true,
        min: [0, 'Final price cannot be negative']
    },
    image: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
        default: 1
    },
    size: {
        type: String,
        required: false
    },
    color: {
        type: String,
        required: false
    },
    stock: {
        type: Number,
        required: true,
        min: [0, 'Stock cannot be negative']
    }
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0,
        min: [0, 'Total amount cannot be negative']
    },
    totalItems: {
        type: Number,
        default: 0,
        min: [0, 'Total items cannot be negative']
    }
}, {
    timestamps: true
});

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
    this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
    this.totalAmount = this.items.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
    next();
});

// Virtual for checking if cart is empty
cartSchema.virtual('isEmpty').get(function() {
    return this.items.length === 0;
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;