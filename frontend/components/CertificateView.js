/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const API_COURSES_URL = 'http://localhost:3001/api/courses'; 

export async function renderCertificateView(courseIdFromUrl, userIdFromUrl, authState) {
    let courseName = 'this course'; 
    let userName = 'Valued Learner'; 
    let issueDate = new Date().toLocaleDateString();
    let isLoading = true;
    let error = null;

    if (!authState.isAuthenticated || !authState.user) {
        return `<section class="certificate-page-container"><p class="error-message">Please log in to view certificates.</p><p><a href="#login" class="button-like">Login</a></p></section>`;
    }
    
    if (authState.user.userId === userIdFromUrl || authState.user.role === 'admin') {
        userName = authState.user.name; 
    } else {
        // Attempt to fetch the specific user's name if the current user is an admin.
        // This would require a new API endpoint or logic to fetch another user's details.
        // For now, we'll stick to the current user's name if they are the owner, or a generic name.
        console.warn(`Certificate view attempt for user ${userIdFromUrl} by user ${authState.user.userId}. Displaying generic name if not owner/admin.`);
    }


    try {
        const headers = {};
        if (authState.token) headers['Authorization'] = `Bearer ${authState.token}`;

        // Fetch course details
        const courseResponse = await fetch(`${API_COURSES_URL}/${courseIdFromUrl}`, { headers }); 
        if (!courseResponse.ok) {
            const errData = await courseResponse.json().catch(() => ({}));
            throw new Error(errData.message || `Could not fetch course details (status ${courseResponse.status})`);
        }
        const courseDetails = await courseResponse.json();
        if (courseDetails && courseDetails.title) {
            courseName = courseDetails.title;
        }

        // Potentially fetch certificate details if they exist on the backend (e.g., specific issue date)
        // For now, we use the current date as the issue date for simplicity.

    } catch (e) {
        console.error("Error fetching data for certificate:", e);
        error = e.message;
    } finally {
        isLoading = false;
    }

    if (isLoading) {
        return `<section class="certificate-page-container"><p class="loading-message">Loading certificate...</p></section>`;
    }
    if (error) {
        return `<section class="certificate-page-container"><p class="error-message">Could not load certificate: ${error}</p></section>`;
    }


    return `
        <section class="certificate-page-container" aria-labelledby="certificate-main-title">
            <div class="certificate-frame">
                <header class="certificate-header">
                    <h1>🎓 SkillShareHub</h1>
                    <p><em>Platform for Sharing and Gaining Skills</em></p>
                </header>
                <div class="certificate-body">
                    <h2 id="certificate-main-title" class="certificate-title">Certificate of Completion</h2>
                    <p class="certificate-statement presented-to">This certificate is proudly presented to</p>
                    <p class="certificate-recipient-name">${userName}</p>
                    <p class="certificate-statement">for successfully completing the course</p>
                    <p class="certificate-course-name">"${courseName}"</p>
                    <p class="certificate-date">Date of Completion: ${issueDate}</p>
                </div>
                <footer class="certificate-footer">
                    <div class="certificate-signature-placeholder">
                        <p>_________________________</p>
                        <p>Authorized Signature</p>
                    </div>
                    <p class="certificate-platform-name">SkillShareHub Learning Platform</p>
                </footer>
            </div>
             <div style="text-align: center; margin-top: 20px;">
                <button onclick="window.print()" class="button-like primary">Print Certificate</button>
                <a href="#my-learning" class="button-like secondary">Back to Dashboard</a>
            </div>
        </section>
    `;
}