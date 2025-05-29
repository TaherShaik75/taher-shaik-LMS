// backend/server.js
console.log('[SERVER_LOG] Attempting to load server.js module...'); // NEW LOG
console.log('[SERVER_LOG] NODE_ENV:', process.env.NODE_ENV); // NEW LOG
console.log('[SERVER_LOG] PORT from env:', process.env.PORT); // NEW LOG
console.log('[SERVER_LOG] MONGODB_URI from env (server.js check):', process.env.MONGODB_URI ? 'Exists' : 'MISSING or UNDEFINED'); // NEW LOG
console.log('[SERVER_LOG] JWT_SECRET from env (server.js check):', process.env.JWT_SECRET ? 'Exists' : 'MISSING or UNDEFINED'); // NEW LOG
console.log('[SERVER_LOG] FRONTEND_URL from env (server.js check):', process.env.FRONTEND_URL ? 'Exists' : 'MISSING or UNDEFINED'); // NEW LOG
console.log('[SERVER_LOG] GOOGLE_CLIENT_ID from env (server.js check):', process.env.GOOGLE_CLIENT_ID ? 'Exists' : 'MISSING or UNDEFINED');
console.log('[SERVER_LOG] GOOGLE_CLIENT_SECRET from env (server.js check):', process.env.GOOGLE_CLIENT_SECRET ? 'Exists' : 'MISSING or UNDEFINED');
console.log('[SERVER_LOG] GOOGLE_CALLBACK_URL from env (server.js check):', process.env.GOOGLE_CALLBACK_URL ? 'Exists' : 'MISSING or UNDEFINED');
console.log('[SERVER_LOG] CLOUDINARY_CLOUD_NAME from env (server.js check):', process.env.CLOUDINARY_CLOUD_NAME ? 'Exists' : 'MISSING or UNDEFINED');
console.log('[SERVER_LOG] CLOUDINARY_API_KEY from env (server.js check):', process.env.CLOUDINARY_API_KEY ? 'Exists' : 'MISSING or UNDEFINED');
console.log('[SERVER_LOG] CLOUDINARY_API_SECRET from env (server.js check):', process.env.CLOUDINARY_API_SECRET ? 'Exists' : 'MISSING or UNDEFINED');


const express = require('express');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
const cors = require('cors');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const path = require('path'); // Added for serving static files

console.log('[SERVER_LOG] Modules required successfully.');

const connectDB = require('./db');
const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Review = require('./models/Review');
const Certificate = require('./models/Certificate'); 

console.log('[SERVER_LOG] Attempting to connect to DB...');
connectDB().then(() => {
    console.log('[SERVER_LOG] DB connection attempt finished (check DB_LOG for status).');
}).catch(err => {
    console.error('[SERVER_LOG] CRITICAL DB connection error during initial call:', err.message, err.stack);
    // For Vercel, maybe don't exit immediately to see if other logs can appear
    // process.exit(1); 
}); 

const app = express();
console.log('[SERVER_LOG] Express app initialized.');


if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });
    console.log('[SERVER_LOG] Cloudinary configured successfully.');
} else {
    console.warn('[SERVER_LOG] Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not fully set. File uploads to Cloudinary will fail.');
}

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-jwt-secret-key-change-me-in-env';
if (JWT_SECRET === 'your-default-jwt-secret-key-change-me-in-env') {
    console.warn('[SERVER_LOG] WARNING: JWT_SECRET is using the default insecure value. Set this in your Vercel environment variables!');
}
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173/frontend/index.html';

console.log(`[SERVER_LOG] Config: PORT=${PORT}, FRONTEND_URL=${FRONTEND_URL}`);


const storage = multer.memoryStorage();
const upload = multer({ storage: storage }); 

const streamUploadToCloudinary = (fileBuffer, folderName = 'skillsharehub_uploads', resourceType = 'auto') => {
    return new Promise((resolve, reject) => {
        if (!cloudinary.config().cloud_name) {
            console.error('[SERVER_LOG] Cloudinary not configured during streamUpload call.');
            return reject(new Error('Cloudinary not configured.'));
        }
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: folderName, resource_type: resourceType },
            (error, result) => {
                if (result) resolve(result);
                else reject(error || new Error('Cloudinary upload failed.'));
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};

const initializeAdminUser = async () => {
    console.log('[SERVER_LOG] Initializing admin user check...');
    try {
        const adminEmail = 'admin@skillshare.hub';
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const adminPassword = 'admin123';
            const newAdmin = new User({ name: 'Admin User', email: adminEmail, password: adminPassword, role: 'admin' });
            await newAdmin.save();
            console.log(`[SERVER_LOG] Default admin user '${adminEmail}' initialized.`);
        } else {
            console.log(`[SERVER_LOG] Admin user '${adminEmail}' already exists.`);
        }
    } catch (err) {
        console.error("[SERVER_LOG] Error initializing admin user:", err.message);
    }
};
initializeAdminUser();

app.use(cors());
console.log('[SERVER_LOG] CORS middleware enabled.');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('[SERVER_LOG] JSON and URLencoded body parsers enabled.');
app.use(passport.initialize());
console.log('[SERVER_LOG] Passport initialized.');


if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ['profile', 'email']
      },
      async (accessToken, refreshToken, profile, done) => {
        console.log('[SERVER_LOG] Google OAuth callback invoked.');
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
              user.googleId = profile.id;
              await user.save();
            } else {
              user = new User({ googleId: profile.id, name: profile.displayName, email: profile.emails[0].value, role: 'learner' });
              await user.save();
            }
          }
          return done(null, user);
        } catch (error) {
          console.error('[SERVER_LOG] Error in Google OAuth strategy:', error);
          return done(error, null);
        }
      }
    ));
    console.log('[SERVER_LOG] Google OAuth strategy configured.');
} else {
    console.warn("[SERVER_LOG] Google OAuth environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL) not fully set. Google Sign-In will not work.");
}

