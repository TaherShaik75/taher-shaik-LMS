
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') }); // Load .env from project root

// backend/server.js
console.log('[SERVER_LOG] Attempting to load server.js module...');
console.log('[SERVER_LOG] NODE_ENV:', process.env.NODE_ENV);
console.log('[SERVER_LOG] PORT from env:', process.env.PORT);
console.log('[SERVER_LOG] MONGODB_URI from env (server.js check):', process.env.MONGODB_URI ? 'Exists' : 'MISSING or UNDEFINED');
console.log('[SERVER_LOG] JWT_SECRET from env (server.js check):', process.env.JWT_SECRET ? 'Exists' : 'MISSING or UNDEFINED');
console.log('[SERVER_LOG] FRONTEND_URL from env (server.js check):', process.env.FRONTEND_URL ? 'Exists' : 'MISSING or UNDEFINED');
console.log('[SERVER_LOG] GOOGLE_CLIENT_ID from env (server.js check):', process.env.GOOGLE_CLIENT_ID ? 'Exists' : 'MISSING or UNDEFINED');
console.log('[SERVER_LOG] GOOGLE_CLIENT_SECRET from env (server.js check):', process.env.GOOGLE_CLIENT_SECRET ? 'Exists' : 'MISSING or UNDEFINED');
console.log('[SERVER_LOG] GOOGLE_CALLBACK_URL from env (server.js check):', process.env.GOOGLE_CALLBACK_URL ? 'Exists' : 'MISSING or UNDEFINED');
console.log('[SERVER_LOG] CLOUDINARY_CLOUD_NAME from env (server.js check):', process.env.CLOUDINARY_CLOUD_NAME ? 'Exists' : 'MISSING or UNDEFINED');
console.log('[SERVER_LOG] CLOUDINARY_API_KEY from env (server.js check):', process.env.CLOUDINARY_API_KEY ? 'Exists' : 'MISSING or UNDEFINED');
console.log('[SERVER_LOG] CLOUDINARY_API_SECRET from env (server.js check):', process.env.CLOUDINARY_API_SECRET ? 'Exists' : 'MISSING or UNDEFINED');


const express = require('express');
console.log('[SERVER_LOG] Express required.');
const mongoose = require('mongoose');
console.log('[SERVER_LOG] Mongoose required.');
const cors = require('cors');
console.log('[SERVER_LOG] CORS required.');
const bcrypt = require('bcryptjs');
console.log('[SERVER_LOG] bcryptjs required.');
const jwt = require('jsonwebtoken');
console.log('[SERVER_LOG] jsonwebtoken required.');
const passport = require('passport');
console.log('[SERVER_LOG] passport required.');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
console.log('[SERVER_LOG] GoogleStrategy required.');
const multer = require('multer');
console.log('[SERVER_LOG] Multer required.');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
console.log('[SERVER_LOG] Cloudinary required.');
const streamifier = require('streamifier');
console.log('[SERVER_LOG] Streamifier required.');
const path = require('path');
console.log('[SERVER_LOG] Path required.');


const connectDB = require('./db');
console.log('[SERVER_LOG] connectDB imported.');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Review = require('./models/Review');
const Certificate = require('./models/Certificate');
console.log('[SERVER_LOG] Models imported.');

const app = express();
console.log('[SERVER_LOG] Express app initialized.');

// Environment variables (ensure .env file is present in backend directory for local dev)
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-jwt-secret-key-change-me-in-env';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173/frontend/index.html';


// Connect to Database
connectDB()
    .then(() => console.log('[SERVER_LOG] Database connection promise resolved.'))
    .catch(err => {
        console.error('[SERVER_LOG] CRITICAL: Failed to connect to DB from server.js init. Exiting.', err);
        process.exit(1); // Exit if DB connection fails early
    });


// Cloudinary Configuration
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true
    });
    console.log('[SERVER_LOG] Cloudinary configured.');
} else {
    console.warn('[SERVER_LOG] Cloudinary environment variables (CLOUD_NAME, API_KEY, API_SECRET) are not fully set. File uploads will likely fail.');
}

// Middleware
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? '*' : ['http://localhost:5173', 'http://127.0.0.1:5173', FRONTEND_URL.startsWith('file:') ? null : FRONTEND_URL].filter(Boolean), // Allow multiple origins for dev
    credentials: true
}));
console.log('[SERVER_LOG] CORS middleware configured.');
app.use(express.json());
console.log('[SERVER_LOG] express.json middleware configured.');
app.use(express.urlencoded({ extended: true }));
console.log('[SERVER_LOG] express.urlencoded middleware configured.');
app.use(passport.initialize());
console.log('[SERVER_LOG] Passport initialized.');

