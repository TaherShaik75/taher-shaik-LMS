
# SkillShareHub - Detailed Developer Guide

Welcome to the SkillShareHub project! This guide is intended for new developers to understand the codebase, architecture, and how to contribute.

## 1. Project Setup & Running

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (usually comes with Node.js) or yarn
*   MongoDB instance (local or cloud-hosted, e.g., MongoDB Atlas)
*   Cloudinary account (for file uploads)
*   Google Cloud Platform project with OAuth 2.0 credentials (for Google Sign-In)

### Backend Setup

1.  Navigate to the `backend/` directory.
2.  Install dependencies: `npm install` (or `yarn install`).
3.  Create a `.env` file in the `backend/` directory by copying `.env.example` (if provided, otherwise create from scratch).
4.  Populate the `.env` file with your specific configurations:
    ```env
    PORT=3001
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_strong_jwt_secret_key_at_least_32_chars
    FRONTEND_URL=http://localhost:5173/frontend/index.html # Or your frontend dev server URL

    # Cloudinary - Required for file uploads
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret

    # Google OAuth - Required for Google Sign-In
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback # Ensure this matches your GCP console
    ```
5.  Start the backend server: `npm start` (or `node server.js` or `nodemon server.js` if you have nodemon installed).
    *   The server typically runs on `http://localhost:3001`.
    *   A default admin user (`admin@skillshare.hub` / `admin123`) is initialized on first run if it doesn't exist.

### Frontend Setup

1.  The frontend is designed to be served as static files but uses ES6 modules.
2.  Open `frontend/index.html` directly in your browser (e.g., using a live server extension in VS Code, or by simple file access).
    *   The application base URL is usually `http://localhost:5173/frontend/index.html` if using Vite or a similar dev server, or `file:///path/to/project/frontend/index.html` if opening directly (though direct file access might have CORS issues with API calls if the backend is not configured for `file://` origin).
    *   Ensure the `API_ORIGIN` in `frontend/app.js` (`http://localhost:3001`) matches your backend server's address.

## 2. Folder Structure

```
.
├── backend/
│   ├── models/                 # Mongoose schemas and models
│   │   ├── Certificate.js
│   │   ├── Course.js
│   │   ├── Enrollment.js
│   │   ├── Review.js
│   │   └── User.js
│   ├── db.js                   # MongoDB connection logic
│   └── server.js               # Main Express application, API routes, middleware
├── frontend/
│   ├── components/             # JavaScript modules for UI components
│   │   ├── AdminPanel.js
│   │   ├── AuthForm.js
│   │   ├── CertificateView.js
│   │   ├── CourseCard.js
│   │   ├── CourseList.js
│   │   ├── CourseView.js
│   │   ├── CreateCourseForm.js
│   │   ├── EditCourseForm.js
│   │   ├── Footer.js
│   │   ├── Header.js
│   │   ├── InstructorAnalytics.js
│   │   ├── InstructorDashboard.js
│   │   ├── PaymentPage.js
│   │   ├── ReviewForm.js
│   │   ├── SearchBar.js
│   │   └── UserDashboard.js
│   ├── app.js                  # Main frontend application logic, routing, state
│   ├── index.css               # Global CSS styles
│   └── index.html              # Main HTML entry point
├── .env                        # (Gitignored) Backend environment variables
├── index.tsx                   # Placeholder for potential future TS/React integration
├── metadata.json               # Project metadata
└── README_*.md                 # These documentation files
```

## 3. Backend Deep Dive (`backend/`)

### `server.js`

This is the heart of the backend.
*   **Dependencies:** Express, bcryptjs (passwords), JWT (sessions), CORS, Passport (Google OAuth), Multer & Cloudinary (file uploads).
*   **Initialization:** Connects to DB (`connectDB()`), configures Cloudinary, initializes Express app.
*   **Middleware:**
    *   `cors()`: Enables Cross-Origin Resource Sharing.
    *   `express.json()`, `express.urlencoded()`: Parses incoming request bodies.
    *   `passport.initialize()`: Initializes Passport for authentication.
    *   `authenticateToken(req, res, next)`: JWT middleware to protect routes. Verifies the token from the `Authorization` header. Populates `req.user` with token payload.
    *   `checkRole(roles)`: Role-based access control middleware. Checks if `req.user.role` is in the allowed `roles` array.