// Serve static files from the frontend build directory
// The path is relative from 'backend/server.js' to the 'dist' folder in the project root
const staticPath = path.join(__dirname, '../dist');
console.log(`[SERVER_LOG] Serving static files from: ${staticPath}`);
app.use(express.static(staticPath));


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, JWT_SECRET, (err, userPayload) => {
        if (err) {
            console.warn('[SERVER_LOG] JWT verification failed:', err.message);
            return res.sendStatus(403);
        }
        req.user = userPayload;
        next();
    });
};
const checkRole = (roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        console.warn(`[SERVER_LOG] Role check failed for user ${req.user?.email}. Required: ${roles}, User role: ${req.user?.role}`);
        return res.status(403).json({ message: `Access denied.` });
    }
    next();
};

app.post('/api/auth/signup', async (req, res) => {
    console.log('[SERVER_LOG] POST /api/auth/signup request received.');
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) return res.status(400).json({ message: 'All fields are required.' });
        if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists with this email.' });
        const newUser = new User({ name, email, password, role });
        await newUser.save();
        res.status(201).json({ message: 'User created successfully. Please login.'});
    } catch (error) { 
        if (error.code === 11000) return res.status(400).json({ message: 'Email already in use.' });
        if (error.name === 'ValidationError') return res.status(400).json({ message: "Validation Error: " + error.message });
        console.error("[SERVER_LOG] Signup Error:", error); res.status(500).json({ message: 'Server error.' }); 
    }
});
app.post('/api/auth/login', async (req, res) => {
    console.log('[SERVER_LOG] POST /api/auth/login request received.');
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials.' });
        if (user.isBlocked) return res.status(403).json({ message: 'Your account has been blocked. Please contact support.'});
        if (!user.password && user.googleId) return res.status(401).json({ message: 'This account uses Google Sign-In.' });
        if (!user.password) return res.status(401).json({ message: 'Account issue.' });
        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });
        const tokenPayload = { userId: user._id.toString(), name: user.name, email: user.email, role: user.role };
        const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login successful!', token, user: tokenPayload });
    } catch (error) { console.error("[SERVER_LOG] Login Error:", error); res.status(500).json({ message: 'Server error.' }); }
});
app.get('/api/auth/google', (req,res,next)=>{ 
    console.log('[SERVER_LOG] GET /api/auth/google request received.');
    if(!process.env.GOOGLE_CLIENT_ID) {
        console.error('[SERVER_LOG] Google OAuth not configured, client ID missing.');
        return res.status(500).send('Google OAuth not configured.');
    }
    passport.authenticate('google',{scope:['profile','email'],session:false})(req,res,next);
});
app.get('/api/auth/google/callback', passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}#login?oauth_error=true`, session: false }), (req, res) => {
    console.log('[SERVER_LOG] GET /api/auth/google/callback request received.');
    const user = req.user;
    const tokenPayload = { userId: user._id.toString(), name: user.name, email: user.email, role: user.role };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '1h' });
    
    const redirectBase = process.env.NODE_ENV === 'production' ? '/' : FRONTEND_URL;
    console.log(`[SERVER_LOG] OAuth successful. Redirecting to: ${redirectBase}#oauth_callback with token.`);
    res.redirect(`${redirectBase}#oauth_callback?token=${token}&user=${encodeURIComponent(JSON.stringify(tokenPayload))}`);
});

app.get('/api/dashboard/enrolled-courses', authenticateToken, async (req, res) => {
    console.log('[SERVER_LOG] GET /api/dashboard/enrolled-courses request received.');
    try {
        const enrollments = await Enrollment.find({ userId: req.user.userId }).populate({ path: 'courseId', select: 'title thumbnailUrl instructorName price rating' });
        const courses = enrollments.map(e => e.courseId ? ({ ...e.courseId.toObject(), id: e.courseId._id.toString(), progress: e.progress.percentage, enrollmentStatus: e.status }) : null).filter(Boolean);
        res.json(courses);
    } catch (e) { console.error("[SERVER_LOG] Error enrolled-courses:", e); res.status(500).json({ message: e.message }); }
});
app.get('/api/dashboard/my-reviews', authenticateToken, async (req, res) => {
    console.log('[SERVER_LOG] GET /api/dashboard/my-reviews request received.');
    try {
        const userReviews = await Review.find({ userId: req.user.userId }).populate('courseId', 'title');
        const formattedReviews = userReviews.map(review => ({ reviewId: review._id.toString(), courseId: review.courseId._id.toString(), courseTitle: review.courseId.title, rating: review.rating, reviewText: review.reviewText, date: review.createdAt, isFlagged: review.isFlagged }));
        res.json(formattedReviews);
    } catch (e) { console.error("[SERVER_LOG] Error my-reviews:", e); res.status(500).json({ message: e.message }); }
});
app.get('/api/dashboard/my-certificates', authenticateToken, async (req, res) => { 
    console.log('[SERVER_LOG] GET /api/dashboard/my-certificates request received.');
    try {
        const userCertificates = await Certificate.find({userId: req.user.userId}).populate('courseId', 'title');
        const formattedCerts = userCertificates.map(cert => ({
            id: cert._id.toString(),
            courseId: cert.courseId?._id?.toString(), 
            userId: cert.userId?.toString(), 
            courseTitle: cert.courseId ? cert.courseId.title : 'Course Title Unavailable',
            issueDate: cert.issueDate,
            certificateUrl: cert.certificateUrl
        }));
        res.json(formattedCerts);
    } catch(e){ console.error("[SERVER_LOG] Error my-certificates:", e); res.status(500).json({message: e.message}); }
});

