
# SkillShareHub - Technologies Used

This document outlines the key frameworks, libraries, and technologies employed in the SkillShareHub project, along with explanations of their roles and usage.

## I. Backend Technologies

### 1. Node.js
*   **Purpose:** JavaScript runtime environment for executing server-side code.
*   **Usage:** Forms the foundation of the entire backend, allowing us to use JavaScript for server logic, API development, and database interactions.

### 2. Express.js
*   **Purpose:** A minimal and flexible Node.js web application framework.
*   **Usage:**
    *   **Routing:** Defining API endpoints (e.g., `/api/courses`, `/api/auth/login`).
    *   **Middleware:** Handling requests and responses, parsing JSON/URL-encoded data, CORS, authentication checks.
    *   **API Structure:** Organizes the backend into a manageable set of routes and handlers.

### 3. MongoDB
*   **Purpose:** A NoSQL, document-oriented database.
*   **Usage:**
    *   **Data Storage:** Stores all application data, including users, courses, enrollments, reviews, and certificates, as BSON documents.
    *   **Flexibility:** Schema-less nature allows for evolving data structures, although Mongoose provides schema validation.
    *   **Scalability:** Well-suited for applications that may need to scale.

### 4. Mongoose
*   **Purpose:** An Object Data Modeling (ODM) library for MongoDB and Node.js.
*   **Usage:**
    *   **Schema Definition:** Defines the structure and data types for documents in MongoDB collections (see `backend/models/`).
    *   **Data Validation:** Enforces rules on data before it's saved to the database.
    *   **Business Logic Hooks:** Provides pre/post save hooks (e.g., password hashing in `User.js`).
    *   **Querying:** Simplifies database queries with a more JavaScript-friendly syntax.
    *   **Relationships:** Manages relationships between different data models using `ref` (e.g., a course has an `instructor` which is a `User`).

### 5. JSON Web Tokens (JWT) & `jsonwebtoken` library
*   **Purpose:** A compact, URL-safe means of representing claims to be transferred between two parties. Used for stateless authentication.
*   **Usage:**
    *   After successful login (email/password or OAuth), a JWT is generated containing user information (ID, name, email, role).
    *   This token is sent to the client.
    *   The client includes this token in the `Authorization: Bearer <token>` header for subsequent requests to protected API endpoints.
    *   The `authenticateToken` middleware on the backend verifies the JWT's signature and expiration.

### 6. bcryptjs
*   **Purpose:** A library for hashing passwords.
*   **Usage:**
    *   Passwords are never stored in plain text.
    *   Before saving a user to the database, their password is salted and hashed using bcrypt.
    *   During login, the provided password is hashed and compared against the stored hash.

### 7. Passport.js & `passport-google-oauth20`
*   **Purpose:** Authentication middleware for Node.js. Extremely flexible and modular, supporting various "strategies".
*   **Usage:**
    *   `passport-google-oauth20` strategy is used to implement "Sign in with Google".
    *   Handles the OAuth 2.0 flow: redirecting to Google, receiving the callback, verifying the user, and fetching profile information.
    *   Integrates with user lookup/creation in the local database.

### 8. Multer
*   **Purpose:** Middleware for handling `multipart/form-data`, which is primarily used for uploading files.
*   **Usage:**
    *   Processes file uploads from course creation/editing forms (thumbnails, lesson videos, resources).
    *   Configured with `multer.memoryStorage()` to temporarily hold file buffers in memory before they are streamed to Cloudinary.

### 9. Cloudinary & `cloudinary` library (v2)
*   **Purpose:** A cloud-based media management platform for image and video uploads, storage, optimization, and delivery.
*   **Usage:**
    *   Course thumbnails, lesson videos, and downloadable resources are uploaded to Cloudinary.
    *   This offloads file storage from the application server and provides robust CDN capabilities.
    *   The `streamUploadToCloudinary` helper function in `server.js` manages the upload process.

### 10. `cors` library
*   **Purpose:** Node.js CORS middleware.
*   **Usage:** Enables Cross-Origin Resource Sharing, allowing the frontend (running on a different origin, e.g., `localhost:5173`) to make API requests to the backend (e.g., `localhost:3001`).