*   **Cloudinary Upload:**
    *   `streamUploadToCloudinary()`: A helper function to upload file buffers (from Multer) to Cloudinary.
    *   `processCourseContentFiles()`: Iterates through course sections/lessons/resources and uploads associated files from the request to Cloudinary, updating their URLs in the course data.
*   **Google OAuth:**
    *   Configures `passport-google-oauth20` strategy.
    *   Handles user lookup/creation based on Google profile.
    *   `/api/auth/google`: Initiates the Google OAuth flow.
    *   `/api/auth/google/callback`: Handles the callback from Google, generates a JWT, and redirects to the frontend with token and user data.
*   **API Routes:** Organized by resource/functionality.
    *   **Auth (`/api/auth/`)**:
        *   `POST /signup`: User registration. Hashes password.
        *   `POST /login`: User login. Compares password, generates JWT. Checks for `isBlocked` status.
    *   **Dashboard (`/api/dashboard/`)**:
        *   `GET /enrolled-courses`: Fetches courses the logged-in user is enrolled in.
        *   `GET /my-reviews`: Fetches reviews submitted by the logged-in user.
        *   `GET /my-certificates`: Fetches certificates earned by the logged-in user.
    *   **Courses (`/api/courses/`)**:
        *   `GET /`: Lists all courses with filtering (query, category, price, instructor).
        *   `GET /:id`: Fetches details for a single course, including its reviews and user's enrollment status (if logged in).
        *   `POST /`: Creates a new course (instructor/admin only). Handles thumbnail and course content file uploads.
        *   `PUT /:id`: Updates an existing course (instructor owner/admin only). Handles file uploads.
        *   `POST /:courseId/reviews`: Submits a review for a course. Recalculates course average rating.
        *   `PUT /:courseId/reviews/:reviewId/toggle-flag`: Allows instructor (of the course) or admin to flag/unflag a review.
    *   **Enrollments (`/api/enrollments/`)**:
        *   `POST /`: Enrolls a user in a course. For paid courses, sets status to `pending_payment`. For free, `enrolled`.
        *   `PUT /:enrollmentId/confirm-payment`: Confirms a "mock" payment, changing enrollment status from `pending_payment` to `enrolled`.
        *   `POST /:enrollmentId/progress`: Updates user's progress in a course (marking items complete). Handles certificate creation on 100% completion if enrollment is 'enrolled'.
    *   **Quizzes (`/api/quizzes/`)**:
        *   `POST /submit`: Submits quiz answers. Updates progress, handles course completion and certificate generation if applicable and enrollment is 'enrolled'.
    *   **Instructor (`/api/instructor/`)**:
        *   `GET /courses`: Lists courses created by the logged-in instructor.
        *   `GET /dashboard-summary`: Provides summary analytics for the instructor.
        *   `GET /enrollments`: Lists all enrollments for the instructor's courses.
        *   `GET /reviews`: Lists all reviews for the instructor's courses.
    *   **Admin (`/api/admin/`)**:
        *   `GET /users`: Lists all users.
        *   `PUT /users/:userId/toggle-block`: Blocks or unblocks a user.
        *   `DELETE /users/:userId`: Deletes a user and their associated data (enrollments, reviews, certificates). Prevents deletion of default admin and instructors with courses.
        *   `GET /courses`: Lists all courses with revenue generated. Revenue calculation considers only 'enrolled' or 'completed' enrollments.
        *   `DELETE /courses/:courseId`: Deletes a course and associated data.
        *   `GET /reviews`: Lists all reviews on the platform.
        *   `PUT /reviews/:reviewId/edit`: Allows admin to edit review text.
        *   `PUT /reviews/:reviewId/toggle-flag`: Allows admin to flag/unflag any review.
        *   `DELETE /reviews/:reviewId`: Deletes a review and updates the course's average rating.

