// backend/models/Enrollment.js
const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
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
    progress: { 
        completedItems: { type: [String], default: [] }, 
        percentage: { type: Number, default: 0, min: 0, max: 100 },
    },
    enrolledDate: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['pending_payment', 'enrolled', 'completed'],
        default: 'enrolled', 
    },
    paymentId: { 
        type: String,
        trim: true,
        sparse: true,
    }
}, { timestamps: true });

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;