app.get('/api/courses', async (req, res) => {
    console.log('[SERVER_LOG] GET /api/courses request received with query:', req.query);
    try {
        const { query, category, price, instructorId } = req.query;
        const filter = {};
        if (query) {
            const searchTerm = new RegExp(query, 'i');
            filter.$or = [{ title: searchTerm }, { description: searchTerm }, { instructorName: searchTerm }, { tags: searchTerm }];
        }
        if (category) filter.category = category;
        if (price) {
            if (price === 'free') filter.price = 0;
            else if (price === 'paid') filter.price = { $gt: 0 };
        }
        if (instructorId) filter.instructor = instructorId;
        const coursesFound = await Course.find(filter).sort({ createdAt: -1 });
        const coursesWithFrontendId = coursesFound.map(course => ({ ...course.toObject(), id: course._id.toString(), instructor: course.instructorName }));
        res.json(coursesWithFrontendId);
    } catch (e) { console.error("[SERVER_LOG] Error GET /api/courses:", e); res.status(500).json({ message: e.message }); }
});
app.get('/api/courses/:id', async (req, res) => {
    console.log(`[SERVER_LOG] GET /api/courses/${req.params.id} request received.`);
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        let enrollmentData = null;
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                if (decoded && decoded.userId) {
                    const enrollment = await Enrollment.findOne({ userId: decoded.userId, courseId: course._id });
                    if (enrollment) enrollmentData = { id: enrollment._id.toString(), status: enrollment.status, progress: enrollment.progress };
                }
            } catch (jwtError) { console.log("[SERVER_LOG] JWT error on public course view (ignorable):", jwtError.message); }
        }
        const courseReviews = await Review.find({ courseId: req.params.id }).populate('userId', 'name').sort({ createdAt: -1 });
        const formattedReviews = courseReviews.map(r => ({ ...r.toObject(), id:r._id.toString(), reviewerName: r.userId?.name || 'Anonymous', isFlagged: r.isFlagged }));
        res.json({ ...course.toObject(), id: course._id.toString(), reviews: formattedReviews, enrollment: enrollmentData });
    } catch (e) { 
        if (e.kind === 'ObjectId') return res.status(404).json({ message: 'Course not found.' });
        console.error("[SERVER_LOG] Error GET /api/courses/:id:", e); 
        res.status(500).json({ message: e.message }); 
    }
});

async function processCourseContentFiles(sectionsDataParam, filesFromRequest) {
    console.log('[SERVER_LOG] processCourseContentFiles called.');
    if (!filesFromRequest || filesFromRequest.length === 0) return sectionsDataParam;
    const sectionsData = JSON.parse(JSON.stringify(sectionsDataParam));
    for (let sIdx = 0; sIdx < sectionsData.length; sIdx++) {
        if (sectionsData[sIdx].lessons) for (let lIdx = 0; lIdx < sectionsData[sIdx].lessons.length; lIdx++) {
            const lesson = sectionsData[sIdx].lessons[lIdx];
            const videoFile = filesFromRequest.find(f => f.fieldname === `lesson_s${sIdx}_l${lIdx}_videoFile`);
            if (videoFile) try { lesson.videoUrl = (await streamUploadToCloudinary(videoFile.buffer, 'course_content/lesson_videos', 'video')).secure_url; console.log(`[SERVER_LOG] Uploaded video for S${sIdx}L${lIdx}`); } catch (e) { console.error(`[SERVER_LOG] Upload Error (Video S${sIdx}L${lIdx}):`, e.message); }
            if (lesson.resources) for (let rIdx = 0; rIdx < lesson.resources.length; rIdx++) {
                const resourceFile = filesFromRequest.find(f => f.fieldname === `resource_s${sIdx}_l${lIdx}_r${rIdx}_file`);
                if (resourceFile) try { lesson.resources[rIdx].url = (await streamUploadToCloudinary(resourceFile.buffer, 'course_content/lesson_resources')).secure_url; console.log(`[SERVER_LOG] Uploaded resource for S${sIdx}L${lIdx}R${rIdx}`);} catch (e) { console.error(`[SERVER_LOG] Upload Error (Resource S${sIdx}L${lIdx}R${rIdx}):`, e.message); }
            }
        }
    }
    return sectionsData;
}

