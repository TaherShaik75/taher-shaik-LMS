// backend/models/Review.js
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Course',
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    reviewText: {
        type: String,
        required: true,
        trim: true,
    },
    date: { 
        type: Date,
        default: Date.now,
    },
    isFlagged: { // New field for flagging reviews
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;