// Multer setup for memory storage (to pipe to Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
console.log('[SERVER_LOG] Multer configured for memory storage.');


// --- Helper Functions ---
// Function to upload a buffer to Cloudinary
const streamUploadToCloudinary = (fileBuffer, options = {}) => {
    return new Promise((resolve, reject) => {
        if (!cloudinary.config().cloud_name) {
            console.warn('[CLOUDINARY_UPLOAD] Cloudinary not configured. Skipping upload, returning placeholder.');
            return resolve({ secure_url: `https://via.placeholder.com/150/0000FF/808080?Text=Cloudinary_Not_Configured_${options.public_id || 'file'}`, public_id: options.public_id || 'placeholder_id' });
        }
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

async function processCourseContentFiles(req, courseData) {
    if (!req.files || Object.keys(req.files).length === 0) {
        console.log('[FILE_PROCESSING] No files found in request for course content.');
        return; // No files to process
    }
    console.log('[FILE_PROCESSING] Starting to process course content files. Files received:', Object.keys(req.files));

    for (const section of courseData.sections) {
        for (const lesson of section.lessons) {
            // Process lesson video file
            const videoFileKey = `lesson_s${section.sIdx}_l${lesson.lIdx}_videoFile`; // Assume sIdx/lIdx are set during parsing
            if (req.files[videoFileKey] && req.files[videoFileKey][0]) {
                const file = req.files[videoFileKey][0];
                console.log(`[FILE_PROCESSING] Uploading lesson video: ${file.originalname}`);
                const videoResult = await streamUploadToCloudinary(file.buffer, { resource_type: 'video', folder: 'course_videos' });
                lesson.videoUrl = videoResult.secure_url;
                console.log(`[FILE_PROCESSING] Lesson video uploaded: ${lesson.videoUrl}`);
            }

            // Process lesson resources
            for (const resource of lesson.resources) {
                const resourceFileKey = `resource_s${section.sIdx}_l${lesson.lIdx}_r${resource.rIdx}_file`; // Assume rIdx is set
                if (req.files[resourceFileKey] && req.files[resourceFileKey][0]) {
                    const file = req.files[resourceFileKey][0];
                     console.log(`[FILE_PROCESSING] Uploading resource file: ${file.originalname}`);
                    const resourceResult = await streamUploadToCloudinary(file.buffer, { resource_type: 'raw', folder: 'course_resources' });
                    resource.url = resourceResult.secure_url;
                    console.log(`[FILE_PROCESSING] Resource file uploaded: ${resource.url}`);
                }
            }
        }
    }
}


// --- Passport Google OAuth Strategy ---
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await User.findOne({ googleId: profile.id });
            if (user) {
                if(user.isBlocked) return done(null, false, { message: 'Your account has been blocked.' });
                return done(null, user);
            }
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) { // User exists with this email, link Google ID
                user.googleId = profile.id;
                // user.name = profile.displayName; // Optionally update name
                await user.save();
                 if(user.isBlocked) return done(null, false, { message: 'Your account has been blocked.' });
                return done(null, user);
            }
            // New user
            const newUser = new User({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
                // role: 'learner' // Default role
            });
            await newUser.save();
            done(null, newUser);
        } catch (err) {
            console.error('Error in Google OAuth strategy:', err);
            done(err, false);
        }
    }));
    console.log('[SERVER_LOG] Google OAuth strategy configured.');
} else {
    console.warn('[SERVER_LOG] Google OAuth environment variables (CLIENT_ID, CLIENT_SECRET, CALLBACK_URL) are not fully set. Google login will not work.');
}

