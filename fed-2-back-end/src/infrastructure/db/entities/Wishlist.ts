import mongoose from "mongoose";

const wishlistItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    finalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        type: String,
        required: true
    },
    inStock: {
        type: Boolean,
        default: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
});

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    items: [wishlistItemSchema],
    totalItems: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Pre-save middleware
wishlistSchema.pre('save', function() {
    this.totalItems = this.items.length;
});

// Virtual for checking if empty
wishlistSchema.virtual('isEmpty').get(function() {
    return this.items.length === 0;
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;