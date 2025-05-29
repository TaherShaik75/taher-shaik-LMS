/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { renderHeader } from './components/Header.js';
import { renderFooter } from './components/Footer.js';
import { renderCourseList } from './components/CourseList.js';
import { renderAuthForm, handleAuthFormSubmit } from './components/AuthForm.js';
import { renderUserDashboard } from './components/UserDashboard.js';
import { renderInstructorDashboard } from './components/InstructorDashboard.js';
import { renderAdminPanel } from './components/AdminPanel.js';
import { renderSearchBar } from './components/SearchBar.js';
import * as CreateCourseForm from './components/CreateCourseForm.js';
import * as EditCourseForm from './components/EditCourseForm.js';
import { renderCourseView } from './components/CourseView.js';
import { renderInstructorAnalytics } from './components/InstructorAnalytics.js';
import { renderCertificateView } from './components/CertificateView.js';
import { renderPaymentPage } from './components/PaymentPage.js';


const appContainer = document.getElementById('app-container');
const API_ORIGIN = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : window.location.origin;


let authState = {
    isAuthenticated: false,
    user: null,
    token: null,
};

// Video Player Modal State
let currentVideoModal = null;
let currentVideoElement = null;
let currentVideoProgressKey = null;
let videoTimeUpdateInterval = null;


function loadAuthState() {
    const token = localStorage.getItem('skillShareHubToken');
    const userString = localStorage.getItem('skillShareHubUser');
    if (token && userString) {
        try {
            const user = JSON.parse(userString);
            if (user && user.userId && user.name && user.email && user.role) {
                authState = { isAuthenticated: true, user: user, token: token };
            } else {
                throw new Error("Invalid user object in localStorage");
            }
        } catch (e) {
            console.error("Error parsing user from localStorage or invalid user object:", e);
            localStorage.removeItem('skillShareHubToken');
            localStorage.removeItem('skillShareHubUser');
            authState = { isAuthenticated: false, user: null, token: null };
        }
    }
}

function updateAuthState(newAuthState) {
    authState = newAuthState;
    if (newAuthState.isAuthenticated && newAuthState.token && newAuthState.user) {
        localStorage.setItem('skillShareHubToken', newAuthState.token);
        localStorage.setItem('skillShareHubUser', JSON.stringify(newAuthState.user));
    } else {
        localStorage.removeItem('skillShareHubToken');
        localStorage.removeItem('skillShareHubUser');
    }
    renderAppStructure();
}

function handleOAuthCallback() {
    const hashParamsIndex = window.location.hash.indexOf('?');
    if (window.location.hash.startsWith('#oauth_callback') && hashParamsIndex !== -1) {
        const paramsString = window.location.hash.substring(hashParamsIndex + 1);
        const params = new URLSearchParams(paramsString);
        const token = params.get('token');
        const userString = params.get('user');

        if (token && userString) {
            try {
                const user = JSON.parse(decodeURIComponent(userString));
                updateAuthState({ isAuthenticated: true, user, token });

                let redirectTo = '#my-learning'; // Default redirect
                if (user.role === 'instructor') redirectTo = '#instructor-panel';
                else if (user.role === 'admin') redirectTo = '#admin-panel';

                window.location.hash = redirectTo;
                return true;
            } catch (e) {
                console.error("OAuth Callback Error - Could not parse user data:", e);
                window.location.hash = '#login?oauth_error=parsing_failed';
                return true;
            }
        } else {
            console.warn("OAuth callback detected but token or user data is missing.");
            window.location.hash = '#login?oauth_error=missing_data';
            return true;
        }
    }
    return false;
}


function renderAppStructure() {
    if (!appContainer) {
        console.error("App container #app-container not found!");
        return;
    }
    appContainer.innerHTML = `
        ${renderHeader(authState)}
        <main id="main-content" aria-live="polite"></main>
        ${renderFooter()}
    `;
    renderPageContent();
}