### 11. `streamifier` library
*   **Purpose:** Converts a `Buffer` or `String` into a `ReadableStream`.
*   **Usage:** Used in conjunction with Multer's `memoryStorage` and Cloudinary's `upload_stream` to pipe the file buffer (from memory) directly to Cloudinary without needing to save it to disk first.

## II. Frontend Technologies

### 1. Vanilla JavaScript (ES6+ Modules)
*   **Purpose:** The primary programming language for all frontend logic.
*   **Usage:**
    *   **DOM Manipulation:** Dynamically creating and updating HTML content.
    *   **Event Handling:** Managing user interactions (clicks, form submissions, hash changes).
    *   **API Calls:** Using the `fetch` API to communicate with the backend.
    *   **Routing:** Implementing client-side hash-based routing (`window.location.hash`).
    *   **State Management:** Basic client-side state management (e.g., `authState`).
    *   **Component Logic:** UI components are essentially JavaScript functions that return HTML strings.
    *   ES6 Modules (`import`/`export`) are used for code organization.

### 2. HTML5
*   **Purpose:** Structure of the web pages.
*   **Usage:** Semantic HTML elements are used where appropriate to structure the content of different views (e.g., `<header>`, `<main>`, `<footer>`, `<nav>`, `<article>`, `<section>`). Forms (`<form>`), inputs (`<input>`, `<select>`, `<textarea>`), buttons (`<button>`), and lists (`<ul>`, `<li>`) are used extensively.

### 3. CSS3
*   **Purpose:** Styling the visual presentation of the web application.
*   **Usage:**
    *   Global styles, layout, and theming are defined in `frontend/index.css`.
    *   **CSS Variables (Custom Properties):** Used for defining a color palette and reusable spacing/font properties (`:root` block), making theming easier.
    *   **Flexbox & Grid:** Used extensively for layout management (e.g., header, course lists, admin panel grids).
    *   **Responsive Design:** Media queries (`@media`) are used to adapt the layout and styling for different screen sizes (mobile, tablet, desktop).
    *   Styling for various UI states (hover, focus, disabled, active).

### 4. `localStorage`
*   **Purpose:** Web storage API for storing key-value pairs locally in the user's browser.
*   **Usage:**
    *   **Authentication State:** Storing the JWT and basic user details (`skillShareHubToken`, `skillShareHubUser`) to maintain login sessions across browser refreshes.
    *   **Video Playback Progress:** Storing the `currentTime` of videos being watched, allowing users to resume playback later (`skillsharehub_video_progress_*`).

### 5. Import Maps (`<script type="importmap">`)
*   **Purpose:** Allows developers to control the behavior of JavaScript imports, specifically enabling the use of "bare module specifiers" without a build step for certain libraries loaded from CDNs.
*   **Usage:** In `frontend/index.html`, an import map is included:
    ```html
    <script type="importmap">
    {
      "imports": {
        "react/": "https://esm.sh/react@^19.1.0/"
      }
    }
    </script>
    ```
    This particular map is a placeholder for potential future React integration using `esm.sh`. While the project currently doesn't use React, this demonstrates how import maps can simplify using CDN-hosted ES modules. If React were used, one could `import React from 'react';` directly.

## III. Development & Environment

### 1. Environment Variables (`.env` file)
*   **Purpose:** To store configuration settings and sensitive credentials outside of the codebase.
*   **Usage:** The backend relies on a `.env` file (typically gitignored) for `PORT`, `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL`, Cloudinary keys, and Google OAuth keys. The `db.js` and `server.js` files access these variables via `process.env`.

### 2. `nodemon` (Optional, Recommended for Backend Development)
*   **Purpose:** A utility that monitors for any changes in your source and automatically restarts your Node.js application.
*   **Usage:** If installed (`npm install -g nodemon` or as a dev dependency), you can run `nodemon server.js` in the `backend` directory for a smoother development experience, avoiding manual server restarts after code changes.

This technological stack provides a robust foundation for SkillShareHub, balancing modern JavaScript practices on the frontend with a well-structured Node.js/Express backend and scalable cloud services for media and database management.
