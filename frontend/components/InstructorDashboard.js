/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

var API_INSTRUCTOR_URL = 'http://localhost:3001/api/instructor';

async function fetchInstructorData(endpoint, token) {
    try {
        const response = await fetch(`${API_INSTRUCTOR_URL}${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `HTTP error ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching instructor data from ${endpoint}:`, error);
        return null;
    }
}

export async function renderInstructorDashboard(authState, pageTitle = "Instructor Dashboard") {
    if (!authState || !authState.isAuthenticated || (authState.user?.role !== 'instructor' && authState.user?.role !== 'admin')) {
        return '<p class="error-message">Access Denied. You must be an instructor or admin to view this page.</p>';
    }
    const token = authState.token;

    let coursesHtml = '<p class="loading-message">Loading your courses...</p>';
    let summaryHtml = '<p class="loading-message">Loading summary...</p>';

    const [myCourses, summaryData] = await Promise.all([
        fetchInstructorData('/courses', token),
        fetchInstructorData('/dashboard-summary', token)
    ]);

    if (myCourses) {
        if (myCourses.length > 0) {
            coursesHtml = `
                <ul class="instructor-courses-list">
                    ${myCourses.map(course => `
                        <li data-course-id="${course.id}">
                            <strong>${course.title}</strong><br>
                            Category: ${course.category} | Price: $${(course.price || 0).toFixed(2)} | Rating: ${course.rating || 'N/A'} ⭐<br>
                            <a href="/#edit-course/${course.id}" class="button-like secondary edit-course-btn">Edit Course</a>
                             <a href="/#course-view/${course.id}" class="button-like secondary view-course-btn" style="margin-left: 5px;">View Course</a>
                        </li>
                    `).join('')}
                </ul>`;
        } else {
            coursesHtml = '<p>You have not created any courses yet. <a href="#create-course">Create your first course</a>!</p>';
        }
    } else {
        coursesHtml = '<p class="error-message">Could not load your courses.</p>';
    }

    if (summaryData) {
        summaryHtml = `
            <p>Total Courses: ${summaryData.totalCourses}</p>
            <p>Total Enrollments: ${summaryData.totalEnrollments}</p>
            <p>Total Revenue: $${(summaryData.totalRevenue || 0).toFixed(2)}</p>
            <p>Average Rating: ${summaryData.averageRating || 'N/A'} ⭐</p>
            <a href="/#instructor-analytics" class="button-like">View Detailed Analytics</a>
        `;
    } else {
        summaryHtml = '<p class="error-message">Could not load dashboard summary.</p>';
    }

    return `
        <section id="instructor-dashboard" class="instructor-dashboard-section" aria-labelledby="instructor-dashboard-title">
            <h2 id="instructor-dashboard-title">${pageTitle}</h2>
            <p>Welcome, ${authState.user.name}! Manage your courses, view enrollments, and track your earnings.</p>
            <a href="#create-course" id="create-new-course-btn-instructor" class="button-like accent">Create New Course</a> 
            
            <h3>My Courses</h3>
            ${coursesHtml}

            <h3>Earnings & Analytics Summary</h3>
            ${summaryHtml}
        </section>
    `;
}