// --- Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (token == null) return res.status(401).json({ message: 'Authentication token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid or expired token' });
        req.user = user; // Add user payload to request object
        next();
    });
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Access denied. Required role: ${roles.join(' or ')}.` });
        }
        next();
    };
};
console.log('[SERVER_LOG] Authentication middleware defined.');

// --- API Routes ---

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
        if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists with this email.' });
        user = new User({ name, email, password, role: role || 'learner' });
        await user.save();
        res.status(201).json({ message: 'User created successfully. Please login.' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup.', error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
        if(user.isBlocked) return res.status(403).json({ message: 'Your account has been blocked. Please contact support.'});

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

        const tokenPayload = { userId: user._id, name: user.name, email: user.email, role: user.role };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: tokenPayload, message: 'Login successful!' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
});

// Google OAuth Routes
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

app.get('/api/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}#login?oauth_error=failed` }, (err, user, info) => {
        if (err) {
            console.error("Google OAuth Callback Error:", err);
            return res.redirect(`${FRONTEND_URL}#login?oauth_error=${encodeURIComponent(err.message || 'authentication_failed')}`);
        }
        if (!user) {
            const message = info && info.message ? info.message : 'authentication_failed_or_account_blocked';
            console.warn("Google OAuth - No user returned or blocked:", message);
            return res.redirect(`${FRONTEND_URL}#login?oauth_error=${encodeURIComponent(message)}`);
        }
        const tokenPayload = { userId: user._id, name: user.name, email: user.email, role: user.role };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
        const redirectBase = process.env.NODE_ENV === 'production' ? '/' : FRONTEND_URL;
        res.redirect(`${redirectBase}#oauth_callback?token=${token}&user=${encodeURIComponent(JSON.stringify(tokenPayload))}`);
    })(req, res, next);
});


// Dashboard Routes
app.get('/api/dashboard/enrolled-courses', authenticateToken, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ userId: req.user.userId })
            .populate('courseId', 'title thumbnailUrl instructorName category');
        const coursesData = enrollments.map(e => ({
            ...e.courseId._doc, // Spread course document
            id: e.courseId._id, // Ensure 'id' field is present
            progress: e.progress ? e.progress.percentage : 0,
            enrollmentStatus: e.status
        }));
        res.json(coursesData);
    } catch (error) { res.status(500).json({ message: 'Error fetching enrolled courses', error: error.message }); }
});
app.get('/api/dashboard/my-reviews', authenticateToken, async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user.userId })
            .populate('courseId', 'title');
        res.json(reviews.map(r => ({ ...r._doc, id: r._id, courseTitle: r.courseId ? r.courseId.title : 'N/A' })));
    } catch (error) { res.status(500).json({ message: 'Error fetching reviews', error: error.message }); }
});
app.get('/api/dashboard/my-certificates', authenticateToken, async (req, res) => {
    try {
        const certificates = await Certificate.find({ userId: req.user.userId })
            .populate('courseId', 'title');
        res.json(certificates.map(c => ({
            ...c._doc,
            id: c._id,
            courseTitle: c.courseId ? c.courseId.title : 'N/A',
            certificateUrl: `/#mock-certificate/${c.courseId?._id}/${c.userId}`
        })));
    } catch (error) { res.status(500).json({ message: 'Error fetching certificates', error: error.message }); }
});


// Course Routes
app.get('/api/courses', async (req, res) => { /* ... existing GET /api/courses logic ... */
    try {
        const { query, category, price, instructor } = req.query;
        const filter = {};
        if (query) filter.$or = [{ title: { $regex: query, $options: 'i' } }, { description: { $regex: query, $options: 'i' } }, { instructorName: { $regex: query, $options: 'i' } }];
        if (category) filter.category = category;
        if (price === 'free') filter.price = 0;
        if (price === 'paid') filter.price = { $gt: 0 };
        if (instructor) filter.instructorName = { $regex: instructor, $options: 'i' }; // Assuming instructor name search

        const courses = await Course.find(filter)
            .populate('instructor', 'name')
            .sort({ createdAt: -1 });
        res.json(courses.map(course => ({
            ...course._doc,
            id: course._id,
            instructorName: course.instructor ? course.instructor.name : course.instructorName || 'Unknown'
        })));
    } catch (error) { res.status(500).json({ message: 'Error fetching courses', error: error.message }); }
});

app.get('/api/courses/:id', async (req, res) => { /* ... existing GET /api/courses/:id logic ... */
    try {
        const course = await Course.findById(req.params.id).populate('instructor', 'name');
        if (!course) return res.status(404).json({ message: 'Course not found' });

        const reviews = await Review.find({ courseId: req.params.id }).populate('userId', 'name').sort({ createdAt: -1 });
        const courseObject = { ...course._doc, id: course._id, instructorName: course.instructor ? course.instructor.name : course.instructorName || 'Unknown' };
        courseObject.reviews = reviews.map(r => ({
             ...r._doc,
             id: r._id,
             reviewerName: r.userId ? r.userId.name : 'Anonymous'
        }));

        if (req.headers['authorization']) { // User might be logged in, try to get enrollment
            const token = req.headers['authorization'].split(' ')[1];
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    const enrollment = await Enrollment.findOne({ userId: decoded.userId, courseId: req.params.id });
                    if (enrollment) courseObject.enrollment = { ...enrollment._doc, id: enrollment._id};
                } catch (jwtError) { /* Not critical if token is invalid here, just means no enrollment info */ }
            }
        }
        res.json(courseObject);
    } catch (error) { res.status(500).json({ message: 'Error fetching course details', error: error.message }); }
});