### `db.js`

*   Uses Mongoose to connect to the MongoDB database specified in `process.env.MONGODB_URI`.
*   Includes error handling for connection issues.

### `models/`

Each file defines a Mongoose schema and model.
*   **`User.js`**: `name`, `email`, `password` (hashed), `role` (learner, instructor, admin), `googleId`, `isBlocked`. Includes pre-save hook for password hashing and a method for password comparison.
*   **`Course.js`**: `title`, `description`, `category`, `instructor` (ref to User), `instructorName`, `price`, `thumbnailUrl`, `tags`, `rating`, and `sections`.
    *   `sections` is an array of `sectionSchema`, which contains `lessons`.
    *   `lessons` is an array of `lessonSchema`, which includes `title`, `videoUrl`, `description`, `resources`, and `quiz`.
    *   `resources` is an array of `resourceSchema` (`name`, `url`).
    *   `quiz` is an array of `quizQuestionSchema` (`questionText`, `options`, `correctAnswerIndex`).
*   **`Enrollment.js`**: `userId`, `courseId`, `progress` (completedItems array, percentage), `enrolledDate`, `status` ('pending_payment', 'enrolled', 'completed'), `paymentId`.
*   **`Review.js`**: `userId`, `courseId`, `rating`, `reviewText`, `date`, `isFlagged`.
*   **`Certificate.js`**: `userId`, `courseId`, `issueDate`, `certificateUrl`.

## 4. Frontend Deep Dive (`frontend/`)

The frontend is a Single Page Application (SPA)-like structure driven by `app.js`. It uses hash-based routing and dynamically renders HTML content into the `#main-content` div.

### `index.html`

*   Basic HTML structure.
*   Links `index.css`.
    *   Includes a `div#app-container` where the header, main content, and footer are rendered.
*   Includes an `importmap` script block. This is crucial for allowing bare module specifiers (like `react/`) in JavaScript modules if you were to use libraries like React from a CDN like `esm.sh`.
*   Loads `app.js` as a `type="module"`. **Important:** The `importmap` script MUST come before any `module` scripts that use its mappings.

### `index.css`

*   Global styles, CSS variables for theming (`:root`).
*   Styles for all components: header, footer, forms, course cards, dashboards, admin panel, modals, etc.
*   Responsive design using media queries.

### `app.js`

This is the main orchestrator for the frontend.
*   **Imports:** All component rendering functions (e.g., `renderHeader`, `renderCourseList`).
*   **Global State (`authState`):** Stores authentication status, user details, and token.
    *   `loadAuthState()`: Loads auth state from `localStorage` on app start.
    *   `updateAuthState()`: Updates `authState` and `localStorage`, then re-renders the app structure.
*   **Video Player Modal State:** Global variables (`currentVideoModal`, etc.) manage the state of the active video player.
*   **Routing (`renderPageContent()` and `hashchange` listener):**
    *   Listens for `hashchange` events.
    *   `renderPageContent()`:
        *   Parses the current `window.location.hash`.
        *   Handles protected routes (redirects to `#login` if not authenticated).
        *   Handles special routes like `#logout` (clears auth state, redirects to `#home`).
        *   Uses a `switch` statement or `if/else if` for different hash paths to call the appropriate component rendering functions.
        *   The result (HTML string) is injected into `#main-content`.
        *   Calls `addEventListeners()` after content is rendered.
*   **Application Structure (`renderAppStructure()`):**
    *   Renders the basic shell: header, main content area, footer.
    *   Calls `renderPageContent()` to fill the main content.
*   **OAuth Handling (`handleOAuthCallback()`):**
    *   Checks if the hash indicates an OAuth callback (`#oauth_callback?...`).
    *   If so, parses token and user data from URL parameters.
    *   Updates `authState` and redirects to the appropriate dashboard.