app.post('/api/courses', authenticateToken, checkRole(['instructor', 'admin']), upload.any(), async (req, res) => {
    console.log('[SERVER_LOG] POST /api/courses request received.');
    try {
        const { title, description, category, price, tags } = req.body;
        let sectionsData = [];
        if (!title || !description || !category) return res.status(400).json({ message: 'Title, description, and category are required.' });
        if (req.body.sections) {
            try { sectionsData = JSON.parse(req.body.sections); }
            catch (parseError) { console.error("[SERVER_LOG] Parse Error Sections (Create):", parseError); return res.status(400).json({ message: 'Invalid sections data format.' }); }
        }
        let thumbnailUrl = '';
        const thumbnailImageFile = req.files ? req.files.find(f => f.fieldname === 'thumbnailImage') : null;
        if (thumbnailImageFile) {
            try {
                const result = await streamUploadToCloudinary(thumbnailImageFile.buffer, 'course_thumbnails');
                thumbnailUrl = result.secure_url;
                 console.log('[SERVER_LOG] Course thumbnail uploaded to Cloudinary.');
            } catch (uploadError) { console.error("[SERVER_LOG] Cloudinary Upload Error (Thumbnail):", uploadError.message); }
        }
        sectionsData = await processCourseContentFiles(sectionsData, req.files);
        const newCourseData = {
            instructor: req.user.userId, instructorName: req.user.name, title, description, category,
            price: parseFloat(price) || 0, thumbnailUrl,
            tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            sections: sectionsData,
        };
        const newCourse = await Course.create(newCourseData);
        res.status(201).json({...newCourse.toObject(), id: newCourse._id.toString()});
    } catch (error) {
        console.error("[SERVER_LOG] Error creating course:", error);
        if (error.name === 'ValidationError') return res.status(400).json({ message: "Validation Error: " + Object.values(error.errors).map(val => val.message).join(', ') });
        res.status(500).json({ message: "Failed to create course." });
    }
});
app.put('/api/courses/:id', authenticateToken, checkRole(['instructor', 'admin']), upload.any(), async (req, res) => {
    console.log(`[SERVER_LOG] PUT /api/courses/${req.params.id} request received.`);
    try {
        const courseId = req.params.id;
        const { title, description, category, price, tags } = req.body;
        let sectionsData;
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found.' });
        if (course.instructor.toString() !== req.user.userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this course.' });
        }
        if (req.body.sections) {
            try { sectionsData = JSON.parse(req.body.sections); }
            catch (parseError) { console.error("[SERVER_LOG] Parse Error Sections (Edit):", parseError); return res.status(400).json({ message: 'Invalid sections data format for update.' }); }
        } else {
            sectionsData = course.sections; 
        }
        let thumbnailUrl = course.thumbnailUrl; 
        const thumbnailImageFile = req.files ? req.files.find(f => f.fieldname === 'thumbnailImage') : null;
        if (thumbnailImageFile) {
            try {
                const result = await streamUploadToCloudinary(thumbnailImageFile.buffer, 'course_thumbnails');
                thumbnailUrl = result.secure_url;
                console.log(`[SERVER_LOG] Course thumbnail updated on Cloudinary for course ${courseId}.`);
            } catch (uploadError) { console.error(`[SERVER_LOG] Cloudinary Upload Error (Thumbnail Update Course ${courseId}):`, uploadError.message); }
        }
        sectionsData = await processCourseContentFiles(sectionsData, req.files); 
        course.title = title || course.title;
        course.description = description || course.description;
        course.category = category || course.category;
        course.price = (price !== undefined && !isNaN(parseFloat(price))) ? parseFloat(price) : course.price;
        course.tags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : course.tags;
        course.thumbnailUrl = thumbnailUrl; 
        course.sections = sectionsData;
        const updatedCourse = await course.save();
        res.json({...updatedCourse.toObject(), id: updatedCourse._id.toString()});
    } catch (error) {
        console.error("[SERVER_LOG] Error updating course:", error);
        if (error.name === 'ValidationError') return res.status(400).json({ message: "Validation Error: " + Object.values(error.errors).map(val => val.message).join(', ') });
        if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Course not found (invalid ID format for update)' });
        res.status(500).json({ message: "Failed to update course." });
    }
});
app.post('/api/courses/:courseId/reviews', authenticateToken, async (req, res) => {
    console.log(`[SERVER_LOG] POST /api/courses/${req.params.courseId}/reviews request received.`);
    try {
        const { courseId } = req.params;
        const { rating, reviewText } = req.body;
        const userId = req.user.userId;
        if (!rating || !reviewText) return res.status(400).json({ message: 'Rating and review text are required.' });
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found.' });
        const existingReview = await Review.findOne({ userId, courseId });
        if (existingReview) return res.status(400).json({ message: 'You have already reviewed this course.' });
        const newReview = await Review.create({ userId, courseId, rating: parseInt(rating), reviewText, isFlagged: false }); // isFlagged default
        const courseReviews = await Review.find({ courseId });
        const totalRating = courseReviews.reduce((sum, rev) => sum + rev.rating, 0);
        course.rating = courseReviews.length > 0 ? parseFloat((totalRating / courseReviews.length).toFixed(1)) : 0;
        await course.save();
        res.status(201).json({ ...newReview.toObject(), id: newReview._id.toString(), isFlagged: newReview.isFlagged});
    } catch (error) {
        console.error("[SERVER_LOG] Error submitting review:", error);
        if (error.name === 'ValidationError') return res.status(400).json({ message: "Validation Error: " + Object.values(error.errors).map(val => val.message).join(', ') });
        res.status(500).json({ message: "Failed to submit review." });
    }
});

app.put('/api/courses/:courseId/reviews/:reviewId/toggle-flag', authenticateToken, async (req, res) => {
    console.log(`[SERVER_LOG] PUT /api/courses/${req.params.courseId}/reviews/${req.params.reviewId}/toggle-flag request received.`);
    try {
        const { courseId, reviewId } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        const review = await Review.findById(reviewId).populate('courseId');
        if (!review) return res.status(404).json({ message: 'Review not found.' });
        if (review.courseId._id.toString() !== courseId) return res.status(400).json({ message: 'Review does not belong to this course.' });

        const course = review.courseId; // Populated course
        if (course.instructor.toString() !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to flag this review.' });
        }

        review.isFlagged = !review.isFlagged;
        await review.save();
        res.json({ message: `Review ${review.isFlagged ? 'flagged' : 'unflagged'} successfully.`, review });
    } catch (error) {
        console.error("[SERVER_LOG] Error toggling review flag:", error);
        res.status(500).json({ message: 'Failed to update review flag status.' });
    }
});


app.post('/api/enrollments', authenticateToken, async (req, res) => {
    console.log('[SERVER_LOG] POST /api/enrollments request received.');
    try {
        const { courseId } = req.body;
        const userId = req.user.userId;
        if (!courseId) return res.status(400).json({ message: 'Course ID required.' });
        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found.' });
        
        let existingEnrollment = await Enrollment.findOne({ userId, courseId });
        if (existingEnrollment) {
            // If it's a paid course and status is pending_payment, allow re-entry to payment flow
            if (course.price > 0 && existingEnrollment.status === 'pending_payment') {
                return res.status(200).json({ 
                    message: 'Enrollment pending payment. Proceed to payment.', 
                    enrollment: {...existingEnrollment.toObject(), id: existingEnrollment._id.toString()} 
                });
            }
            return res.status(200).json({ 
                message: 'Already enrolled.', 
                enrollment: {...existingEnrollment.toObject(), id: existingEnrollment._id.toString()} 
            });
        }

        let status = 'enrolled';
        if (course.price > 0) {
            status = 'pending_payment';
        }
        
        const newEnrollment = await Enrollment.create({ 
            userId, 
            courseId, 
            status, 
            progress: { completedItems: [], percentage: 0 } 
        });
        
        let responseMessage = status === 'pending_payment' ? 'Enrollment initiated, proceed to payment.' : 'Successfully enrolled!';
        res.status(201).json({ message: responseMessage, enrollment: {...newEnrollment.toObject(), id: newEnrollment._id.toString()} });

    } catch (e) { 
        console.error("[SERVER_LOG] Error in /api/enrollments:", e);
        if (e.code === 11000) { 
             return res.status(409).json({ message: 'Enrollment conflict. You might already be enrolled.' });
        }
        if (!res.headersSent) res.status(500).json({ message: e.message || "Enrollment failed." });
    }
});