app.post('/api/courses', authenticateToken, checkRole(['instructor', 'admin']), upload.any(), async (req, res) => {
    try {
        const { title, description, category, price, tags } = req.body;
        let sections = req.body.sections ? JSON.parse(req.body.sections) : [];

        if (!title || !description || !category) {
            return res.status(400).json({ message: "Title, description, and category are required." });
        }

        const courseData = {
            title, description, category,
            price: parseFloat(price) || 0,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            instructor: req.user.userId,
            instructorName: req.user.name,
            sections: sections.map((s, sIdx) => ({ ...s, sIdx, lessons: s.lessons.map((l, lIdx) => ({...l, lIdx, resources: l.resources.map((r, rIdx) => ({...r, rIdx})) })) }))
        };

        if (req.files) { // Check if req.files is populated
            const thumbnailImageFile = req.files.find(f => f.fieldname === 'thumbnailImage');
            if (thumbnailImageFile) {
                const result = await streamUploadToCloudinary(thumbnailImageFile.buffer, { folder: 'course_thumbnails' });
                courseData.thumbnailUrl = result.secure_url;
            }
            // Pass sIdx, lIdx, rIdx for proper file key matching
            await processCourseContentFiles(req, courseData);
        }
        
        // Remove temporary indices after processing
        courseData.sections.forEach(s => {
            delete s.sIdx;
            s.lessons.forEach(l => {
                delete l.lIdx;
                l.resources.forEach(r => delete r.rIdx);
            });
        });

        const newCourse = new Course(courseData);
        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (error) { console.error('Create course error:', error); res.status(500).json({ message: 'Server error creating course', error: error.message, stack: error.stack }); }
});

app.put('/api/courses/:id', authenticateToken, checkRole(['instructor', 'admin']), upload.any(), async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this course' });
        }
        const { title, description, category, price, tags } = req.body;
        let sections = req.body.sections ? JSON.parse(req.body.sections) : [];

        course.title = title || course.title;
        course.description = description || course.description;
        course.category = category || course.category;
        course.price = (price !== undefined && price !== null) ? parseFloat(price) : course.price;
        course.tags = tags ? tags.split(',').map(tag => tag.trim()) : course.tags;
        
        const courseDataForFiles = {
             sections: sections.map((s, sIdx) => ({ ...s, sIdx, lessons: s.lessons.map((l, lIdx) => ({...l, lIdx, resources: l.resources.map((r, rIdx) => ({...r, rIdx})) })) }))
        };

        if (req.files) {
            const thumbnailImageFile = req.files.find(f => f.fieldname === 'thumbnailImage');
            if (thumbnailImageFile) {
                const result = await streamUploadToCloudinary(thumbnailImageFile.buffer, { folder: 'course_thumbnails' });
                course.thumbnailUrl = result.secure_url;
            }
             // Process and update lesson video/resource URLs
            await processCourseContentFiles(req, courseDataForFiles);
        }
        
        // Assign the updated sections (with potentially new URLs) back to the course
        // Need to merge existing section IDs or handle replacement carefully if section structure can change.
        // For simplicity, this replaces sections array. More sophisticated merging might be needed.
        course.sections = courseDataForFiles.sections.map(s => {
            delete s.sIdx; // Clean up temp index
            s.lessons.forEach(l => {
                 delete l.lIdx; // Clean up temp index
                 l.resources.forEach(r => delete r.rIdx); // Clean up temp index
            });
            return s;
        });

        await course.save();
        res.json(course);
    } catch (error) { console.error('Update course error:', error); res.status(500).json({ message: 'Server error updating course', error: error.message, stack: error.stack }); }
});