async function renderPageContent() {
    const mainContentContainer = document.getElementById('main-content');
    if (!mainContentContainer) {
        if(appContainer) renderAppStructure();
        return;
    }

    const hash = window.location.hash.split('?')[0] || '#home';
    const queryParams = new URLSearchParams(window.location.hash.split('?')[1] || '');

    mainContentContainer.innerHTML = '<p class="loading-message">Loading page...</p>';

    const protectedRoutes = [
        '#user-dashboard', '#my-learning',
        '#instructor-dashboard', '#instructor-panel',
        '#admin-panel',
        '#create-course', '#instructor-analytics'
    ];
    if ((protectedRoutes.includes(hash) || hash.startsWith('#edit-course/')) && !authState.isAuthenticated) {
        if (!hash.startsWith('#mock-certificate/')) { // Certificates can be viewed publicly if URL is known
             window.location.hash = '#login';
             return;
        }
    }
     if (hash.startsWith('#payment/') && !authState.isAuthenticated) {
        window.location.hash = '#login';
        return;
    }


    if (hash === '#logout') {
        // Clear auth state directly
        localStorage.removeItem('skillShareHubToken');
        localStorage.removeItem('skillShareHubUser');
        authState = { isAuthenticated: false, user: null, token: null };
        
        // Render the header immediately with the logged-out state
        const headerContainer = document.querySelector('header');
        if (headerContainer) { // Check if header exists before trying to replace
            headerContainer.outerHTML = renderHeader(authState);
        } else if (appContainer) { // Fallback if header is not found, re-render essentials
             appContainer.innerHTML = `
                ${renderHeader(authState)}
                <main id="main-content" aria-live="polite"><p class="loading-message">Redirecting...</p></main>
                ${renderFooter()}
            `;
        }
        
        window.location.hash = '#home'; // Navigate to home
        return; // Exit. The hashchange to #home will trigger the next renderPageContent
    }

    let contentToRender = '';
    let pageTitle = 'SkillShareHub';

    if (hash.startsWith('#course-view/')) {
        const courseId = hash.substring('#course-view/'.length);
        contentToRender = await renderCourseView(courseId, authState);
        pageTitle = `View Course - SkillShareHub`;
    } else if (hash.startsWith('#edit-course/')) {
        const courseId = hash.substring('#edit-course/'.length);
        if (authState.user?.role !== 'instructor' && authState.user?.role !== 'admin') {
            contentToRender = '<section class="not-found"><h2>Access Denied</h2><p>You must be an instructor or admin to edit courses.</p><a href="#home">Go to Homepage</a></section>';
        } else {
            contentToRender = await EditCourseForm.renderEditCourseForm(courseId, authState);
        }
        pageTitle = `Edit Course - SkillShareHub`;
    } else if (hash.startsWith('#mock-certificate/')) {
        const parts = hash.substring('#mock-certificate/'.length).split('/');
        const courseIdFromUrl = parts[0];
        const userIdFromUrl = parts[1];
        if (courseIdFromUrl && userIdFromUrl) {
            contentToRender = await renderCertificateView(courseIdFromUrl, userIdFromUrl, authState);
            pageTitle = `Certificate of Completion - SkillShareHub`;
        } else {
            contentToRender = '<p class="error-message">Invalid certificate link format.</p>';
            pageTitle = 'Invalid Link - SkillShareHub';
        }
    } else if (hash.startsWith('#payment/')) {
        const courseId = hash.substring('#payment/'.length);
        const enrollmentId = queryParams.get('enrollmentId'); // Get enrollmentId from query
        if (courseId) {
            contentToRender = await renderPaymentPage(courseId, enrollmentId, authState); // Pass enrollmentId
            pageTitle = 'Complete Enrollment - SkillShareHub';
        } else {
            contentToRender = '<p class="error-message">Invalid payment link: Course ID missing.</p>';
            pageTitle = 'Error - SkillShareHub';
        }
    }
    else {
        switch (hash) {
            case '#home':
            case '#courses':
                const urlParamsForList = new URLSearchParams(window.location.search);
                contentToRender = renderSearchBar(urlParamsForList) + await renderCourseList(urlParamsForList, authState);
                pageTitle = 'Course Home - SkillShareHub';
                break;
            case '#login':
                if (authState.isAuthenticated) { window.location.hash = '#home'; return; }
                contentToRender = renderAuthForm('login');
                pageTitle = 'Login - SkillShareHub';
                break;
            case '#signup':
                if (authState.isAuthenticated) { window.location.hash = '#home'; return; }
                contentToRender = renderAuthForm('signup');
                pageTitle = 'Sign Up - SkillShareHub';
                break;
            case '#user-dashboard': // Legacy, prefer #my-learning
                contentToRender = await renderUserDashboard(authState.user, "My Dashboard");
                pageTitle = 'My Dashboard - SkillShareHub';
                break;
            case '#my-learning':
                contentToRender = await renderUserDashboard(authState.user, "My Learning");
                pageTitle = 'My Learning - SkillShareHub';
                break;
            case '#instructor-dashboard': // Legacy, prefer #instructor-panel
                 if (authState.user?.role !== 'instructor' && authState.user?.role !== 'admin') {
                    contentToRender = '<p class="error-message">Access Denied.</p>';
                 } else {
                    contentToRender = await renderInstructorDashboard(authState, "Instructor Dashboard");
                 }
                pageTitle = 'Instructor Dashboard - SkillShareHub';
                break;
            case '#instructor-panel':
                 if (authState.user?.role !== 'instructor' && authState.user?.role !== 'admin') {
                    contentToRender = '<p class="error-message">Access Denied.</p>';
                 } else {
                    contentToRender = await renderInstructorDashboard(authState, "Instructor Panel");
                 }
                pageTitle = 'Instructor Panel - SkillShareHub';
                break;
            case '#admin-panel':
                if (authState.user?.role !== 'admin') {
                    contentToRender = '<p class="error-message">Access Denied.</p>';
                } else {
                    contentToRender = await renderAdminPanel(authState);
                }
                pageTitle = 'Admin Panel - SkillShareHub';
                break;
            case '#create-course':
                 if (authState.user?.role !== 'instructor' && authState.user?.role !== 'admin') {
                    contentToRender = '<section class="not-found"><h2>Access Denied</h2><p>You must be an instructor or admin to create courses.</p><a href="#home">Go to Homepage</a></section>';
                 } else {
                    contentToRender = CreateCourseForm.renderCreateCourseForm();
                 }
                pageTitle = 'Create Course - SkillShareHub';
                break;
            case '#instructor-analytics':
                if (authState.user?.role !== 'instructor' && authState.user?.role !== 'admin') {
                    contentToRender = '<p class="error-message">Access Denied.</p>';
                } else {
                    contentToRender = await renderInstructorAnalytics(authState);
                }
                pageTitle = 'Instructor Analytics - SkillShareHub';
                break;
            default:
                if (!hash.startsWith('#oauth_callback')) {
                    contentToRender = '<section class="not-found"><h2>Page Not Found</h2><p>Sorry, the page you are looking for does not exist.</p><a href="#home">Go to Homepage</a></section>';
                    pageTitle = 'Page Not Found - SkillShareHub';
                } else {
                    contentToRender = '<p class="loading-message">Processing authentication...</p>';
                }
        }
    }
    mainContentContainer.innerHTML = contentToRender;
    document.title = pageTitle;
    addEventListeners();
}