*   **Event Delegation (`addEventListeners()`):**
    *   Attaches a single set of event listeners (submit, click, change) to `#main-content`.
    *   Uses `event.target.matches()` or `event.target.classList.contains()` to determine which element was interacted with and call the appropriate handler function.
    *   **Important Fix:** Includes a mechanism (`mainContent._listenersAttached`) to prevent attaching listeners multiple times to the same `#main-content` element, which could happen if `renderPageContent` is called without replacing the `#main-content` DOM node itself (e.g., during some partial updates or recursive calls). This fixed issues like multiple confirmation dialogs.
*   **API Interaction:**
    *   Helper functions (or inline `fetch` calls within handlers) to communicate with the backend API.
    *   The `API_ORIGIN` constant defines the backend URL.
    *   Authorization headers with JWT are added for protected requests.
*   **Handler Functions:**
    *   `handleAuthFormSubmit()`: For login/signup.
    *   `handleCreateCourseFormSubmit()`, `handleEditCourseFormSubmit()`: For course creation/editing, including `FormData` for file uploads.
    *   `handleEnrollment()`: Manages course enrollment logic. Redirects to payment page for paid courses if status is `pending_payment`.
    *   `handlePaymentFormSubmit()`: Simulates payment, calls backend to confirm payment and update enrollment status. Renders a mock receipt.
    *   `handleReviewFormSubmit()`, `handleProgressUpdate()`, `handleQuizSubmission()`: Handle their respective form submissions.
    *   Admin action handlers (e.g., `handleAdminDeleteUserClick`, `handleAdminBlockUserClick`, `handleAdminDeleteCourseClick`, `handleAdminEditReviewClick`, `handleAdminToggleFlagReviewClick`): Perform admin operations, update UI or re-render.
    *   Instructor analytics action handler (`handleInstructorFlagReviewClick`).
    *   Course view action handlers (`handleToggleFlagReviewClick` for instructor/admin, `handleWatchVideoClick`).
    *   Video Player Modal functions (`openVideoPlayerModal`, `closeVideoPlayerModal`): Manage the lifecycle of the video player, including `localStorage` for progress.

### `components/`

Each file typically exports a function that returns an HTML string for a specific UI part.
*   **`Header.js`**: Renders the navigation header. Dynamically shows links based on `authState`. Includes a "My Dashboard" dropdown with role-specific items.
*   **`Footer.js`**: Renders the site footer.
*   **`AuthForm.js`**: Renders login and signup forms.
*   **`CourseCard.js`**: Renders a single course card for listings.
*   **`CourseList.js`**: Fetches and renders a list of courses using `CourseCard.js`. Supports search/filter parameters.
*   **`SearchBar.js`**: Renders the search input and filter dropdowns.
*   **`UserDashboard.js`**: Renders the "My Learning" dashboard for learners (enrolled courses, reviews, certificates). Button text ("Proceed"/"Summary") changes based on course completion.
*   **`InstructorDashboard.js`**: Renders the dashboard for instructors (manage courses, summary analytics).
*   **`InstructorAnalytics.js`**: Renders detailed analytics for instructors: summary cards, enrollment management grid, review management list with flagging.
*   **`AdminPanel.js`**: Renders the comprehensive admin dashboard:
    *   Metrics: Total users, active courses, total revenue (with tooltip for top courses).
    *   User Management: Grid display, block/unblock, delete users.
    *   Content Moderation (Courses): Grid display, trending (by revenue), revenue per course, edit link, delete courses.
    *   Review Moderation: Sorts by flagged status, visual flag indicators, inline editing of review text, flag/unflag by admin, delete reviews.
*   **`CreateCourseForm.js` & `EditCourseForm.js`**:
    *   Render complex forms for creating/editing courses.
    *   Include dynamic JavaScript functions (`addSection`, `addLesson`, `addResource`, `addQuizQuestion`, `removeElement`) to add/remove form fields for sections, lessons, resources, and quiz questions.
    *   Handle `FormData` for submission, including file inputs for thumbnail, videos, and resources. `EditCourseForm.js` pre-fills form with existing course data.