// Enrollments
app.post('/api/enrollments', authenticateToken, async (req, res) => {
    try {
        const { courseId } = req.body;
        const userId = req.user.userId;
        let enrollment = await Enrollment.findOne({ userId, courseId });
        if (enrollment) {
            if(enrollment.status === 'pending_payment'){
                 return res.status(200).json({ message: 'Enrollment pending payment.', enrollment: { ...enrollment._doc, id:enrollment._id } });
            }
            return res.status(400).json({ message: 'Already enrolled in this course.', enrollment: { ...enrollment._doc, id:enrollment._id }});
        }
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found.' });

        const newEnrollmentData = { userId, courseId };
        if (course.price > 0) {
            newEnrollmentData.status = 'pending_payment';
            newEnrollmentData.paymentId = `MOCK_PAY_${Date.now()}`; // Placeholder
        } else {
            newEnrollmentData.status = 'enrolled';
        }
        enrollment = new Enrollment(newEnrollmentData);
        await enrollment.save();
        res.status(201).json({ message: `Enrollment ${course.price > 0 ? 'initiated, pending payment' : 'successful!'}`, enrollment: { ...enrollment._doc, id:enrollment._id } });
    } catch (error) { console.error('Enrollment error:', error); res.status(500).json({ message: 'Server error during enrollment.', error: error.message }); }
});

app.put('/api/enrollments/:enrollmentId/confirm-payment', authenticateToken, async (req, res) => {
    try {
        const enrollment = await Enrollment.findById(req.params.enrollmentId);
        if (!enrollment) return res.status(404).json({ message: "Enrollment record not found." });
        if (enrollment.userId.toString() !== req.user.userId) return res.status(403).json({ message: "Not authorized to confirm this payment." });
        if (enrollment.status !== 'pending_payment') return res.status(400).json({ message: "Enrollment is not pending payment." });

        enrollment.status = 'enrolled';
        // enrollment.paymentId = req.body.transactionId || enrollment.paymentId; // If you pass a real transaction ID
        await enrollment.save();
        res.json({ message: "Payment confirmed, you are now enrolled!", enrollment: { ...enrollment._doc, id: enrollment._id} });
    } catch (error) { res.status(500).json({ message: 'Error confirming payment', error: error.message }); }
});


app.post('/api/enrollments/:enrollmentId/progress', authenticateToken, async (req, res) => {
    try {
        const { itemId, completed } = req.body;
        const enrollment = await Enrollment.findById(req.params.enrollmentId).populate('courseId');
        if (!enrollment || enrollment.userId.toString() !== req.user.userId) {
            return res.status(404).json({ message: 'Enrollment not found or unauthorized.' });
        }
        if (enrollment.status !== 'enrolled' && enrollment.status !== 'completed') {
             return res.status(400).json({ message: 'Cannot update progress for non-enrolled/non-completed course.' });
        }

        const course = enrollment.courseId;
        if (!course) return res.status(404).json({ message: 'Course data not found for this enrollment.' });

        if (!enrollment.progress) enrollment.progress = { completedItems: [], percentage: 0 };
        const completedItemsSet = new Set(enrollment.progress.completedItems);
        if (completed) completedItemsSet.add(itemId); else completedItemsSet.delete(itemId);
        enrollment.progress.completedItems = Array.from(completedItemsSet);

        let totalItems = 0;
        course.sections.forEach(section => {
            section.lessons.forEach(lesson => {
                totalItems++; // For lesson content
                if (lesson.quiz && lesson.quiz.length > 0) totalItems++; // For quiz
            });
        });
        enrollment.progress.percentage = totalItems > 0 ? Math.round((completedItemsSet.size / totalItems) * 100) : 0;

        if (enrollment.progress.percentage === 100 && enrollment.status === 'enrolled') {
            enrollment.status = 'completed';
            const existingCert = await Certificate.findOne({ userId: req.user.userId, courseId: course._id });
            if (!existingCert) {
                const newCert = new Certificate({ userId: req.user.userId, courseId: course._id });
                await newCert.save();
            }
        }
        await enrollment.save();
        res.json({ message: 'Progress updated.', progress: enrollment.progress, status: enrollment.status });
    } catch (error) { res.status(500).json({ message: 'Error updating progress', error: error.message }); }
});