app.put('/api/enrollments/:enrollmentId/confirm-payment', authenticateToken, async (req, res) => {
    console.log(`[SERVER_LOG] PUT /api/enrollments/${req.params.enrollmentId}/confirm-payment request received.`);
    try {
        const { enrollmentId } = req.params;
        const userId = req.user.userId;

        const enrollment = await Enrollment.findById(enrollmentId);
        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found.' });
        if (enrollment.userId.toString() !== userId) return res.status(403).json({ message: 'Not authorized.' });
        if (enrollment.status !== 'pending_payment') {
            return res.status(400).json({ message: 'Enrollment is not pending payment.' });
        }

        const course = await Course.findById(enrollment.courseId);
        if (!course || course.price <= 0) { // Double check if it was a paid course
            return res.status(400).json({ message: 'This enrollment does not require payment confirmation.' });
        }
        
        enrollment.status = 'enrolled';
        enrollment.paymentId = `MOCK_PAY_CONFIRMED_${Date.now()}`; // Mock payment ID
        
        // If somehow progress was 100% while pending, create certificate now.
        if (enrollment.progress && enrollment.progress.percentage === 100) {
            const existingCert = await Certificate.findOne({userId, courseId: enrollment.courseId});
            if(!existingCert) {
                await Certificate.create({ userId, courseId: enrollment.courseId, certificateUrl: `/#mock-certificate/${enrollment.courseId}/${userId}` });
                console.log(`[SERVER_LOG] Mock certificate created for user ${userId}, course ${enrollment.courseId} (payment confirmation).`);
            }
        }
        
        await enrollment.save();
        res.json({ message: 'Payment confirmed. Enrollment successful!', enrollment: {...enrollment.toObject(), id: enrollment._id.toString()} });

    } catch (e) {
        console.error("[SERVER_LOG] Error confirming payment:", e);
        res.status(500).json({ message: e.message || "Failed to confirm payment."});
    }
});


app.post('/api/enrollments/:enrollmentId/progress', authenticateToken, async (req, res) => {
    console.log(`[SERVER_LOG] POST /api/enrollments/${req.params.enrollmentId}/progress request received.`);
    try {
        const { enrollmentId } = req.params;
        const { itemId, completed } = req.body; 
        const userId = req.user.userId;
        const enrollment = await Enrollment.findById(enrollmentId);
        if (!enrollment) return res.status(404).json({ message: 'Enrollment not found.' });
        if (enrollment.userId.toString() !== userId) return res.status(403).json({ message: 'Not authorized.' });
        
        // Crucial: Only allow progress if enrollment is 'enrolled' or 'completed'
        if (enrollment.status === 'pending_payment') {
            return res.status(403).json({ message: 'Cannot update progress for an enrollment pending payment.' });
        }

        const course = await Course.findById(enrollment.courseId);
        if (!course) return res.status(404).json({ message: 'Associated course not found.' });
        
        if (!enrollment.progress) enrollment.progress = { completedItems: [], percentage: 0 }; 
        if (!enrollment.progress.completedItems) enrollment.progress.completedItems = []; 

        const completedItems = new Set(enrollment.progress.completedItems);
        if (completed) completedItems.add(itemId);
        else completedItems.delete(itemId);
        enrollment.progress.completedItems = Array.from(completedItems);

        let totalTrackableItems = 0;
        course.sections.forEach(section => {
            if (section.lessons) section.lessons.forEach(lesson => {
                totalTrackableItems++; 
                if (lesson.quiz && lesson.quiz.length > 0) totalTrackableItems++; 
            });
        });
        enrollment.progress.percentage = totalTrackableItems > 0 ? Math.min(100, Math.round((completedItems.size / totalTrackableItems) * 100)) : 0;

        if (enrollment.progress.percentage === 100 && enrollment.status === 'enrolled') { // Check status is 'enrolled' before changing to 'completed'
            enrollment.status = 'completed';
            const existingCert = await Certificate.findOne({userId, courseId: course._id});
            if(!existingCert) {
                await Certificate.create({ userId, courseId: course._id, certificateUrl: `/#mock-certificate/${course._id}/${userId}` }); 
                console.log(`[SERVER_LOG] Mock certificate created for user ${userId}, course ${course.title} (progress update)`);
            }
        }
        await enrollment.save();
        res.json({ message: 'Progress updated.', enrollment: {...enrollment.toObject(), id: enrollment._id.toString()} });
    } catch (e) { console.error("[SERVER_LOG] Error updating progress:", e); res.status(500).json({ message: e.message }); }
});