async function handleAdminDeleteUserClick(buttonElement) {
    const userId = buttonElement.dataset.userId;
    const userName = buttonElement.dataset.userName || 'this user';
    const userEmail = buttonElement.dataset.userEmail || '';
    const adminFeedbackDiv = document.getElementById('admin-user-action-feedback');

    if (!userId) {
        if (adminFeedbackDiv) {
            adminFeedbackDiv.textContent = 'Error: User ID missing for deletion.';
            adminFeedbackDiv.className = 'form-feedback error';
            adminFeedbackDiv.style.display = 'block';
        }
        return;
    }

    if (!window.confirm(`Are you sure you want to delete the user ${userName} (${userEmail})? This action cannot be undone.`)) {
        return;
    }

    if (adminFeedbackDiv) {
        adminFeedbackDiv.textContent = 'Deleting user...';
        adminFeedbackDiv.className = 'form-feedback processing';
        adminFeedbackDiv.style.display = 'block';
    }

    try {
        const response = await fetch(`${API_ORIGIN}/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authState.token}` }
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Failed to delete user (status ${response.status})`);
        }

        if (adminFeedbackDiv) {
            adminFeedbackDiv.textContent = result.message || `User ${userName} deleted successfully. Page will refresh.`;
            adminFeedbackDiv.className = 'form-feedback success';
        }
        renderPageContent(); // Re-render the current page (Admin Panel)
        setTimeout(() => { if(adminFeedbackDiv) adminFeedbackDiv.style.display = 'none'; }, 3000);
    } catch (error) {
        console.error('Error deleting user:', error);
        if (adminFeedbackDiv) {
            adminFeedbackDiv.textContent = error.message || 'An error occurred while deleting the user.';
            adminFeedbackDiv.className = 'form-feedback error';
        }
    }
}

async function handleAdminBlockUserClick(buttonElement) {
    const userId = buttonElement.dataset.userId;
    const userName = buttonElement.dataset.userName || 'this user';
    const currentBlockedStatus = buttonElement.dataset.isBlocked === 'true';
    const action = currentBlockedStatus ? 'unblock' : 'block';
    const adminFeedbackDiv = document.getElementById('admin-user-action-feedback');

    if (!userId) {
        if (adminFeedbackDiv) {
            adminFeedbackDiv.textContent = 'Error: User ID missing for action.';
            adminFeedbackDiv.className = 'form-feedback error';
            adminFeedbackDiv.style.display = 'block';
        }
        return;
    }

    if (!window.confirm(`Are you sure you want to ${action} the user ${userName}?`)) {
        return;
    }

    if (adminFeedbackDiv) {
        adminFeedbackDiv.textContent = `${action === 'block' ? 'Blocking' : 'Unblocking'} user...`;
        adminFeedbackDiv.className = 'form-feedback processing';
        adminFeedbackDiv.style.display = 'block';
    }

    try {
        const response = await fetch(`${API_ORIGIN}/api/admin/users/${userId}/toggle-block`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authState.token}`,
                'Content-Type': 'application/json'
            },
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Failed to ${action} user (status ${response.status})`);
        }

        if (adminFeedbackDiv) {
            adminFeedbackDiv.textContent = result.message || `User ${userName} ${action}ed successfully.`;
            adminFeedbackDiv.className = 'form-feedback success';
        }

        const newBlockedStatus = result.isBlocked;
        buttonElement.textContent = newBlockedStatus ? 'Unblock' : 'Block';
        buttonElement.dataset.isBlocked = newBlockedStatus.toString();
        buttonElement.classList.toggle('warning', !newBlockedStatus);
        buttonElement.classList.toggle('secondary', newBlockedStatus);


        const userRow = buttonElement.closest('.admin-user-management-item');
        if (userRow) {
            const statusCell = userRow.querySelector('.um-status');
            if (statusCell) {
                statusCell.innerHTML = newBlockedStatus ? '🔴 Blocked' : '🟢 Active'; // Use innerHTML for emojis
            }
        }
        setTimeout(() => { if(adminFeedbackDiv) adminFeedbackDiv.style.display = 'none'; }, 3000);
    } catch (error) {
        console.error(`Error ${action}ing user:`, error);
        if (adminFeedbackDiv) {
            adminFeedbackDiv.textContent = error.message || `An error occurred while ${action}ing the user.`;
            adminFeedbackDiv.className = 'form-feedback error';
        }
    }
}


async function handleAdminDeleteCourseClick(buttonElement) {
    const courseId = buttonElement.dataset.courseId;
    const courseTitle = buttonElement.dataset.courseTitle || 'this course';
    const adminFeedbackDiv = document.getElementById('admin-content-action-feedback');

    if (!courseId) {
        if (adminFeedbackDiv) {
            adminFeedbackDiv.textContent = 'Error: Course ID missing for deletion.';
            adminFeedbackDiv.className = 'form-feedback error';
            adminFeedbackDiv.style.display = 'block';
        }
        return;
    }

    if (!window.confirm(`Are you sure you want to delete the course "${courseTitle}"? This will also remove all associated enrollments, reviews, and certificates. This action cannot be undone.`)) {
        return;
    }

    if (adminFeedbackDiv) {
        adminFeedbackDiv.textContent = 'Deleting course...';
        adminFeedbackDiv.className = 'form-feedback processing';
        adminFeedbackDiv.style.display = 'block';
    }

    try {
        const response = await fetch(`${API_ORIGIN}/api/admin/courses/${courseId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authState.token}` }
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Failed to delete course (status ${response.status})`);
        }

        if (adminFeedbackDiv) {
            adminFeedbackDiv.textContent = result.message || `Course "${courseTitle}" deleted successfully.`;
            adminFeedbackDiv.className = 'form-feedback success';
        }

        buttonElement.closest('.admin-course-moderation-item')?.remove();

        const activeCoursesMetric = document.getElementById('admin-active-courses-metric');
        if (activeCoursesMetric) {
            const currentCount = parseInt(activeCoursesMetric.textContent);
            if (!isNaN(currentCount) && currentCount > 0) {
                activeCoursesMetric.textContent = (currentCount - 1).toString();
            }
        }
        setTimeout(() => { if(adminFeedbackDiv) adminFeedbackDiv.style.display = 'none'; }, 3000);
    } catch (error) {
        console.error('Error deleting course:', error);
        if (adminFeedbackDiv) {
            adminFeedbackDiv.textContent = error.message || 'An error occurred while deleting the course.';
            adminFeedbackDiv.className = 'form-feedback error';
        }
    }
}