// Quiz Submission
app.post('/api/quizzes/submit', authenticateToken, async (req, res) => {
    try {
        const { courseId, sectionIndex, lessonIndex, enrollmentId, answers } = req.body;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found.' });
        const section = course.sections[sectionIndex];
        const lesson = section?.lessons[lessonIndex];
        if (!lesson || !lesson.quiz || lesson.quiz.length === 0) return res.status(400).json({ message: 'Quiz not found for this lesson.' });

        let correctAnswersCount = 0;
        lesson.quiz.forEach((question, qIdx) => {
            const userAnswerIndex = parseInt(answers[`q${qIdx}_s${sectionIndex}_l${lessonIndex}`]);
            if (userAnswerIndex === question.correctAnswerIndex) {
                correctAnswersCount++;
            }
        });
        const score = Math.round((correctAnswersCount / lesson.quiz.length) * 100);
        const passed = score >= 70; // Example passing score

        const enrollment = await Enrollment.findById(enrollmentId);
        if (!enrollment || enrollment.userId.toString() !== req.user.userId) return res.status(403).json({ message: 'Unauthorized or enrollment not found.' });
         if (enrollment.status !== 'enrolled' && enrollment.status !== 'completed') {
             return res.status(400).json({ message: 'Cannot submit quiz for non-enrolled/non-completed course.' });
        }

        if (passed) {
            const quizItemId = `s${sectionIndex}_l${lessonIndex}_quiz`;
            if (!enrollment.progress) enrollment.progress = { completedItems: [], percentage: 0 };
            const completedItemsSet = new Set(enrollment.progress.completedItems);
            completedItemsSet.add(quizItemId);
            enrollment.progress.completedItems = Array.from(completedItemsSet);

            let totalItems = 0;
            course.sections.forEach(s => s.lessons.forEach(l => { totalItems++; if (l.quiz && l.quiz.length > 0) totalItems++; }));
            enrollment.progress.percentage = totalItems > 0 ? Math.round((completedItemsSet.size / totalItems) * 100) : 0;

            if (enrollment.progress.percentage === 100 && enrollment.status === 'enrolled') {
                enrollment.status = 'completed';
                const existingCert = await Certificate.findOne({ userId: req.user.userId, courseId: course._id });
                if (!existingCert) {
                    const newCert = new Certificate({ userId: req.user.userId, courseId: course._id });
                    await newCert.save();
                }
            }
            await enrollment.save();
        }
        res.json({ message: `Quiz submitted! Score: ${score}%. ${passed ? 'You passed!' : 'Please try again.'}`, score, passed, progress: enrollment.progress, status: enrollment.status });
    } catch (error) { res.status(500).json({ message: 'Error submitting quiz.', error: error.message }); }
});


// Reviews
app.post('/api/courses/:courseId/reviews', authenticateToken, async (req, res) => {
    try {
        const { rating, reviewText } = req.body;
        const courseId = req.params.courseId;
        const userId = req.user.userId;

        const enrollment = await Enrollment.findOne({ userId, courseId, status: { $in: ['enrolled', 'completed'] } });
        if (!enrollment) return res.status(403).json({ message: 'Must be enrolled and active/completed to review this course.' });

        const existingReview = await Review.findOne({ userId, courseId });
        if (existingReview) return res.status(400).json({ message: 'You have already reviewed this course.' });

        const review = new Review({ userId, courseId, rating, reviewText });
        await review.save();

        // Update course average rating
        const reviews = await Review.find({ courseId });
        const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0);
        const course = await Course.findById(courseId);
        course.rating = reviews.length > 0 ? (totalRating / reviews.length) : 0;
        await course.save();

        res.status(201).json({ message: 'Review submitted successfully.', review });
    } catch (error) { res.status(500).json({ message: 'Error submitting review.', error: error.message }); }
});

app.put('/api/courses/:courseId/reviews/:reviewId/toggle-flag', authenticateToken, checkRole(['instructor', 'admin']), async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId).populate('courseId');
        if (!review) return res.status(404).json({ message: 'Review not found.' });

        // If instructor, check if they own the course
        if (req.user.role === 'instructor' && review.courseId.instructor.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Not authorized to flag reviews for this course.' });
        }
        // Admins can flag any review

        review.isFlagged = !review.isFlagged;
        await review.save();
        res.json({ message: `Review ${review.isFlagged ? 'flagged' : 'unflagged'} successfully.`, review });
    } catch (error) { res.status(500).json({ message: 'Error toggling review flag.', error: error.message }); }
});



// Instructor Routes
app.get('/api/instructor/courses', authenticateToken, checkRole(['instructor', 'admin']), async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user.userId }).sort({ createdAt: -1 });
        res.json(courses.map(c => ({ ...c._doc, id: c._id })));
    } catch (error) { res.status(500).json({ message: 'Error fetching instructor courses', error: error.message }); }
});