*   **`CourseView.js`**: Renders the detailed view of a single course.
    *   Displays course information, curriculum (sections, lessons, resources, quizzes).
    *   Handles enrollment logic display (Enroll button, Continue Learning, View Certificate).
    *   Shows progress tracking checkboxes and overall progress bar for enrolled users.
    *   Allows review submission if enrolled and not yet reviewed.
    *   **Owner View:** If viewed by the course instructor/admin, shows "Edit Course" button, allows direct content access, hides progress tracking for self, and shows quiz answers in preview mode.
    *   **Instructor/Admin Flagging:** Allows flagging/unflagging of reviews on this page.
    *   **Video Player Trigger:** "Watch Video" buttons trigger the in-page modal video player.
*   **`ReviewForm.js`**: Renders the form for submitting a course review.
*   **`CertificateView.js`**: Renders a mock certificate of completion.
*   **`PaymentPage.js`**: Renders a PayPal-inspired mock payment page. Handles the `enrollmentId` from the query string to link the payment to a specific enrollment.

## 5. Key Concepts & Patterns

*   **SPA-like Architecture:** Uses hash-based routing (`window.location.hash`) to simulate page changes without full reloads.
*   **Dynamic Rendering:** JavaScript functions generate HTML strings, which are then injected into the DOM (`innerHTML`).
*   **Component-Based (Conceptual):** While not using a framework like React/Vue, the `components/` directory organizes UI parts into reusable functions.
*   **State Management:** Simple global `authState` managed in `app.js` and stored in `localStorage`. Changes trigger UI updates.
*   **Event Delegation:** A few primary event listeners on `#main-content` handle events for dynamically added elements.
*   **RESTful API Consumption:** `fetch` API is used for all backend communication.
*   **JWT Authentication:** Tokens are sent in `Authorization: Bearer <token>` header for protected API routes.
*   **Role-Based Access Control (RBAC):** Implemented both on frontend (UI visibility) and backend (API endpoint protection).
*   **File Handling:** `FormData` on the frontend, Multer and Cloudinary on the backend.
*   **Error Handling:** `try...catch` blocks for API calls, feedback messages displayed to the user.
*   **Responsive Design:** CSS media queries ensure usability on different devices.
*   **Accessibility (Basic):** Use of `aria-` attributes in some places, semantic HTML where appropriate. Could be improved.

## 6. Adding New Features

### Adding a New Page/View:

1.  Define a new hash (e.g., `#new-feature`).
2.  Create a new component file in `frontend/components/` (e.g., `NewFeaturePage.js`) that exports a rendering function.
3.  In `frontend/app.js`:
    *   Import the new component's render function.
    *   Add a `case` to the `switch` statement (or an `else if` block) in `renderPageContent()` for the new hash, calling your component's render function.
    *   If it's a protected route, add the hash to the `protectedRoutes` array.
4.  Add any necessary event handlers for the new page to `addEventListeners()` if using event delegation, or attach them directly within your component's rendering logic (less common in this project's pattern).

### Adding a New API Endpoint:

1.  **Backend (`backend/server.js`):**
    *   Define the new route (e.g., `app.get('/api/new-data', ...)`, `app.post('/api/submit-something', ...)`).
    *   Add necessary middleware (e.g., `authenticateToken`, `checkRole`).
    *   Implement the route handler function to perform business logic and interact with models.
2.  **Frontend (`frontend/app.js` or component):**
    *   Use `fetch` to call the new endpoint.
    *   Process the response and update the UI accordingly.

## 7. Contributing

*   Follow existing code style and patterns.
*   Ensure backend API endpoints are protected appropriately.
*   Update both frontend and backend if a feature spans both.
*   Test thoroughly.

This detailed guide should help you get started with the SkillShareHub project. Happy coding!