async function handleAdminDeleteReviewClick(buttonElement) {
    const reviewId = buttonElement.dataset.reviewId;
    const reviewTextSnippet = buttonElement.dataset.reviewText || 'this review';
    const adminFeedbackDiv = document.getElementById('admin-review-action-feedback');

    if (!reviewId) {
        if (adminFeedbackDiv) {
            adminFeedbackDiv.textContent = 'Error: Review ID missing for deletion.';
            adminFeedbackDiv.className = 'form-feedback error';
            adminFeedbackDiv.style.display = 'block';
        }
        return;
    }

    if (!window.confirm(`Are you sure you want to delete the review: "${reviewTextSnippet}"? This action cannot be undone.`)) {
        return;
    }

    if (adminFeedbackDiv) {
        adminFeedbackDiv.textContent = 'Deleting review...';
        adminFeedbackDiv.className = 'form-feedback processing';
        adminFeedbackDiv.style.display = 'block';
    }

    try {
        const response = await fetch(`${API_ORIGIN}/api/admin/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authState.token}` }
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Failed to delete review (status ${response.status})`);
        }

        if (adminFeedbackDiv) {
            adminFeedbackDiv.textContent = result.message || `Review deleted successfully.`;
            adminFeedbackDiv.className = 'form-feedback success';
        }

        buttonElement.closest('.admin-review-item')?.remove();
        setTimeout(() => { if(adminFeedbackDiv) adminFeedbackDiv.style.display = 'none'; }, 3000);
    } catch (error) {
        console.error('Error deleting review:', error);
        if (adminFeedbackDiv) {
            adminFeedbackDiv.textContent = error.message || 'An error occurred while deleting the review.';
            adminFeedbackDiv.className = 'form-feedback error';
        }
    }
}

async function handleInstructorFlagReviewClick(buttonElement) {
    const courseId = buttonElement.dataset.courseId;
    const reviewId = buttonElement.dataset.reviewId;
    const currentFlagStatus = buttonElement.dataset.currentFlagStatus === 'true';
    const action = currentFlagStatus ? 'unflag' : 'flag';
    const feedbackDiv = document.getElementById('instructor-review-feedback');

    if (!courseId || !reviewId) {
        if (feedbackDiv) {
            feedbackDiv.textContent = 'Error: Course or Review ID missing.';
            feedbackDiv.className = 'form-feedback error';
            feedbackDiv.style.display = 'block';
        }
        return;
    }

    if (!window.confirm(`Are you sure you want to ${action} this review?`)) {
        return;
    }

    if (feedbackDiv) {
        feedbackDiv.textContent = `${action === 'flag' ? 'Flagging' : 'Unflagging'} review...`;
        feedbackDiv.className = 'form-feedback processing';
        feedbackDiv.style.display = 'block';
    }

    try {
        const response = await fetch(`${API_ORIGIN}/api/courses/${courseId}/reviews/${reviewId}/toggle-flag`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authState.token}`,
                'Content-Type': 'application/json'
            },
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Failed to ${action} review.`);
        }

        if (feedbackDiv) {
            feedbackDiv.textContent = result.message || `Review ${action}ged successfully.`;
            feedbackDiv.className = 'form-feedback success';
        }

        const reviewItem = buttonElement.closest('.admin-review-item'); // Reusing admin-review-item class
        if (reviewItem) {
            const newFlagStatus = result.review.isFlagged;
            buttonElement.textContent = newFlagStatus ? 'Unflag Review' : 'Flag Review';
            buttonElement.dataset.currentFlagStatus = newFlagStatus.toString();
            buttonElement.classList.toggle('warning', !newFlagStatus);
            buttonElement.classList.toggle('secondary', newFlagStatus);

            const statusIndicator = reviewItem.querySelector('.review-flag-indicator');
            if (statusIndicator) {
                statusIndicator.innerHTML = newFlagStatus ? '🚩 Flagged' : '<span style="color:green;">🟢 Clear</span>';
                statusIndicator.dataset.flagged = newFlagStatus.toString();
            }
        }
         setTimeout(() => { if(feedbackDiv) feedbackDiv.style.display = 'none'; }, 3000);

    } catch (error) {
        console.error(`Error ${action}ging review:`, error);
        if (feedbackDiv) {
            feedbackDiv.textContent = error.message || `An error occurred.`;
            feedbackDiv.className = 'form-feedback error';
        }
    }
}

// Admin Panel - Review Edit Handlers
function handleAdminEditReviewClick(buttonElement) {
    const reviewItem = buttonElement.closest('.admin-review-item');
    if (!reviewItem) return;

    const reviewTextDisplay = reviewItem.querySelector('.review-text-display');
    const reviewEditMode = reviewItem.querySelector('.review-edit-mode');
    const editButton = reviewItem.querySelector('.admin-edit-review-btn');
    const saveButton = reviewItem.querySelector('.admin-save-review-btn');
    const cancelButton = reviewItem.querySelector('.admin-cancel-edit-review-btn');
    const deleteButton = reviewItem.querySelector('.admin-delete-review-btn');
    const flagButton = reviewItem.querySelector('.admin-toggle-flag-review-btn');
    const textarea = reviewItem.querySelector('.review-edit-area');
    const originalTextSpan = reviewItem.querySelector('.editable-review-text');

    if (textarea && originalTextSpan) {
        textarea.value = originalTextSpan.textContent;
    }

    reviewTextDisplay.style.display = 'none';
    reviewEditMode.style.display = 'block';
    if(editButton) editButton.style.display = 'none';
    if(deleteButton) deleteButton.style.display = 'none';
    if(flagButton) flagButton.style.display = 'none';
    if(saveButton) saveButton.style.display = 'inline-block';
    if(cancelButton) cancelButton.style.display = 'inline-block';
}

async function handleAdminSaveReviewClick(buttonElement) {
    const reviewItem = buttonElement.closest('.admin-review-item');
    const reviewId = reviewItem.dataset.reviewId;
    const textarea = reviewItem.querySelector('.review-edit-area');
    const newReviewText = textarea.value.trim();
    const adminFeedbackDiv = document.getElementById('admin-review-action-feedback');

    if (!newReviewText) {
        if (adminFeedbackDiv) {
            adminFeedbackDiv.textContent = 'Review text cannot be empty.';
            adminFeedbackDiv.className = 'form-feedback error';
            adminFeedbackDiv.style.display = 'block';
        }
        return;
    }

    if (adminFeedbackDiv) {
        adminFeedbackDiv.textContent = 'Saving review...';
        adminFeedbackDiv.className = 'form-feedback processing';
        adminFeedbackDiv.style.display = 'block';
    }

    try {
        const response = await fetch(`${API_ORIGIN}/api/admin/reviews/${reviewId}/edit`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authState.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reviewText: newReviewText })
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to save review.');
        }

        if (adminFeedbackDiv) {
            adminFeedbackDiv.textContent = result.message || 'Review saved successfully.';
            adminFeedbackDiv.className = 'form-feedback success';
        }

        const originalTextSpan = reviewItem.querySelector('.editable-review-text');
        if (originalTextSpan) originalTextSpan.textContent = newReviewText;
        handleAdminCancelEditReviewClick(buttonElement);
        setTimeout(() => { if(adminFeedbackDiv) adminFeedbackDiv.style.display = 'none'; }, 3000);
    } catch (error) {
        console.error('Error saving review:', error);
        if (adminFeedbackDiv) {
            adminFeedbackDiv.textContent = error.message || 'An error occurred while saving the review.';
            adminFeedbackDiv.className = 'form-feedback error';
        }
    }
}

function handleAdminCancelEditReviewClick(buttonElement) {
    const reviewItem = buttonElement.closest('.admin-review-item');
    if (!reviewItem) return;

    const reviewTextDisplay = reviewItem.querySelector('.review-text-display');
    const reviewEditMode = reviewItem.querySelector('.review-edit-mode');
    const editButton = reviewItem.querySelector('.admin-edit-review-btn');
    const saveButton = reviewItem.querySelector('.admin-save-review-btn');
    const cancelButton = reviewItem.querySelector('.admin-cancel-edit-review-btn');
    const deleteButton = reviewItem.querySelector('.admin-delete-review-btn');
    const flagButton = reviewItem.querySelector('.admin-toggle-flag-review-btn');


    reviewTextDisplay.style.display = 'block';
    reviewEditMode.style.display = 'none';
    if(editButton) editButton.style.display = 'inline-block';
    if(deleteButton) deleteButton.style.display = 'inline-block';
    if(flagButton) flagButton.style.display = 'inline-block';
    if(saveButton) saveButton.style.display = 'none';
    if(cancelButton) cancelButton.style.display = 'none';

    const adminFeedbackDiv = document.getElementById('admin-review-action-feedback');
    if (adminFeedbackDiv && adminFeedbackDiv.className.includes('error')) {
    } else if (adminFeedbackDiv) {
        // adminFeedbackDiv.style.display = 'none'; // Keep success/processing message from save visible
    }
}

async function handleAdminToggleFlagReviewClick(buttonElement) {
    const reviewId = buttonElement.dataset.reviewId;
    const currentFlagStatus = buttonElement.dataset.currentFlagStatus === 'true';
    const action = currentFlagStatus ? 'unflag' : 'flag';
    const adminFeedbackDiv = document.getElementById('admin-review-action-feedback');

    if (!reviewId) {
        if (adminFeedbackDiv) { adminFeedbackDiv.textContent = 'Error: Review ID missing.'; adminFeedbackDiv.className = 'form-feedback error'; adminFeedbackDiv.style.display = 'block'; }
        return;
    }
    if (!window.confirm(`Are you sure you want to ${action} this review?`)) return;

    if (adminFeedbackDiv) { adminFeedbackDiv.textContent = `${action === 'flag' ? 'Flagging' : 'Unflagging'} review...`; adminFeedbackDiv.className = 'form-feedback processing'; adminFeedbackDiv.style.display = 'block'; }

    try {
        const response = await fetch(`${API_ORIGIN}/api/admin/reviews/${reviewId}/toggle-flag`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${authState.token}`, 'Content-Type': 'application/json' },
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || `Failed to ${action} review.`);

        if (adminFeedbackDiv) { adminFeedbackDiv.textContent = result.message || `Review ${action}ged successfully.`; adminFeedbackDiv.className = 'form-feedback success'; }

        const reviewItem = buttonElement.closest('.admin-review-item');
        if (reviewItem) {
            const newFlagStatus = result.review.isFlagged;
            buttonElement.textContent = newFlagStatus ? 'Unflag Review' : 'Flag Review';
            buttonElement.dataset.currentFlagStatus = newFlagStatus.toString();
            buttonElement.classList.toggle('warning', !newFlagStatus);
            buttonElement.classList.toggle('secondary', newFlagStatus);

            const statusIndicator = reviewItem.querySelector('.admin-review-flag-status');
            if (statusIndicator) {
                statusIndicator.innerHTML = newFlagStatus ? '🚩 Flagged' : '🟢 Clear';
                statusIndicator.dataset.flagged = newFlagStatus.toString();
            }
        }
         setTimeout(() => { if(adminFeedbackDiv) adminFeedbackDiv.style.display = 'none'; }, 3000);
    } catch (error) {
        console.error(`Error ${action}ging review by admin:`, error);
        if (adminFeedbackDiv) { adminFeedbackDiv.textContent = error.message || `An error occurred.`; adminFeedbackDiv.className = 'form-feedback error'; }
    }
}

