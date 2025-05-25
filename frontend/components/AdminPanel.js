/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const API_ADMIN_URL = 'http://localhost:3001/api/admin';

async function fetchAdminData(endpoint, token) {
    try {
        const response = await fetch(`${API_ADMIN_URL}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
             const errData = await response.json().catch(()=>({message: `HTTP error ${response.status}`}));
             throw new Error(errData.message || `HTTP error ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching admin data from ${endpoint}:`, error);
        return null;
    }
}

export async function renderAdminPanel(authState) {
    if (!authState || !authState.isAuthenticated || authState.user?.role !== 'admin') {
        return '<p class="error-message">Access Denied. You must be an admin.</p>';
    }
    const token = authState.token;

    let userManagementHtml = '<p class="loading-message">Loading users...</p>';
    let contentModerationHtml = '<p class="loading-message">Loading courses...</p>';
    let reviewModerationHtml = '<p class="loading-message">Loading reviews...</p>';

    let totalUsersCount = 'N/A';
    let activeCoursesCount = 'N/A';
    let totalRevenue = 0;
    let topRevenueCourses = [];

    const [userList, rawCourseList, reviewList] = await Promise.all([
        fetchAdminData('/users', token),
        fetchAdminData('/courses', token),
        fetchAdminData('/reviews', token)
    ]);

    // User Management
    if (userList) {
        totalUsersCount = userList.length;
        if (userList.length > 0) {
            userManagementHtml = `
                <div class="admin-user-management-list">
                    <div class="admin-user-management-header">
                        <span>User</span>
                        <span>Role</span>
                        <span>Joined</span>
                        <span style="text-align:center;">Status</span>
                        <span style="text-align:right;">Actions</span>
                    </div>
                    ${userList.map(user => `
                        <div class="admin-user-management-item" data-user-id-li="${user.id}">
                            <span class="um-user" data-label="User: ">${user.name}<br><small>${user.email} ${user.isGoogleUser === 'Yes' ? '(G)' : ''}</small></span>
                            <span class="um-role" data-label="Role: ">${user.role}</span>
                            <span class="um-joined" data-label="Joined: ">${new Date(user.joined).toLocaleDateString()}</span>
                            <span class="um-status" data-label="Status: ">${user.isBlocked ? '🔴 Blocked' : '🟢 Active'}</span>
                            <span class="um-actions">
                                <button class="button-like ${user.isBlocked ? 'secondary' : 'warning'} admin-block-user-btn"
                                        data-user-id="${user.id}"
                                        data-user-name="${user.name}"
                                        data-is-blocked="${user.isBlocked}"
                                        ${user.email === 'admin@skillshare.hub' ? 'disabled' : ''}>
                                    ${user.isBlocked ? 'Unblock' : 'Block'}
                                </button>
                                <button class="button-like danger admin-delete-user-btn"
                                        data-user-id="${user.id}"
                                        data-user-name="${user.name}"
                                        data-user-email="${user.email}"
                                        ${user.email === 'admin@skillshare.hub' ? 'disabled' : ''}>
                                    Delete
                                </button>
                            </span>
                        </div>
                    `).join('')}
                </div>`;
        } else {
            userManagementHtml = '<p>No users found.</p>';
        }
    } else {
        userManagementHtml = '<p class="error-message">Could not load user list.</p>';
    }

    // Content Moderation (Courses)
    if (rawCourseList) {
        activeCoursesCount = rawCourseList.length;
        totalRevenue = rawCourseList.reduce((sum, course) => sum + (course.revenueGenerated || 0), 0);

        const sortedForTrending = [...rawCourseList]
            .filter(c => c.price > 0 && c.revenueGenerated > 0)
            .sort((a, b) => b.revenueGenerated - a.revenueGenerated);

        topRevenueCourses = sortedForTrending.slice(0, 3);

        const courseListWithTrending = rawCourseList.sort((a, b) => new Date(b.created) - new Date(a.created)).map((course) => {
            const rank = sortedForTrending.findIndex(c => c.id === course.id);
            let trendingDisplay = '➖'; // Default for non-trending or free courses
            if (rank !== -1 && rank < 3 && course.price > 0 && course.revenueGenerated > 0) { // Top 3 paid courses
                trendingDisplay = rank === 0 ? `🔥 1` : `${rank + 1}`;
            }
            return { ...course, trendingDisplay };
        });


        if (courseListWithTrending.length > 0) {
            contentModerationHtml = `
                <div class="admin-course-moderation-list">
                    <div class="admin-course-moderation-header">
                        <span style="text-align:center;">Trending</span>
                        <span>Course Name</span>
                        <span>Instructor</span>
                        <span style="text-align:right;">Revenue</span>
                        <span style="text-align:center;">Rating</span>
                        <span style="text-align:right;">Actions</span>
                    </div>
                    ${courseListWithTrending.map(course => `
                        <div class="admin-course-moderation-item">
                            <span class="cm-trending" data-label="Trending: ">${course.trendingDisplay}</span>
                            <span class="cm-course-name" data-label="Course: ">${course.title} <br><small>Category: ${course.category}</small></span>
                            <span class="cm-instructor" data-label="Instructor: ">${course.instructorName}</span>
                            <span class="cm-revenue" data-label="Revenue: " style="text-align:right;">$${(course.revenueGenerated || 0).toFixed(2)}</span>
                            <span class="cm-flagged" data-label="Rating: " style="text-align:center;">${course.rating ? `${course.rating.toFixed(1)} ⭐` : 'N/A'}</span>
                            <span class="cm-actions">
                                <a href="#edit-course/${course.id}" class="button-like secondary admin-edit-course-btn" data-course-id="${course.id}">Edit</a>
                                <button class="button-like danger admin-delete-course-btn" data-course-id="${course.id}" data-course-title="${course.title}">Delete</button>
                            </span>
                        </div>
                    `).join('')}
                </div>`;
        } else {
            contentModerationHtml = '<p>No courses found.</p>';
        }
    } else {
        contentModerationHtml = '<p class="error-message">Could not load course list.</p>';
        activeCoursesCount = 'Error';
    }

    // Review Moderation
    if (reviewList) {
        const sortedReviews = reviewList.sort((a, b) => {
            if (a.isFlagged && !b.isFlagged) return -1;
            if (!a.isFlagged && b.isFlagged) return 1;
            return new Date(b.date) - new Date(a.date);
        });

        if (sortedReviews.length > 0) {
            reviewModerationHtml = `
                <ul class="admin-review-moderation-list">
                    ${sortedReviews.map(review => `
                        <li class="admin-review-item" data-review-id="${review.id}">
                            <div class="review-item-content">
                                <div class="review-text-display">
                                    <p><strong>Review for "${review.courseTitle || 'N/A'}":</strong></p>
                                    <p class="editable-review-text">${review.reviewText}</p>
                                </div>
                                <div class="review-edit-mode" style="display:none;">
                                    <textarea class="review-edit-area" rows="3"></textarea>
                                </div>
                            </div>
                            <div class="review-item-meta">
                                <p><strong>By:</strong> ${review.userName || 'N/A'} (${review.userEmail || 'N/A'})</p>
                                <p><strong>Rating:</strong> ${'⭐'.repeat(review.rating)} (${review.rating}/5)</p>
                                <p><strong>Date:</strong> ${new Date(review.date).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> <span class="admin-review-flag-status" data-flagged="${review.isFlagged}">${review.isFlagged ? '🚩 Flagged' : '🟢 Clear'}</span></p>
                            </div>
                            <div class="review-item-actions">
                                <button class="button-like secondary admin-edit-review-btn">Edit</button>
                                <button class="button-like accent admin-save-review-btn" style="display:none;">Save</button>
                                <button class="button-like admin-cancel-edit-review-btn" style="display:none;">Cancel</button>
                                <button class="button-like ${review.isFlagged ? 'secondary' : 'warning'} admin-toggle-flag-review-btn" data-review-id="${review.id}" data-current-flag-status="${review.isFlagged}">
                                    ${review.isFlagged ? 'Unflag' : 'Flag'}
                                </button>
                                <button class="button-like danger admin-delete-review-btn" data-review-id="${review.id}" data-review-text="${review.reviewText.substring(0, 30)}...">Delete</button>
                            </div>
                        </li>
                    `).join('')}
                </ul>`;
        } else {
            reviewModerationHtml = '<p>No reviews found.</p>';
        }
    } else {
        reviewModerationHtml = '<p class="error-message">Could not load reviews.</p>';
    }


    const topRevenueTooltipContent = topRevenueCourses.length > 0
        ? `<ul>${topRevenueCourses.map(c => `<li>${c.title}: $${c.revenueGenerated.toFixed(2)}</li>`).join('')}</ul>`
        : 'No revenue data for top courses.';

    return `
        <section id="admin-panel" class="admin-panel-section" aria-labelledby="admin-panel-title">
            <h2 id="admin-panel-title">Admin Panel</h2>
            <p>Oversee platform operations, manage users, content, and reviews.</p>

            <div class="admin-metrics-grid">
                <div class="metric-card"><h4>Total Users</h4><p id="admin-total-users-metric" class="metric-value">${totalUsersCount}</p></div>
                <div class="metric-card"><h4>Active Courses</h4><p id="admin-active-courses-metric" class="metric-value">${activeCoursesCount}</p></div>
                <div class="metric-card" id="total-revenue-card">
                    <h4>Total Revenue</h4>
                    <p class="metric-value">$${totalRevenue.toFixed(2)}</p>
                    <div class="metric-tooltip">${topRevenueTooltipContent}</div>
                </div>
            </div>

            <h3>User Management</h3>
            <div id="admin-user-action-feedback" class="form-feedback" aria-live="assertive" style="display:none;"></div>
            ${userManagementHtml}

            <h3>Content Moderation (Courses)</h3>
            <div id="admin-content-action-feedback" class="form-feedback" aria-live="assertive" style="display:none;"></div>
            ${contentModerationHtml}

            <h3>Review Moderation</h3>
            <div id="admin-review-action-feedback" class="form-feedback" aria-live="assertive" style="display:none;"></div>
            ${reviewModerationHtml}

            <h3>Site Settings (NI)</h3>
            <p>Manage system-wide settings and configurations.</p>
        </section>
    `;
}