// backend/models/Course.js
const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
}, { _id: false, timestamps: true });

const quizQuestionSchema = new mongoose.Schema({
    questionText: { type: String, required: true, trim: true },
    options: [{ type: String, required: true, trim: true }],
    correctAnswerIndex: { type: Number, required: true, min: 0, max: 3 },
}, { _id: false, timestamps: true });

const lessonSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    videoUrl: { type: String, trim: true },
    description: { type: String, trim: true },
    resources: [resourceSchema],
    quiz: [quizQuestionSchema],
}, { _id: false, timestamps: true });

const sectionSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    lessons: [lessonSchema],
}, { _id: false, timestamps: true });

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    instructorName: { type: String, required: true },
    price: { type: Number, default: 0, min: 0 },
    thumbnailUrl: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    sections: [sectionSchema],
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;