// Video Player Modal Functions
function openVideoPlayerModal(videoUrl, lessonTitle, courseId, sectionIndex, lessonIndex, currentAuthState) {
    closeVideoPlayerModal(); // Close any existing modal

    const overlay = document.createElement('div');
    overlay.id = 'video-player-modal-overlay';

    const content = document.createElement('div');
    content.id = 'video-player-modal-content';

    const titleEl = document.createElement('h4');
    titleEl.id = 'video-player-title';
    titleEl.textContent = lessonTitle || 'Watch Video';

    const videoEl = document.createElement('video');
    videoEl.controls = true;
    videoEl.src = videoUrl;
    videoEl.style.width = '100%';
    videoEl.style.maxHeight = '80vh';
    videoEl.setAttribute('aria-label', lessonTitle || 'Lesson Video');
    videoEl.setAttribute('playsinline', '');
    videoEl.setAttribute('webkit-playsinline', '');


    const closeBtn = document.createElement('button');
    closeBtn.id = 'video-player-modal-close-btn';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close video player');
    closeBtn.onclick = closeVideoPlayerModal;

    content.appendChild(closeBtn);
    content.appendChild(titleEl);
    content.appendChild(videoEl);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');

    currentVideoModal = overlay;
    currentVideoElement = videoEl;

    // Progress tracking for logged-in users
    if (currentAuthState && currentAuthState.isAuthenticated && currentAuthState.user) {
        const userId = currentAuthState.user.userId;
        currentVideoProgressKey = `skillsharehub_video_progress_${userId}_${courseId}_s${sectionIndex}_l${lessonIndex}`;

        videoEl.onloadedmetadata = () => {
            const savedTime = localStorage.getItem(currentVideoProgressKey);
            if (savedTime) {
                videoEl.currentTime = parseFloat(savedTime);
            }
            videoEl.play().catch(e => console.warn("Autoplay prevented:", e.message)); // Attempt to play
        };

        videoEl.onpause = () => {
            if (currentVideoProgressKey) {
                localStorage.setItem(currentVideoProgressKey, videoEl.currentTime.toString());
            }
        };
        
        // Clear previous interval if any, before setting a new one
        if (videoTimeUpdateInterval) clearInterval(videoTimeUpdateInterval);
        videoTimeUpdateInterval = setInterval(() => {
            if (currentVideoElement && !currentVideoElement.paused && currentVideoProgressKey) {
                localStorage.setItem(currentVideoProgressKey, currentVideoElement.currentTime.toString());
            }
        }, 5000); // Save every 5 seconds
    } else {
        videoEl.play().catch(e => console.warn("Autoplay prevented:", e.message));
    }
    
    document.addEventListener('keydown', handleEscapeKeyForModal);
}

function closeVideoPlayerModal() {
    if (currentVideoElement && currentVideoProgressKey && authState.isAuthenticated) {
        localStorage.setItem(currentVideoProgressKey, currentVideoElement.currentTime.toString());
    }
    if (videoTimeUpdateInterval) {
        clearInterval(videoTimeUpdateInterval);
        videoTimeUpdateInterval = null;
    }
    if (currentVideoElement) {
        currentVideoElement.pause();
        currentVideoElement.src = ''; // Release resource
        currentVideoElement = null;
    }
    if (currentVideoModal) {
        currentVideoModal.remove();
        currentVideoModal = null;
    }
    document.body.classList.remove('no-scroll');
    currentVideoProgressKey = null;
    document.removeEventListener('keydown', handleEscapeKeyForModal);
}

function handleEscapeKeyForModal(event) {
    if (event.key === 'Escape') {
        closeVideoPlayerModal();
    }
}

function handleWatchVideoClick(buttonElement) {
    const videoUrl = buttonElement.dataset.videoUrl;
    const lessonTitle = buttonElement.dataset.lessonTitle;
    const courseId = buttonElement.dataset.courseId;
    const sectionIndex = buttonElement.dataset.sectionIndex;
    const lessonIndex = buttonElement.dataset.lessonIndex;

    if (videoUrl) {
        openVideoPlayerModal(videoUrl, lessonTitle, courseId, sectionIndex, lessonIndex, authState);
    } else {
        console.error('Video URL not found on button.');
    }
}

