import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    // Frontend expects 'comment' but schema has 'review'
    comment: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional if you want anonymous reviews
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true // This adds createdAt and updatedAt automatically
});
 

const Review = mongoose.model("Review", reviewSchema);

export default Review;
