/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const API_INSTRUCTOR_URL = 'http://localhost:3001/api/instructor';

async function fetchInstructorPageData(endpoint, token, sectionName) {
    try {
        const response = await fetch(`${API_INSTRUCTOR_URL}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `HTTP error ${response.status} for ${sectionName}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching instructor ${sectionName} data:`, error);
        return null;
    }
}

export async function renderInstructorAnalytics(authState) {
    if (!authState || !authState.isAuthenticated || (authState.user?.role !== 'instructor' && authState.user?.role !== 'admin')) {
        return '<p class="error-message">Access Denied. You must be an instructor or admin to view this page.</p>';
    }
    const token = authState.token;

    let summaryHtml = '<p class="loading-message">Loading summary...</p>';
    let enrollmentsHtml = '<p class="loading-message">Loading enrollments...</p>';
    let reviewsHtml = '<p class="loading-message">Loading reviews...</p>';

    const [summaryData, enrollmentList, reviewList] = await Promise.all([
        fetchInstructorPageData('/dashboard-summary', token, 'summary'),
        fetchInstructorPageData('/enrollments', token, 'enrollments'),
        fetchInstructorPageData('/reviews', token, 'reviews')
    ]);

    // Summary Metrics
    if (summaryData) {
        summaryHtml = `
            <div class="analytics-summary-grid">
                <div class="analytics-summary-card"><h4>Total Courses</h4><p>${summaryData.totalCourses}</p></div>
                <div class="analytics-summary-card"><h4>Total Enrollments</h4><p>${summaryData.totalEnrollments}</p></div>
                <div class="analytics-summary-card"><h4>Total Revenue</h4><p>$${(summaryData.totalRevenue || 0).toFixed(2)}</p></div>
                <div class="analytics-summary-card"><h4>Average Rating</h4><p>${summaryData.averageRating || 'N/A'} ⭐</p></div>
            </div>
        `;
    } else {
        summaryHtml = '<p class="error-message">Could not load summary data.</p>';
    }

    // Enrollment Management
    if (enrollmentList) {
        if (enrollmentList.length > 0) {
            enrollmentsHtml = `
                <div class="admin-course-moderation-list"> <!-- Reusing styles for grid -->
                    <div class="admin-course-moderation-header" style="grid-template-columns: 2fr 2fr 1fr;">
                        <span>Course Title</span>
                        <span>Enrolled User</span>
                        <span style="text-align:center;">Completion</span>
                    </div>
                    ${enrollmentList.map(enrollment => `
                        <div class="admin-course-moderation-item" style="grid-template-columns: 2fr 2fr 1fr;">
                            <span class="cm-course-name" data-label="Course: ">${enrollment.courseTitle}</span>
                            <span class="cm-instructor" data-label="User: ">${enrollment.userName}<br><small>${enrollment.userEmail}</small></span>
                            <span class="cm-flagged" data-label="Completion: " style="text-align:center;">${enrollment.progressPercentage}% (${enrollment.enrollmentStatus})</span>
                        </div>
                    `).join('')}
                </div>`;
        } else {
            enrollmentsHtml = '<p>No enrollments found for your courses.</p>';
        }
    } else {
        enrollmentsHtml = '<p class="error-message">Could not load enrollment data.</p>';
    }

    // Review Management
    if (reviewList) {
        if (reviewList.length > 0) {
            reviewsHtml = `
                <ul class="instructor-review-list"> <!-- Custom or adapted styles for reviews -->
                    ${reviewList.map(review => `
                        <li class="admin-review-item"> <!-- Reusing admin-review-item structure -->
                            <div class="review-item-content">
                                <p><strong>Review for "${review.courseTitle || 'N/A'}":</strong></p>
                                <p>${review.reviewText}</p>
                            </div>
                            <div class="review-item-meta">
                                <p><strong>By:</strong> ${review.userName || 'N/A'}</p>
                                <p><strong>Rating:</strong> ${'⭐'.repeat(review.rating)} (${review.rating}/5)</p>
                                <p><strong>Date:</strong> ${new Date(review.date).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> <span class="admin-review-flag-status" data-flagged="${review.isFlagged}">${review.isFlagged ? '🚩 Flagged' : '🟢 Clear'}</span></p>
                            </div>
                            <div class="review-item-actions">
                                <button class="button-like ${review.isFlagged ? 'secondary' : 'warning'} instructor-flag-review-btn"
                                        data-course-id="${review.courseId}"
                                        data-review-id="${review.reviewId}"
                                        data-current-flag-status="${review.isFlagged}">
                                    ${review.isFlagged ? 'Unflag Review' : 'Flag Review'}
                                </button>
                            </div>
                        </li>
                    `).join('')}
                </ul>`;
        } else {
            reviewsHtml = '<p>No reviews found for your courses.</p>';
        }
    } else {
        reviewsHtml = '<p class="error-message">Could not load review data.</p>';
    }

    return `
        <section id="instructor-analytics" class="instructor-analytics-section" aria-labelledby="instructor-analytics-title">
            <h2 id="instructor-analytics-title">Detailed Instructor Analytics</h2>
            
            <h3>Performance Summary</h3>
            ${summaryHtml}

            <h3>Course Enrollment Management</h3>
            ${enrollmentsHtml}
            
            <h3>Review Management</h3>
            <div id="instructor-review-feedback" class="form-feedback" aria-live="assertive" style="display:none;"></div>
            ${reviewsHtml}
        </section>
    `;
}