// Course View - Flag review click handler
async function handleToggleFlagReviewClick(buttonElement) {
    const courseId = buttonElement.dataset.courseId;
    const reviewId = buttonElement.dataset.reviewId;
    const currentFlagStatus = buttonElement.dataset.currentFlagStatus === 'true';
    const action = currentFlagStatus ? 'unflag' : 'flag';
    
    const feedbackContainerId = `review-flag-feedback-${courseId}`;
    const feedbackDiv = document.getElementById(feedbackContainerId);


    if (!courseId || !reviewId) {
        if (feedbackDiv) {
            feedbackDiv.textContent = 'Error: Course or Review ID missing.';
            feedbackDiv.className = 'form-feedback error';
            feedbackDiv.style.display = 'block';
        }
        return;
    }

    if (!window.confirm(`Are you sure you want to ${action} this review?`)) {
        return;
    }

    if (feedbackDiv) {
        feedbackDiv.textContent = `${action === 'flag' ? 'Flagging' : 'Unflagging'} review...`;
        feedbackDiv.className = 'form-feedback processing';
        feedbackDiv.style.display = 'block';
    }

    try {
        const response = await fetch(`${API_ORIGIN}/api/courses/${courseId}/reviews/${reviewId}/toggle-flag`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${authState.token}`,
                'Content-Type': 'application/json'
            },
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || `Failed to ${action} review.`);
        }

        if (feedbackDiv) {
            feedbackDiv.textContent = result.message || `Review ${action}ged successfully.`;
            feedbackDiv.className = 'form-feedback success';
        }

        // Update UI directly for the specific review item
        const reviewLi = buttonElement.closest('li'); // Assuming review is in an <li>
        if (reviewLi) {
            const newFlagStatus = result.review.isFlagged;
            buttonElement.textContent = newFlagStatus ? 'Unflag Review' : 'Flag Review';
            buttonElement.dataset.currentFlagStatus = newFlagStatus.toString();
            buttonElement.classList.toggle('warning', !newFlagStatus);
            buttonElement.classList.toggle('secondary', newFlagStatus);

            let statusIndicator = reviewLi.querySelector('.review-flag-indicator');
            if (!statusIndicator) { // Create if doesn't exist
                statusIndicator = document.createElement('span');
                statusIndicator.className = 'review-flag-indicator';
                const ratingSpan = reviewLi.querySelector('strong'); // Insert after rating
                if(ratingSpan) ratingSpan.insertAdjacentElement('afterend', statusIndicator);
            }
            statusIndicator.innerHTML = newFlagStatus ? '🚩 Flagged' : ''; // Clear if not flagged for CourseView
            statusIndicator.dataset.flagged = newFlagStatus.toString();
            statusIndicator.style.display = newFlagStatus ? 'inline' : 'none';
        }
         setTimeout(() => { if(feedbackDiv) feedbackDiv.style.display = 'none'; }, 3000);

    } catch (error) {
        console.error(`Error ${action}ging review (CourseView):`, error);
        if (feedbackDiv) {
            feedbackDiv.textContent = error.message || `An error occurred.`;
            feedbackDiv.className = 'form-feedback error';
        }
    }
}


function addEventListeners() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    if (mainContent._listenersAttached) return;

    mainContent.addEventListener('submit', async (event) => {
        if (event.target.matches('#login-form') || event.target.matches('#signup-form') ||
            event.target.matches('#create-course-form') || event.target.matches('#edit-course-form') ||
            event.target.matches('#submit-review-form') || event.target.matches('#search-form') ||
            event.target.classList.contains('quiz-form') || event.target.id === 'payment-form' ) {
            event.preventDefault();
        }
        if (event.target.matches('#login-form')) handleAuthFormSubmit(event.target, 'login');
        else if (event.target.matches('#signup-form')) handleAuthFormSubmit(event.target, 'signup');
        else if (event.target.matches('#create-course-form')) CreateCourseForm.handleCreateCourseFormSubmit(event.target);
        else if (event.target.matches('#edit-course-form')) {
            const courseId = event.target.dataset.courseId;
            if (courseId) EditCourseForm.handleEditCourseFormSubmit(event.target, courseId);
            else {
                const feedbackDiv = event.target.querySelector('#edit-course-feedback');
                if(feedbackDiv) { feedbackDiv.textContent = 'Error: Course ID missing.'; feedbackDiv.className = 'form-feedback error'; feedbackDiv.style.display = 'block'; }
            }
        }
        else if (event.target.matches('#submit-review-form')) handleReviewFormSubmit(event.target);
        else if (event.target.matches('#search-form')) handleSearchFormSubmit(event.target);
        else if (event.target.classList.contains('quiz-form')) {
            handleQuizSubmission(event.target, authState);
        } else if (event.target.matches('#payment-form')) {
            const courseId = event.target.dataset.courseId;
            const courseName = event.target.dataset.courseName;
            const expectedPrice = parseFloat(event.target.dataset.expectedPrice);
            const enrollmentId = event.target.dataset.enrollmentId; // Get enrollmentId
            if (courseId && courseName && !isNaN(expectedPrice) && enrollmentId) { // Check for enrollmentId
                handlePaymentFormSubmit(event.target, courseId, courseName, expectedPrice, enrollmentId, authState);
            } else {
                console.error("Missing courseId, courseName, expectedPrice, or enrollmentId on payment form");
                 const feedbackDiv = event.target.querySelector('#payment-feedback');
                 if(feedbackDiv) { feedbackDiv.textContent = 'Error: Form data missing. Please try again.'; feedbackDiv.className = 'form-feedback error'; feedbackDiv.style.display = 'block'; }
            }
        }
    });

    mainContent.addEventListener('click', (event) => {
        const target = event.target;
        const createForm = target.closest('#create-course-form');
        const editForm = target.closest('#edit-course-form');
        const adminPanel = target.closest('#admin-panel');
        const instructorAnalyticsPanel = target.closest('#instructor-analytics');
        const courseViewPanel = target.closest('.course-view-section');


        let FormModule = null;
        if (createForm) FormModule = CreateCourseForm;
        else if (editForm) FormModule = EditCourseForm;

        if (FormModule) {
            if (target.matches('#add-section-btn') || target.classList.contains('add-section-btn')) FormModule.addSection();
            else if (target.classList.contains('remove-section-btn')) FormModule.removeElement(target, '.section-item');
            else if (target.classList.contains('add-lesson-btn')) FormModule.addLesson(target);
            else if (target.classList.contains('remove-lesson-btn')) FormModule.removeElement(target, '.lesson-item');
            else if (target.classList.contains('add-resource-btn')) FormModule.addResource(target);
            else if (target.classList.contains('remove-resource-btn')) FormModule.removeElement(target, '.resource-item');
            else if (target.classList.contains('add-quiz-question-btn')) FormModule.addQuizQuestion(target);
            else if (target.classList.contains('remove-quiz-question-btn')) FormModule.removeElement(target, '.quiz-question-item');
        }

        if (adminPanel) {
            if (target.classList.contains('admin-delete-user-btn')) handleAdminDeleteUserClick(target);
            else if (target.classList.contains('admin-block-user-btn')) handleAdminBlockUserClick(target);
            else if (target.classList.contains('admin-delete-course-btn')) handleAdminDeleteCourseClick(target);
            else if (target.classList.contains('admin-delete-review-btn')) handleAdminDeleteReviewClick(target);
            else if (target.classList.contains('admin-edit-review-btn')) handleAdminEditReviewClick(target);
            else if (target.classList.contains('admin-save-review-btn')) handleAdminSaveReviewClick(target);
            else if (target.classList.contains('admin-cancel-edit-review-btn')) handleAdminCancelEditReviewClick(target);
            else if (target.classList.contains('admin-toggle-flag-review-btn')) handleAdminToggleFlagReviewClick(target);
        }

        if (instructorAnalyticsPanel) {
            if (target.classList.contains('instructor-flag-review-btn')) {
                handleInstructorFlagReviewClick(target);
            }
        }
        
        if (courseViewPanel) {
            if (target.classList.contains('flag-review-btn')) { // For Course View page flagging
                handleToggleFlagReviewClick(target);
            }
            if (target.classList.contains('watch-video-btn')) {
                handleWatchVideoClick(target);
            }
        }


        if (target.matches('.enroll-now-btn')) {
            const courseId = target.dataset.courseId;
            const coursePrice = parseFloat(target.dataset.coursePrice);
            if (courseId && !isNaN(coursePrice)) {
                handleEnrollment(courseId, coursePrice, authState);
            } else {
                console.error("Course ID or Price not found for enrollment from button data attributes");
                const feedbackDiv = target.closest('.course-meta-cv')?.querySelector(`#cv-enroll-feedback-${courseId}`);
                if (feedbackDiv) {
                    feedbackDiv.textContent = 'Error initiating enrollment. Please try again.';
                    feedbackDiv.className = 'form-feedback error';
                    feedbackDiv.style.display = 'block';
                }
            }
        } else if (target && (target.matches('.course-card button.view-details-btn') || target.closest('.course-card button.view-details-btn'))) {
             const card = target.closest('.course-card');
             const courseId = card?.dataset.courseId;
             if(courseId) window.location.hash = `#course-view/${courseId}`;
        }
    });
    mainContent.addEventListener('change', (event) => {
        if (event.target.classList.contains('progress-item-checkbox')) {
            const itemId = event.target.dataset.itemId;
            const enrollmentId = event.target.dataset.enrollmentId;
            const courseId = event.target.dataset.courseId;
            const isCompleted = event.target.checked;
            if (itemId && enrollmentId && courseId) {
                handleProgressUpdate(itemId, isCompleted, enrollmentId, courseId, authState);
            }
        }
    });

    mainContent._listenersAttached = true;

    const header = document.querySelector('header');
    if (header) {
        header.addEventListener('click', (event) => {
            // No specific header button listeners needed for now
        });
     }
}

