
# SkillShareHub - High-Level Project Overview

## 1. Introduction

SkillShareHub is an online skill marketplace platform designed to enable users to create, publish, explore, and enroll in a variety of skill-based courses. It features distinct user roles (Learner, Instructor, Admin) with tailored functionalities and dashboards.

## 2. Technology Stack

*   **Backend:**
    *   **Runtime:** Node.js
    *   **Framework:** Express.js (for routing, API handling, middleware)
    *   **Database:** MongoDB (NoSQL document database)
    *   **ODM:** Mongoose (for MongoDB object modeling)
    *   **Authentication:** JWT (JSON Web Tokens) for session management, bcryptjs for password hashing.
    *   **OAuth:** Passport.js with Google OAuth 2.0 strategy for social login.
    *   **File Uploads:** Multer (for handling multipart/form-data) and Cloudinary (for cloud-based media storage and delivery).
*   **Frontend:**
    *   **Language:** Vanilla JavaScript (ES6 Modules)
    *   **Structure:** Single Page Application (SPA)-like architecture using hash-based routing.
    *   **Templating:** Dynamic HTML generation via JavaScript functions.
    *   **Styling:** CSS3 with custom properties (variables) for theming and responsive design.
    *   **Markup:** HTML5
*   **Development Environment:**
    *   Requires Node.js and npm/yarn.
    *   Environment variables (e.g., in a `.env` file) for sensitive configurations like database URI, JWT secret, Cloudinary credentials, and Google OAuth credentials.

## 3. Core Architecture

*   **Backend API (`backend/server.js`):**
    *   A RESTful API that serves data to the frontend and handles business logic.
    *   Manages user authentication, course creation/management, enrollments, reviews, payments (mocked), and administrative functions.
    *   Interacts with the MongoDB database via Mongoose models.
*   **Frontend Application (`frontend/`):**
    *   A client-side application that interacts with the backend API to fetch and display data.
    *   `app.js` acts as the main controller, handling routing, state management, and rendering of various UI components.
    *   Components are modular JavaScript functions that generate HTML strings (e.g., `Header.js`, `CourseList.js`, `AdminPanel.js`).
    *   Dynamic content rendering based on user interactions and API responses.

## 4. Key Features

*   **User Roles:** Learner, Instructor, Admin with distinct dashboards and permissions.
*   **Authentication:** Local email/password signup & login, Google OAuth.
*   **Course Management:**
    *   Instructors/Admins can create, edit, and manage courses with rich content (sections, lessons, videos, resources, quizzes).
    *   Public course listing with search and filtering capabilities.
*   **Enrollment System:**
    *   Users can enroll in courses (free or paid - mock payment).
    *   Progress tracking for enrolled courses.
    *   Certificate generation upon course completion (mock).
*   **Review System:**
    *   Users can submit reviews and ratings for courses.
    *   Instructors and Admins can flag reviews.
    *   Admins can moderate (edit, delete, flag/unflag) reviews.
*   **Admin Panel:**
    *   User management (list, block/unblock, delete).
    *   Content moderation (list courses, view revenue, edit/delete courses).
    *   Review moderation.
    *   Platform analytics (total users, courses, revenue).
*   **Instructor Dashboard & Analytics:**
    *   Instructors can manage their courses.
    *   View analytics (summary, enrollments, reviews with flagging).
*   **User Dashboard ("My Learning"):**
    *   Learners can view their enrolled courses, progress, submitted reviews, and earned certificates.
*   **File Uploads:** Course thumbnails, lesson videos, and resources are uploaded to Cloudinary.
*   **Responsive UI:** Designed to adapt to various screen sizes.
*   **Video Playback:** In-page video player modal with progress saving (localStorage).

## 5. File-wise High-Level Explanation

*   **`index.tsx`**: Placeholder for potential future TypeScript/React integration. Currently minimal.
*   **`metadata.json`**: Basic project metadata.
*   **`backend/`**: Contains all backend server logic.
    *   `db.js`: Handles MongoDB database connection.
    *   `models/`: Defines Mongoose schemas and models for `User`, `Course`, `Enrollment`, `Review`, `Certificate`.
    *   `server.js`: The main Express application file. Sets up middleware, defines all API routes, handles authentication, file uploads, and business logic.
*   **`frontend/`**: Contains all client-side application logic.
    *   `index.html`: The main HTML entry point for the frontend application.
    *   `index.css`: Global styles, CSS variables, and responsive design rules.
    *   `app.js`: Core frontend JavaScript file. Manages routing, application state (authentication, current view), API interactions, and orchestrates the rendering of UI components.
    *   `components/`: Contains modular JavaScript files, each responsible for rendering a specific part of the UI (e.g., `Header.js`, `CourseList.js`, `AdminPanel.js`, `CreateCourseForm.js`). These typically export functions that return HTML strings.

## 6. Project Workflow

1.  User interacts with the frontend UI (e.g., clicks a button, navigates to a new section).
2.  Frontend `app.js` captures the interaction or route change.
3.  If data is needed, `app.js` or a component makes an API call to the backend.
4.  Backend `server.js` processes the API request, interacts with the database (via Mongoose models), and returns a JSON response.
5.  Frontend receives the response and dynamically updates the UI by re-rendering relevant components or sections of the page.

This overview should provide the project management team with a solid understanding of the SkillShareHub platform's purpose, technology, and core structure.
