// backend/models/Certificate.js
const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
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
    issueDate: {
        type: Date,
        default: Date.now,
    },
    certificateUrl: { 
        type: String,
        trim: true,
    },
}, { timestamps: true });

certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Certificate = mongoose.model('Certificate', certificateSchema);
module.exports = Certificate;