async function handleSearchFormSubmit(formElement) {
    const formData = new FormData(formElement);
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) { if (value) params.set(key, value); }
    const courseListingHash = '#courses';
    history.pushState(null, '', `?${params.toString()}${courseListingHash}`);
    renderPageContent();
}

async function handleEnrollment(courseId, coursePrice, currentAuthState) {
    if (!currentAuthState.isAuthenticated) {
        window.location.hash = '#login';
        return;
    }

    const courseViewPage = document.getElementById(`course-view-${courseId}`);
    let feedbackDiv = courseViewPage ? courseViewPage.querySelector(`#cv-enroll-feedback-${courseId}`) : null;
    if (!feedbackDiv && document.getElementById('main-content')) { /* ... create feedbackDiv if not found ... */ }

    if (feedbackDiv) { feedbackDiv.textContent = 'Processing enrollment...'; feedbackDiv.className = 'form-feedback processing'; feedbackDiv.style.display = 'block'; }

    try {
        const response = await fetch(`${API_ORIGIN}/api/enrollments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentAuthState.token}`},
            body: JSON.stringify({ courseId })
        });
        const result = await response.json();
        if (!response.ok && response.status !== 200) throw new Error(result.message || `Enrollment failed`);
        
        const enrollment = result.enrollment;

        if (coursePrice > 0 && enrollment && enrollment.status === 'pending_payment') {
            // Paid course, redirect to payment page with enrollmentId
            window.location.hash = `#payment/${courseId}?enrollmentId=${enrollment.id}`;
            if (feedbackDiv) { feedbackDiv.textContent = 'Redirecting to payment...'; feedbackDiv.className = 'form-feedback info'; }
        } else if (coursePrice === 0 && enrollment && enrollment.status === 'enrolled') {
            // Free course, enrollment successful
            if (feedbackDiv) {
                feedbackDiv.textContent = result.message || 'Successfully enrolled!';
                feedbackDiv.className = 'form-feedback success';
            }
            setTimeout(() => { window.location.hash = `#course-view/${courseId}`; }, 100);
        } else if (enrollment && enrollment.status === 'enrolled') { // Already enrolled (could be paid course previously completed payment)
             if (feedbackDiv) {
                feedbackDiv.textContent = result.message || 'Already enrolled!';
                feedbackDiv.className = 'form-feedback info';
            }
            setTimeout(() => { window.location.hash = `#course-view/${courseId}`; }, 100);
        } else {
            // Other unexpected status or missing enrollment
             throw new Error(result.message || 'Enrollment status unclear.');
        }
    } catch (error) {
        console.error('Enrollment error:', error);
        if (feedbackDiv) { feedbackDiv.textContent = error.message || 'Enrollment failed.'; feedbackDiv.className = 'form-feedback error';}
    }
}