app.get('/api/instructor/dashboard-summary', authenticateToken, checkRole(['instructor', 'admin']), async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user.userId });
        const courseIds = courses.map(c => c._id);
        const enrollments = await Enrollment.find({ courseId: { $in: courseIds }, status: { $in: ['enrolled', 'completed'] } });
        const totalRevenue = courses.reduce((sum, course) => {
            const courseEnrollments = enrollments.filter(e => e.courseId.equals(course._id));
            return sum + (courseEnrollments.length * course.price);
        }, 0);
        const averageRating = courses.length > 0 ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.filter(c=>c.rating>0).length || 0) : 0;

        res.json({
            totalCourses: courses.length,
            totalEnrollments: enrollments.length,
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            averageRating: parseFloat(averageRating.toFixed(1)) || null,
        });
    } catch (error) { res.status(500).json({ message: 'Error fetching summary', error: error.message }); }
});

app.get('/api/instructor/enrollments', authenticateToken, checkRole(['instructor', 'admin']), async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user.userId }, '_id');
        const courseIds = courses.map(c => c._id);
        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
            .populate('userId', 'name email')
            .populate('courseId', 'title')
            .sort({ enrolledDate: -1 });
        res.json(enrollments.map(e => ({
            enrollmentId: e._id,
            courseTitle: e.courseId.title,
            userName: e.userId.name,
            userEmail: e.userId.email,
            progressPercentage: e.progress ? e.progress.percentage : 0,
            enrollmentStatus: e.status,
            enrolledDate: e.enrolledDate
        })));
    } catch (error) { res.status(500).json({ message: 'Error fetching enrollments', error: error.message }); }
});
app.get('/api/instructor/reviews', authenticateToken, checkRole(['instructor', 'admin']), async (req, res) => {
    try {
        const courses = await Course.find({ instructor: req.user.userId }, '_id');
        const courseIds = courses.map(c => c._id);
        const reviews = await Review.find({ courseId: { $in: courseIds } })
            .populate('userId', 'name')
            .populate('courseId', 'title')
            .sort({ date: -1 });
        res.json(reviews.map(r => ({
            reviewId: r._id,
            courseId: r.courseId._id,
            courseTitle: r.courseId.title,
            userName: r.userId ? r.userId.name : 'Anonymous',
            rating: r.rating,
            reviewText: r.reviewText,
            date: r.date,
            isFlagged: r.isFlagged
        })));
    } catch (error) { res.status(500).json({ message: 'Error fetching reviews for instructor', error: error.message }); }
});

// Admin Routes
app.get('/api/admin/users', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.json(users.map(u => ({
            id: u._id, name: u.name, email: u.email, role: u.role,
            isGoogleUser: u.googleId ? 'Yes' : 'No',
            joined: u.createdAt, isBlocked: u.isBlocked
        })));
    } catch (error) { res.status(500).json({ message: 'Error fetching users', error: error.message }); }
});

