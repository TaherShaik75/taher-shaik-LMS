/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// API_BASE_URL_DASHBOARD will be constructed dynamically using API_ORIGIN from app.js

async function fetchDashboardData(endpoint, token) {
    const API_ORIGIN = window.API_ORIGIN || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : window.location.origin);
    const API_DASHBOARD_URL_DYNAMIC = `${API_ORIGIN}/api/dashboard`;
    try {
        const response = await fetch(`${API_DASHBOARD_URL_DYNAMIC}${endpoint}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const errData = await response.json().catch(()=>({}));
            throw new Error(errData.message || `HTTP error ${response.status}`);
        }
        return await response.json();
    } catch (error) { console.error(`Error fetching ${endpoint}:`, error); return null; }
}

export async function renderUserDashboard(user, pageTitle = "My Dashboard") {
    const token = localStorage.getItem('skillShareHubToken');
    if (!token || !user) return `<section class="user-dashboard-section"><p class="error-message">Please <a href="#login">login</a>.</p></section>`;
    
    let enrolledCoursesHtml = '<p class="loading-message">Loading courses...</p>';
    let reviewsHtml = '<p class="loading-message">Loading reviews...</p>';
    let certificatesHtml = '<p class="loading-message">Loading certificates...</p>';
    
    const [enrolledCourses, submittedReviews, earnedCertificates] = await Promise.all([
        fetchDashboardData('/enrolled-courses', token),
        fetchDashboardData('/my-reviews', token),
        fetchDashboardData('/my-certificates', token)
    ]);

    if (enrolledCourses) {
        if (enrolledCourses.length > 0) {
            enrolledCoursesHtml = `<ul class="enrolled-courses-list">${enrolledCourses.map(c => {
                let actionButtonText = 'Proceed';
                let actionButtonClass = 'button-like accent';

                if (c.enrollmentStatus === 'completed' || (c.progress && c.progress === 100)) {
                    actionButtonText = 'Summary';
                    actionButtonClass = 'button-like summary-btn';
                } else if (c.progress === 0 && c.enrollmentStatus === 'enrolled') {
                     actionButtonText = 'Start Learning'; // Or keep "Proceed"
                }


                return `<li class="course-item-ud">
                            <img src="${c.thumbnailUrl || 'https://via.placeholder.com/150x100.png?text=Course'}" alt="${c.title}" class="course-thumbnail-ud">
                            <div class="course-info-ud">
                                <h4>${c.title}</h4>
                                <p class="course-instructor-ud">By: ${c.instructorName || c.instructor}</p>
                                <progress value="${c.progress||0}" max="100"></progress>
                                <span>${c.progress||0}% Complete</span>
                            </div>
                            <div class="course-actions-ud">
                                <a href="#course-view/${c.id}" class="${actionButtonClass}">${actionButtonText}</a>
                            </div>
                        </li>`;
            }).join('')}</ul>`;
        } else enrolledCoursesHtml = '<p>You are not enrolled in any courses yet. <a href="#courses">Explore courses</a>!</p>';
    } else enrolledCoursesHtml = '<p class="error-message">Could not load your enrolled courses.</p>';

    if (submittedReviews) {
        if (submittedReviews.length > 0) {
            reviewsHtml = `<ul class="reviews-list">${submittedReviews.map(r => `<li><strong>${r.courseTitle}</strong> - ${'⭐'.repeat(r.rating)}(${r.rating})<p>${r.reviewText}</p><small>${new Date(r.date||r.createdAt).toLocaleDateString()}</small></li>`).join('')}</ul>`;
        } else reviewsHtml = '<p>You have not submitted any reviews yet.</p>';
    } else reviewsHtml = '<p class="error-message">Could not load your reviews.</p>';

    if (earnedCertificates) {
        if (earnedCertificates.length > 0) {
            certificatesHtml = `<ul class="certificates-list">${earnedCertificates.map(cert => `
                <li>
                    <strong>${cert.courseTitle}</strong> - Issued: ${new Date(cert.issueDate).toLocaleDateString()}
                    <a href="${cert.certificateUrl || '#'}" class="button-like secondary view-certificate-btn" 
                       ${(cert.certificateUrl && cert.certificateUrl !== '#') ? '' : 'disabled aria-disabled="true"'}>
                       View Certificate ${(cert.certificateUrl && cert.certificateUrl !== '#') ? '' : '(Generation Pending or NI)'}
                    </a>
                </li>`).join('')}</ul>`;
        } else certificatesHtml = '<p>You have not earned any certificates yet.</p>';
    } else certificatesHtml = '<p class="error-message">Could not load your certificates.</p>';

    return `
        <section id="user-dashboard" class="user-dashboard-section" aria-labelledby="ud-title">
            <h2 id="ud-title">${pageTitle}</h2>
            <p>Welcome back, ${user.name}! Here's an overview of your learning journey.</p>
            <div class="dashboard-subsection">
                <h3>Enrolled Courses</h3>
                ${enrolledCoursesHtml}
            </div>
            <div class="dashboard-subsection">
                <h3>My Reviews</h3>
                ${reviewsHtml}
            </div>
            <div class="dashboard-subsection">
                <h3>Certificates Earned</h3>
                ${certificatesHtml}
            </div>
        </section>`;
}