app.post('/api/quizzes/submit', authenticateToken, async (req, res) => {
    console.log('[SERVER_LOG] POST /api/quizzes/submit request received.');
    try {
        const { courseId, sectionIndex, lessonIndex, enrollmentId, answers } = req.body;
        const userId = req.user.userId;
        if (!courseId || sectionIndex == null || lessonIndex == null || !enrollmentId || !answers) return res.status(400).json({ message: 'Missing fields for quiz submission.' });
        const enrollment = await Enrollment.findById(enrollmentId);
        if (!enrollment || enrollment.userId.toString() !== userId) return res.status(403).json({ message: 'Not authorized.' });

        if (enrollment.status === 'pending_payment') {
            return res.status(403).json({ message: 'Cannot submit quiz for an enrollment pending payment.' });
        }

        const course = await Course.findById(courseId);
        if (!course || !course.sections || !course.sections[sectionIndex] || !course.sections[sectionIndex].lessons || !course.sections[sectionIndex].lessons[lessonIndex] || !course.sections[sectionIndex].lessons[lessonIndex].quiz) {
            return res.status(404).json({ message: 'Quiz, lesson, or section not found.' });
        }
        console.log(`[SERVER_LOG] Quiz submitted: Course ${courseId}, S${sectionIndex}L${lessonIndex}, User: ${userId}`);
        const quizItemId = `s${sectionIndex}_l${lessonIndex}_quiz`;
        
        if (!enrollment.progress) enrollment.progress = { completedItems: [], percentage: 0 };
        if (!enrollment.progress.completedItems) enrollment.progress.completedItems = [];

        const completedItems = new Set(enrollment.progress.completedItems);
        completedItems.add(quizItemId);
        enrollment.progress.completedItems = Array.from(completedItems);
        let totalTrackableItems = 0;
        course.sections.forEach(s => { if(s.lessons) s.lessons.forEach(l => { totalTrackableItems++; if (l.quiz && l.quiz.length > 0) totalTrackableItems++; }); });
        enrollment.progress.percentage = totalTrackableItems > 0 ? Math.min(100, Math.round((completedItems.size / totalTrackableItems) * 100)) : 0;
        let certificateMessage = "";
        if (enrollment.progress.percentage === 100 && enrollment.status === 'enrolled') { // Check status is 'enrolled'
            enrollment.status = 'completed';
            const existingCert = await Certificate.findOne({userId, courseId: course._id});
            if(!existingCert) {
                await Certificate.create({ userId, courseId: course._id, certificateUrl: `/#mock-certificate/${course._id}/${userId}`});
                certificateMessage = " Congrats! Course completed & certificate earned!";
                console.log(`[SERVER_LOG] Mock certificate created for ${userId}, course ${course.title} (quiz submission).`);
            } else {
                 certificateMessage = " Congrats! Course completed! Certificate previously generated.";
            }
        }
        await enrollment.save();
        res.json({ score: 100, passed: true, message: `Quiz completed!${certificateMessage}`, enrollment: {...enrollment.toObject(), id: enrollment._id.toString()} });
    } catch (e) { 
        console.error("[SERVER_LOG] Error submitting quiz:", e); 
        if (e.code === 11000 && e.keyPattern && e.keyPattern.userId && e.keyPattern.courseId) {
             return res.status(409).json({ message: 'Certificate already exists for this course completion.' });
        }
        res.status(500).json({ message: e.message }); 
    }
});


app.get('/api/instructor/courses', authenticateToken, checkRole(['instructor', 'admin']), async (req, res) => {
    console.log('[SERVER_LOG] GET /api/instructor/courses request received.');
    try {
        const instructorCourses = await Course.find({ instructor: req.user.userId }).sort({ createdAt: -1 });
        const coursesWithFrontendId = instructorCourses.map(course => ({ ...course.toObject(), id: course._id.toString(), instructor: course.instructorName }));
        res.json(coursesWithFrontendId);
    } catch (error) {
        console.error("[SERVER_LOG] Error fetching instructor courses:", error);
        res.status(500).json({ message: "Failed to fetch instructor courses." });
    }
});
app.get('/api/instructor/dashboard-summary', authenticateToken, checkRole(['instructor', 'admin']), async (req, res) => {
    console.log('[SERVER_LOG] GET /api/instructor/dashboard-summary request received.');
    try {
        const instructorId = req.user.userId;
        const myCourses = await Course.find({ instructor: instructorId });
        let totalEnrollments = 0;
        let totalRevenue = 0;
        for (const course of myCourses) {
            const courseEnrollmentCount = await Enrollment.countDocuments({ courseId: course._id, status: { $in: ['enrolled', 'completed'] } }); // Only 'enrolled' or 'completed' for revenue
            totalEnrollments += courseEnrollmentCount;
            if (course.price > 0) {
                totalRevenue += courseEnrollmentCount * course.price;
            }
        }
        const validRatings = myCourses.filter(c => typeof c.rating === 'number' && c.rating > 0);
        const averageRating = validRatings.length > 0 ? (validRatings.reduce((sum, c) => sum + c.rating, 0) / validRatings.length).toFixed(1) : 0;
        res.json({ totalCourses: myCourses.length, totalEnrollments, totalRevenue: parseFloat(totalRevenue.toFixed(2)), averageRating: parseFloat(averageRating) || 0 });
    } catch (error) {
        console.error("[SERVER_LOG] Error fetching instructor dashboard summary:", error);
        res.status(500).json({ message: "Failed to fetch dashboard summary." });
    }
});

// New Instructor Analytics Endpoints
app.get('/api/instructor/enrollments', authenticateToken, checkRole(['instructor', 'admin']), async (req, res) => {
    console.log('[SERVER_LOG] GET /api/instructor/enrollments request received.');
    try {
        const instructorId = req.user.userId;
        const instructorCourses = await Course.find({ instructor: instructorId }, '_id');
        if (!instructorCourses.length) return res.json([]);
        
        const courseIds = instructorCourses.map(c => c._id);
        const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
            .populate('userId', 'name email')
            .populate('courseId', 'title')
            .sort({ createdAt: -1 })
            .lean();

        const formattedEnrollments = enrollments.map(e => ({
            enrollmentId: e._id.toString(),
            courseId: e.courseId?._id.toString(),
            courseTitle: e.courseId?.title || 'N/A',
            userId: e.userId?._id.toString(),
            userName: e.userId?.name || 'N/A',
            userEmail: e.userId?.email || 'N/A',
            progressPercentage: e.progress?.percentage || 0,
            enrollmentStatus: e.status,
            enrolledDate: e.enrolledDate
        }));
        res.json(formattedEnrollments);
    } catch (error) {
        console.error("[SERVER_LOG] Error fetching instructor enrollments:", error);
        res.status(500).json({ message: "Failed to fetch instructor enrollments." });
    }
});