app.put('/api/admin/users/:userId/toggle-block', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        if (user.email === 'admin@skillshare.hub') return res.status(403).json({ message: 'Cannot block the default admin user.' });
        user.isBlocked = !user.isBlocked;
        await user.save();
        res.json({ message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully.`, isBlocked: user.isBlocked });
    } catch (error) { res.status(500).json({ message: 'Error toggling user block status', error: error.message }); }
});

app.delete('/api/admin/users/:userId', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        if (user.email === 'admin@skillshare.hub') return res.status(403).json({ message: 'Cannot delete the default admin user.' });
        if (user.role === 'instructor') {
            const courses = await Course.find({ instructor: user._id });
            if (courses.length > 0) return res.status(400).json({ message: 'Cannot delete instructor with active courses. Reassign or delete courses first.' });
        }
        await Enrollment.deleteMany({ userId: user._id });
        await Review.deleteMany({ userId: user._id });
        await Certificate.deleteMany({ userId: user._id });
        await User.findByIdAndDelete(user._id);
        res.json({ message: 'User and all associated data deleted successfully.' });
    } catch (error) { res.status(500).json({ message: 'Error deleting user', error: error.message }); }
});

app.get('/api/admin/courses', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const courses = await Course.find({}).populate('instructor', 'name').sort({ createdAt: -1 });
        const courseData = [];
        for (const course of courses) {
            const enrollments = await Enrollment.find({ courseId: course._id, status: { $in: ['enrolled', 'completed'] } });
            const revenueGenerated = enrollments.length * course.price;
            courseData.push({
                ...course._doc, id: course._id, instructorName: course.instructor.name,
                enrollmentCount: enrollments.length,
                revenueGenerated: parseFloat(revenueGenerated.toFixed(2))
            });
        }
        res.json(courseData);
    } catch (error) { res.status(500).json({ message: 'Error fetching courses for admin', error: error.message }); }
});

app.delete('/api/admin/courses/:courseId', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found.' });
        // Add logic for Cloudinary asset deletion if needed
        await Enrollment.deleteMany({ courseId });
        await Review.deleteMany({ courseId });
        await Certificate.deleteMany({ courseId });
        await Course.findByIdAndDelete(courseId);
        res.json({ message: 'Course and all associated data deleted successfully.' });
    } catch (error) { res.status(500).json({ message: 'Error deleting course', error: error.message }); }
});

app.get('/api/admin/reviews', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate('userId', 'name email')
            .populate('courseId', 'title')
            .sort({ date: -1 });
        res.json(reviews.map(r => ({
            id: r._id, courseId: r.courseId._id, courseTitle: r.courseId.title,
            userName: r.userId ? r.userId.name : 'Anonymous', userEmail: r.userId ? r.userId.email : 'N/A',
            rating: r.rating, reviewText: r.reviewText, date: r.date, isFlagged: r.isFlagged
        })));
    } catch (error) { res.status(500).json({ message: 'Error fetching reviews for admin', error: error.message }); }
});

app.put('/api/admin/reviews/:reviewId/edit', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const { reviewText } = req.body;
        if (!reviewText || reviewText.trim() === '') return res.status(400).json({ message: 'Review text cannot be empty.' });
        const review = await Review.findByIdAndUpdate(req.params.reviewId, { reviewText }, { new: true });
        if (!review) return res.status(404).json({ message: 'Review not found.' });
        res.json({ message: 'Review updated successfully.', review });
    } catch (error) { res.status(500).json({ message: 'Error updating review', error: error.message }); }
});

app.put('/api/admin/reviews/:reviewId/toggle-flag', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found.' });
        review.isFlagged = !review.isFlagged;
        await review.save();
        res.json({ message: `Review ${review.isFlagged ? 'flagged' : 'unflagged'} successfully.`, review });
    } catch (error) { res.status(500).json({ message: 'Error toggling review flag by admin', error: error.message }); }
});

app.delete('/api/admin/reviews/:reviewId', authenticateToken, checkRole(['admin']), async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found.' });
        // Update course average rating
        const reviews = await Review.find({ courseId: review.courseId });
        const totalRating = reviews.reduce((acc, item) => acc + item.rating, 0);
        const course = await Course.findById(review.courseId);
        if(course) {
            course.rating = reviews.length > 0 ? (totalRating / reviews.length) : 0;
            await course.save();
        }
        res.json({ message: 'Review deleted successfully.' });
    } catch (error) { res.status(500).json({ message: 'Error deleting review', error: error.message }); }
});

console.log('[SERVER_LOG] All API routes defined.');


// Serve frontend static files in production-like local setup or Vercel
if (process.env.NODE_ENV === 'production' || true) { // Keep true for Vercel and local prod testing
    console.log('[SERVER_LOG] Serving static files from ../dist');
    app.use(express.static(path.join(__dirname, '../dist')));
    // Catch-all for SPA routing
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api/')) { // Don't interfere with API routes
            console.log(`[SERVER_LOG] SPA Fallback: Serving index.html for path ${req.path}`);
            res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
        } else {
            // If it's an API route not caught by others, it's a 404 for the API
            console.log(`[SERVER_LOG] API route not found: ${req.path}`);
            res.status(404).json({ message: 'API endpoint not found' });
        }
    });
}

console.log('[SERVER_LOG] Static file serving and SPA fallback configured (if applicable).');

// Global error handlers (optional, but good for catching unhandled issues)
process.on('unhandledRejection', (reason, promise) => {
  console.error('[SERVER_LOG_PROCESS] Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (error) => {
  console.error('[SERVER_LOG_PROCESS] Uncaught Exception:', error);
  // Application specific logging, shutdown, or other logic here
  // For critical errors, it's often best to let the process exit
  // process.exit(1); // Or use a more graceful shutdown
});

// Start server
app.listen(PORT, () => {
    console.log(`[SERVER_LOG] Server running on port ${PORT}`);
    console.log(`[SERVER_LOG] Frontend URL (for CORS & redirects): ${FRONTEND_URL}`);
    console.log(`[SERVER_LOG] Backend ready. Current NODE_ENV: ${process.env.NODE_ENV}`);
});