async function handlePaymentFormSubmit(formElement, courseId, courseName, expectedPrice, enrollmentId, currentAuthState) {
    const feedbackDiv = formElement.querySelector('#payment-feedback');
    if (feedbackDiv) { feedbackDiv.textContent = 'Processing payment and confirming enrollment...'; feedbackDiv.className = 'form-feedback processing'; feedbackDiv.style.display = 'block'; }

    if (!enrollmentId) {
        if (feedbackDiv) { feedbackDiv.textContent = 'Error: Enrollment ID missing. Please try enrolling again.'; feedbackDiv.className = 'form-feedback error'; }
        return;
    }

    try {
        const response = await fetch(`${API_ORIGIN}/api/enrollments/${enrollmentId}/confirm-payment`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentAuthState.token}` }
            // No body needed if just confirming with enrollmentId in URL
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Payment confirmation or enrollment update failed.');
        }

        const paymentFormArea = document.getElementById('payment-form-area');
        if (paymentFormArea) {
            const now = new Date();
            const transactionId = `SSH-MOCK-${now.getTime()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            const receiptHtml = `
                <div class="payment-receipt-container">
                    <header class="receipt-header">
                        <h2>Payment Successful!</h2>
                        <p>Your mock payment receipt</p>
                    </header>
                    <div class="receipt-details">
                        <p><strong>Transaction ID:</strong> ${transactionId}</p>
                        <p><strong>Date & Time:</strong> ${now.toLocaleString()}</p>
                        <p><strong>Billed To:</strong> ${currentAuthState.user.email}</p>
                        <p><strong>Payment Method:</strong> Mock Secure Checkout</p>
                        <p><strong>Seller:</strong> SkillShareHub</p>
                    </div>
                    <div class="receipt-items">
                        <h4>Item Details</h4>
                        <div class="receipt-item">
                            <span>${courseName}</span>
                            <span>$${expectedPrice.toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="receipt-total">
                        <p><strong>Total Paid:</strong> $${expectedPrice.toFixed(2)}</p>
                        <p><strong>Status:</strong> Completed</p>
                    </div>
                    <div class="receipt-actions">
                        <a href="#course-view/${courseId}" class="button-like primary">Continue to Course</a>
                    </div>
                </div>`;
            paymentFormArea.innerHTML = receiptHtml;
        } else {
             if (feedbackDiv) {
                feedbackDiv.textContent = result.message || 'Payment successful, enrolled! (Receipt area not found)';
                feedbackDiv.className = 'form-feedback success';
             }
        }
    } catch (error) {
        console.error('Payment/Confirmation error:', error);
        if (feedbackDiv) { feedbackDiv.textContent = error.message || 'Payment confirmation or enrollment failed.'; feedbackDiv.className = 'form-feedback error';}
    }
}


async function handleReviewFormSubmit(formElement) {
    const courseId = formElement.dataset.courseId;
    const rating = formElement.elements.rating.value;
    const reviewText = formElement.elements.reviewText.value;
    const token = authState.token;
    const feedbackEl = formElement.querySelector('.form-feedback');

    if (!rating || !reviewText) {
        if (feedbackEl) { feedbackEl.textContent = 'Rating and review text are required.'; feedbackEl.className = 'form-feedback error';  feedbackEl.style.display = 'block';}
        return;
    }
    if (feedbackEl) { feedbackEl.textContent = 'Submitting...'; feedbackEl.className = 'form-feedback processing'; feedbackEl.style.display = 'block';}

    try {
        const response = await fetch(`${API_ORIGIN}/api/courses/${courseId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ rating, reviewText })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to submit review');

        if (feedbackEl) { feedbackEl.textContent = 'Review submitted successfully!'; feedbackEl.className = 'form-feedback success';}
        formElement.reset();

        const mainContentContainer = document.getElementById('main-content');
        if(mainContentContainer && window.location.hash.split('?')[0] === `#course-view/${courseId}`) {
            // Trigger a re-render of the course view page to show the new review
            renderPageContent(); // This will re-fetch and re-render CourseView
        }
    } catch (error) {
        if (feedbackEl) { feedbackEl.textContent = error.message; feedbackEl.className = 'form-feedback error';}
        console.error('Review submission error:', error);
    }
}

async function handleProgressUpdate(itemId, isCompleted, enrollmentId, courseId, currentAuthState) {
    const courseViewPage = document.getElementById(`course-view-${courseId}`);
    let feedbackDiv = null;
    if(courseViewPage) feedbackDiv = courseViewPage.querySelector(`#cv-enroll-feedback-${courseId}`); // Use the general enrollment feedback div for progress

    if (feedbackDiv) { feedbackDiv.textContent = 'Updating progress...'; feedbackDiv.className = 'form-feedback processing'; feedbackDiv.style.display = 'block';}

    try {
        const response = await fetch(`${API_ORIGIN}/api/enrollments/${enrollmentId}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentAuthState.token}` },
            body: JSON.stringify({ itemId, completed: isCompleted })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to update progress.');
        if (feedbackDiv) { feedbackDiv.textContent = 'Progress updated!'; feedbackDiv.className = 'form-feedback success'; }

        setTimeout(() => {
            if(feedbackDiv) feedbackDiv.style.display = 'none';
            if (window.location.hash.split('?')[0] === `#course-view/${courseId}`) {
                renderPageContent(); // Re-render to update progress bar and potentially certificate status
            }
        }, 1000);
    } catch (error) {
        console.error("Progress update error:", error);
        if (feedbackDiv) { feedbackDiv.textContent = error.message || 'Failed to update progress.'; feedbackDiv.className = 'form-feedback error'; }
    }
}

async function handleQuizSubmission(formElement, currentAuthState) {
    const courseId = formElement.dataset.courseId;
    const sectionIndex = formElement.dataset.sectionIndex;
    const lessonIndex = formElement.dataset.lessonIndex;
    const enrollmentId = formElement.dataset.enrollmentId;
    const quizFeedbackDiv = formElement.querySelector('.quiz-feedback');

    if (quizFeedbackDiv) { quizFeedbackDiv.textContent = 'Submitting quiz...'; quizFeedbackDiv.className = 'quiz-feedback processing'; quizFeedbackDiv.style.display = 'block';}

    const answers = {};
    formElement.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
        answers[radio.name] = radio.value;
    });

    try {
        const response = await fetch(`${API_ORIGIN}/api/quizzes/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentAuthState.token}` },
            body: JSON.stringify({ courseId, sectionIndex, lessonIndex, enrollmentId, answers })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to submit quiz.');
        if (quizFeedbackDiv) {
            quizFeedbackDiv.textContent = result.message || `Quiz Submitted! Score: ${result.score}%`;
            quizFeedbackDiv.className = result.passed ? 'quiz-feedback success' : 'quiz-feedback error';
        }
        if (window.location.hash.split('?')[0] === `#course-view/${courseId}`) {
            renderPageContent(); // Re-render to update progress and quiz status
        }
    } catch (error) {
        console.error('Quiz submission error:', error);
        if (quizFeedbackDiv) { quizFeedbackDiv.textContent = error.message || 'Failed to submit quiz.'; quizFeedbackDiv.className = 'quiz-feedback error'; }
    }
}

document.addEventListener('authChange', (event) => { updateAuthState(event.detail); });
window.addEventListener('hashchange', () => {
    const headerElement = document.querySelector('header');
    if (headerElement && appContainer.contains(headerElement)) {
         headerElement.outerHTML = renderHeader(authState);
    } else if(appContainer) {
        // If header isn't part of appContainer (e.g., after full innerHTML replacement), re-render full structure.
        renderAppStructure();
        return; // renderAppStructure calls renderPageContent
    }
    renderPageContent();
});
document.addEventListener('DOMContentLoaded', () => {
    loadAuthState();
    const oauthHandled = handleOAuthCallback();
    if (!oauthHandled) {
        renderAppStructure();
    }
});