app.get('/api/instructor/reviews', authenticateToken, checkRole(['instructor', 'admin']), async (req, res) => {
    console.log('[SERVER_LOG] GET /api/instructor/reviews request received.');
    try {
        const instructorId = req.user.userId;
        const instructorCourses = await Course.find({ instructor: instructorId }, '_id');
        if (!instructorCourses.length) return res.json([]);

        const courseIds = instructorCourses.map(c => c._id);
        const reviews = await Review.find({ courseId: { $in: courseIds } })
            .populate('userId', 'name email')
            .populate('courseId', 'title')
            .sort({ createdAt: -1 })
            .lean();
        
        const formattedReviews = reviews.map(r => ({
            reviewId: r._id.toString(),
            courseId: r.courseId?._id.toString(),
            courseTitle: r.courseId?.title || 'N/A',
            userId: r.userId?._id.toString(),
            userName: r.userId?.name || 'Anonymous',
            userEmail: r.userId?.email || 'N/A',
            reviewText: r.reviewText,
            rating: r.rating,
            date: r.date || r.createdAt,
            isFlagged: r.isFlagged || false
        }));
        res.json(formattedReviews);
    } catch (error) {
        console.error("[SERVER_LOG] Error fetching instructor reviews:", error);
        res.status(500).json({ message: "Failed to fetch instructor reviews." });
    }
});


// ADMIN ROUTES
app.get('/api/admin/users', authenticateToken, checkRole(['admin']), async (req, res) => {
    console.log('[SERVER_LOG] GET /api/admin/users request received.');
    try {
        const userList = await User.find({}, 'name email role googleId createdAt isBlocked').sort({ createdAt: -1 }); 
        const formattedUsers = userList.map(u => ({ 
            id: u._id.toString(), 
            name: u.name, 
            email: u.email, 
            role: u.role, 
            isGoogleUser: u.googleId ? 'Yes' : 'No', 
            joined: u.createdAt,
            isBlocked: u.isBlocked // Include isBlocked status
        }));
        res.json(formattedUsers);
    } catch (error) {
        console.error("[SERVER_LOG] Error fetching user list for admin:", error);
        res.status(500).json({ message: "Failed to fetch user list." });
    }
});

app.put('/api/admin/users/:userId/toggle-block', authenticateToken, checkRole(['admin']), async (req, res) => {
    console.log(`[SERVER_LOG] PUT /api/admin/users/${req.params.userId}/toggle-block request received.`);
    try {
        const { userId } = req.params;
        const userToUpdate = await User.findById(userId);

        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (userToUpdate.email === 'admin@skillshare.hub') {
            return res.status(403).json({ message: 'Cannot block or unblock the default admin user.' });
        }

        userToUpdate.isBlocked = !userToUpdate.isBlocked; // Toggle the status
        await userToUpdate.save();

        res.json({ 
            message: `User ${userToUpdate.name} has been ${userToUpdate.isBlocked ? 'blocked' : 'unblocked'} successfully.`,
            isBlocked: userToUpdate.isBlocked
        });

    } catch (error) {
        console.error("[SERVER_LOG] Error toggling user block status:", error);
        if (error.kind === 'ObjectId') return res.status(400).json({ message: 'Invalid user ID format.' });
        res.status(500).json({ message: 'Server error while updating user block status.' });
    }
});


app.delete('/api/admin/users/:userId', authenticateToken, checkRole(['admin']), async (req, res) => {
    console.log(`[SERVER_LOG] DELETE /api/admin/users/${req.params.userId} request received.`);
    try {
        const { userId } = req.params;
        const userToDelete = await User.findById(userId);

        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (userToDelete.email === 'admin@skillshare.hub') {
            return res.status(403).json({ message: 'Cannot delete the default admin user.' });
        }

        if (userToDelete.role === 'instructor') {
            const instructorCourses = await Course.countDocuments({ instructor: userId });
            if (instructorCourses > 0) {
                return res.status(400).json({ message: `Cannot delete instructor ${userToDelete.name}. They have ${instructorCourses} associated course(s). Please reassign or delete their courses first.` });
            }
        }

        await Enrollment.deleteMany({ userId: userId });
        await Review.deleteMany({ userId: userId });
        await Certificate.deleteMany({ userId: userId });
        await User.findByIdAndDelete(userId);

        res.json({ message: `User ${userToDelete.name} (${userToDelete.email}) and their associated data deleted successfully.` });

    } catch (error) {
        console.error("[SERVER_LOG] Error deleting user:", error);
        if (error.kind === 'ObjectId') return res.status(400).json({ message: 'Invalid user ID format.' });
        res.status(500).json({ message: 'Server error while deleting user.' });
    }
});

app.get('/api/admin/courses', authenticateToken, checkRole(['admin']), async (req, res) => {
    console.log('[SERVER_LOG] GET /api/admin/courses request received.');
    try {
        const courses = await Course.find({}, 'title instructorName category price rating createdAt').sort({ createdAt: -1 }).lean();
        
        const formattedCourses = await Promise.all(courses.map(async (course) => {
            let revenueGenerated = 0;
            if (course.price > 0) {
                const enrollmentCount = await Enrollment.countDocuments({ 
                    courseId: course._id, 
                    status: { $in: ['enrolled', 'completed'] }  // Only count 'enrolled' or 'completed' for revenue
                });
                revenueGenerated = enrollmentCount * course.price;
            }
            return { 
                id: course._id.toString(), 
                title: course.title, 
                instructorName: course.instructorName,
                category: course.category,
                price: course.price,
                rating: course.rating,
                created: course.createdAt,
                revenueGenerated: parseFloat(revenueGenerated.toFixed(2)),
            };
        }));

        res.json(formattedCourses);
    } catch (error) {
        console.error("[SERVER_LOG] Error fetching course list for admin:", error);
        res.status(500).json({ message: "Failed to fetch course list." });
    }
});

app.delete('/api/admin/courses/:courseId', authenticateToken, checkRole(['admin']), async (req, res) => {
    console.log(`[SERVER_LOG] DELETE /api/admin/courses/${req.params.courseId} request received.`);
    try {
        const { courseId } = req.params;
        const courseToDelete = await Course.findById(courseId);

        if (!courseToDelete) {
            return res.status(404).json({ message: 'Course not found.' });
        }

        await Enrollment.deleteMany({ courseId: courseId });
        await Review.deleteMany({ courseId: courseId });
        await Certificate.deleteMany({ courseId: courseId });
        await Course.findByIdAndDelete(courseId);

        res.json({ message: `Course "${courseToDelete.title}" and all associated enrollments, reviews, and certificates deleted successfully.` });

    } catch (error) {
        console.error("[SERVER_LOG] Error deleting course:", error);
        if (error.kind === 'ObjectId') return res.status(400).json({ message: 'Invalid course ID format.' });
        res.status(500).json({ message: 'Server error while deleting course.' });
    }
});

app.get('/api/admin/reviews', authenticateToken, checkRole(['admin']), async (req, res) => {
    console.log('[SERVER_LOG] GET /api/admin/reviews request received.');
    try {
        const reviews = await Review.find({})
            .populate('userId', 'name email')
            .populate('courseId', 'title')
            .sort({ createdAt: -1 }) // Already sorted by date
            .lean();

        const formattedReviews = reviews.map(review => ({
            id: review._id.toString(),
            reviewText: review.reviewText,
            rating: review.rating,
            date: review.date || review.createdAt,
            userId: review.userId ? review.userId._id.toString() : null,
            userName: review.userId ? review.userId.name : 'N/A',
            userEmail: review.userId ? review.userId.email : 'N/A',
            courseId: review.courseId ? review.courseId._id.toString() : null,
            courseTitle: review.courseId ? review.courseId.title : 'N/A',
            isFlagged: review.isFlagged || false // Include isFlagged
        }));
        res.json(formattedReviews);
    } catch (error) {
        console.error("[SERVER_LOG] Error fetching review list for admin:", error);
        res.status(500).json({ message: "Failed to fetch review list." });
    }
});

// Admin Edit Review Text
app.put('/api/admin/reviews/:reviewId/edit', authenticateToken, checkRole(['admin']), async (req, res) => {
    console.log(`[SERVER_LOG] PUT /api/admin/reviews/${req.params.reviewId}/edit request received.`);
    try {
        const { reviewId } = req.params;
        const { reviewText } = req.body;

        if (!reviewText || typeof reviewText !== 'string' || reviewText.trim() === '') {
            return res.status(400).json({ message: 'Review text cannot be empty.' });
        }

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found.' });

        review.reviewText = reviewText.trim();
        // review.isFlagged = false; // Optionally unflag after editing, or keep it as is. Let's keep it as is for now.
        await review.save();

        res.json({ message: 'Review updated successfully.', review });
    } catch (error) {
        console.error("[SERVER_LOG] Error editing review by admin:", error);
        res.status(500).json({ message: 'Failed to edit review.' });
    }
});

// Admin Toggle Flag for a Review
app.put('/api/admin/reviews/:reviewId/toggle-flag', authenticateToken, checkRole(['admin']), async (req, res) => {
    console.log(`[SERVER_LOG] PUT /api/admin/reviews/${req.params.reviewId}/toggle-flag request received.`);
    try {
        const { reviewId } = req.params;
        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        review.isFlagged = !review.isFlagged;
        await review.save();

        res.json({ 
            message: `Review ${review.isFlagged ? 'flagged' : 'unflagged'} successfully.`, 
            review // Send back the updated review
        });
    } catch (error) {
        console.error("[SERVER_LOG] Error toggling review flag by admin:", error);
        if (error.kind === 'ObjectId') return res.status(400).json({ message: 'Invalid review ID format.' });
        res.status(500).json({ message: 'Server error while updating review flag status.' });
    }
});


app.delete('/api/admin/reviews/:reviewId', authenticateToken, checkRole(['admin']), async (req, res) => {
    console.log(`[SERVER_LOG] DELETE /api/admin/reviews/${req.params.reviewId} request received.`);
    try {
        const { reviewId } = req.params;
        const reviewToDelete = await Review.findById(reviewId);

        if (!reviewToDelete) {
            return res.status(404).json({ message: 'Review not found.' });
        }

        const courseId = reviewToDelete.courseId;
        await Review.findByIdAndDelete(reviewId);

        if (courseId) {
            const course = await Course.findById(courseId);
            if (course) {
                const remainingReviews = await Review.find({ courseId: courseId });
                const totalRating = remainingReviews.reduce((sum, rev) => sum + rev.rating, 0);
                course.rating = remainingReviews.length > 0 ? parseFloat((totalRating / remainingReviews.length).toFixed(1)) : 0;
                await course.save();
            }
        }
        res.json({ message: `Review deleted successfully. Course rating updated if applicable.` });

    } catch (error) {
        console.error("[SERVER_LOG] Error deleting review:", error);
        if (error.kind === 'ObjectId') return res.status(400).json({ message: 'Invalid review ID format.' });
        res.status(500).json({ message: 'Server error while deleting review.' });
    }
});

// The "catchall" handler: for any request that doesn't match an API route,
// send back the main index.html file from the frontend build.
app.get('*', (req, res) => {
  console.log(`[SERVER_LOG] Catchall route hit for: ${req.path}`);
  // Check if the request is not an API call
  if (!req.path.startsWith('/api')) {
    const indexPath = path.join(__dirname, '../dist/index.html');
    console.log(`[SERVER_LOG] Serving index.html from: ${indexPath}`);
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('[SERVER_LOG] Error sending index.html:', err);
            res.status(500).send('Error serving frontend.');
        }
    });
  } else {
    // If it's an API route that wasn't matched, send a 404
    console.log(`[SERVER_LOG] API endpoint not found: ${req.path}`);
    res.status(404).json({ message: 'API endpoint not found' });
  }
});

app.listen(PORT, () => { 
    console.log(`[SERVER_LOG] Backend server listening on port ${PORT}`);
    console.log(`[SERVER_LOG] Server startup complete. NODE_ENV: ${process.env.NODE_ENV}`);
    console.log('[SERVER_LOG] Ensure all required environment variables are set in Vercel for production.');
});

// Global error handler (optional, for unhandled promise rejections, etc.)
process.on('unhandledRejection', (reason, promise) => {
  console.error('[SERVER_LOG] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[SERVER_LOG] Uncaught Exception:', error);
  // For Vercel, it's often better to let the platform handle restarts, 
  // but logging is critical. Avoid process.exit here unless you have a specific strategy.
});