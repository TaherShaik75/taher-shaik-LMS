/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { renderReviewForm } from './ReviewForm.js';

const API_COURSE_DETAIL_URL = 'http://localhost:3001/api/courses';

export async function renderCourseView(courseId, authState) {
    let courseData = null;
    let isLoading = true;
    let error = null;
    const token = authState.isAuthenticated ? authState.token : null;

    try {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_COURSE_DETAIL_URL}/${courseId}`, { headers });
        if (!response.ok) {
            if (response.status === 404) throw new Error('Course not found.');
            const errData = await response.json().catch(() => ({ message: 'Failed to parse server error.'}));
            throw new Error(errData.message || `HTTP error ${response.status}`);
        }
        courseData = await response.json();
    } catch (e) { error = e.message; } finally { isLoading = false; }

    if (isLoading) return `<section id="course-view-${courseId}" class="course-view-section"><p class="loading-message">Loading course details...</p></section>`;
    if (error) return `<section id="course-view-${courseId}" class="course-view-section"><p class="error-message">Error: ${error}</p></section>`;
    if (!courseData) return `<section id="course-view-${courseId}" class="course-view-section"><p class="not-found">Course details could not be loaded.</p></section>`;

    const { title, description, instructor, instructorName, category, price, thumbnailUrl, tags, reviews, sections, enrollment } = courseData;

    const isOwner = authState.isAuthenticated && authState.user && (authState.user.role === 'instructor' || authState.user.role === 'admin') && authState.user.userId === instructor;

    const displayPrice = price > 0 ? `$${price.toFixed(2)}` : 'Free';
    const placeholderImage = 'https://via.placeholder.com/600x300.png?text=Course+Image';

    const isEnrolled = enrollment && enrollment.status === 'enrolled';
    const isCompleted = enrollment && enrollment.status === 'completed';
    const isPendingPayment = enrollment && enrollment.status === 'pending_payment';
    const completedItems = (enrollment && enrollment.progress && enrollment.progress.completedItems) ? new Set(enrollment.progress.completedItems) : new Set();
    const overallProgress = (enrollment && enrollment.progress) ? enrollment.progress.percentage : 0;

    let hasUserReviewed = false;
    if(authState.isAuthenticated && authState.user && reviews && Array.isArray(reviews)){
        hasUserReviewed = reviews.some(r => r.userId === authState.user.userId);
    }

    let actionButtonHtml = '';
    if (isOwner) {
        actionButtonHtml = `<a href="#edit-course/${courseId}" class="button-like accent">Edit Course</a>`;
    } else if (isCompleted) {
        const certificateUrl = `/#mock-certificate/${courseId}/${authState.user?.userId}`;
        actionButtonHtml = `<button class="button-like accent" disabled>Course Completed!</button>
                           <a href="${certificateUrl}" class="button-like secondary view-certificate-btn">View Certificate</a>`;
    } else if (isEnrolled) {
        actionButtonHtml = `<button class="button-like accent" disabled>Enrolled</button>
                           <a href="#course-content-${courseId}" class="button-like secondary">Continue Learning</a>`;
    } else if (isPendingPayment) {
         actionButtonHtml = `<a href="#payment/${courseId}?enrollmentId=${enrollment.id}" class="button-like warning">Complete Payment</a>`;
    } else { // Not enrolled, not pending
        actionButtonHtml = `<button class="enroll-now-btn button-like primary" data-course-id="${courseId}" data-course-price="${price}">Enroll Now</button>`;
    }

    let sectionsHtml = `<p class="enroll-prompt">Please enroll in the course to access the curriculum and track your progress.</p>`;
    if (isOwner || isEnrolled || isCompleted) { // Content access granted if owner, enrolled, or completed
        if (sections && sections.length > 0) {
            sectionsHtml = `<ul>${sections.map((section, sIdx) => {
                let lessonsHtml = '<p>No lessons in this section.</p>';
                if (section.lessons && section.lessons.length > 0) {
                    lessonsHtml = `<ul>${section.lessons.map((lesson, lIdx) => {
                        const lessonContentItemId = `s${sIdx}_l${lIdx}_content`;
                        const isLessonContentCompleted = completedItems.has(lessonContentItemId);
                        const quizItemId = `s${sIdx}_l${lIdx}_quiz`;
                        const isQuizCompleted = completedItems.has(quizItemId);
                        let quizHtml = '';

                        if (lesson.quiz && lesson.quiz.length > 0) {
                            if (isOwner) {
                                quizHtml = `<div class="quiz-section-cv"><h5>Lesson Quiz (Owner Preview)</h5>
                                    ${lesson.quiz.map((q, qIdx) => `
                                        <div class="quiz-question-cv" data-question-index="${qIdx}">
                                            <p>${qIdx + 1}. ${q.questionText}</p>
                                            <ul class="quiz-options-preview">
                                                ${q.options.map((opt, oIdx) => `
                                                    <li class="${oIdx === q.correctAnswerIndex ? 'correct-answer-preview' : ''}">${opt} ${oIdx === q.correctAnswerIndex ? '<strong>(Correct)</strong>' : ''}</li>
                                                `).join('')}
                                            </ul>
                                        </div>`).join('')}
                                </div>`;
                            } else if (isLessonContentCompleted && (isEnrolled || isCompleted) ) { // Only show quiz if lesson content marked complete AND enrolled/completed
                                quizHtml = `<div class="quiz-section-cv"><h5>Lesson Quiz</h5>
                                    ${isQuizCompleted ? '<p class="quiz-feedback success">Quiz Completed!</p>' : `
                                    <form class="quiz-form" data-course-id="${courseId}" data-section-index="${sIdx}" data-lesson-index="${lIdx}" data-enrollment-id="${enrollment?.id}">
                                        ${lesson.quiz.map((q, qIdx) => `
                                            <div class="quiz-question-cv" data-question-index="${qIdx}">
                                                <p>${qIdx + 1}. ${q.questionText}</p>
                                                <div class="quiz-options-cv">
                                                    ${q.options.map((opt, oIdx) => `
                                                        <label for="q${qIdx}-opt${oIdx}-${courseId}-s${sIdx}-l${lIdx}">
                                                            <input type="radio" id="q${qIdx}-opt${oIdx}-${courseId}-s${sIdx}-l${lIdx}" name="q${qIdx}_s${sIdx}_l${lIdx}" value="${oIdx}" required> ${opt}
                                                        </label>`).join('')}
                                                </div>
                                            </div>`).join('')}
                                        <button type="submit" class="button-like primary">Submit Quiz</button>
                                        <div class="quiz-feedback" style="display:none;"></div>
                                    </form>
                                    `}
                                </div>`;
                            }
                        }

                        let progressMarkerHtml = '';
                        if (!isOwner && enrollment && (isEnrolled || isCompleted)) { // Only show progress tracking if enrolled/completed (not pending payment)
                            if (isEnrolled && !isCompleted) { // If enrolled but not yet fully completed the course
                                progressMarkerHtml = `
                                <span class="progress-marker">
                                    <input type="checkbox" class="progress-item-checkbox"
                                           id="complete-${lessonContentItemId}"
                                           data-item-id="${lessonContentItemId}"
                                           data-enrollment-id="${enrollment.id}"
                                           data-course-id="${courseId}"
                                           ${isLessonContentCompleted ? 'checked disabled' : ''}>
                                    <label for="complete-${lessonContentItemId}" class="${isLessonContentCompleted ? 'completed-item-text' : ''}">${isLessonContentCompleted ? '✔️ Completed' : 'Mark as complete'}</label>
                                </span>`;
                            } else if (isLessonContentCompleted) { // For completed courses, just show completed state
                                progressMarkerHtml = '<span class="completed-item-text accent-text">✔️ Completed</span>';
                            }
                        }

                        const watchVideoButtonHtml = lesson.videoUrl
                            ? `<button class="watch-video-btn button-like secondary small-btn"
                                    data-video-url="${lesson.videoUrl}"
                                    data-lesson-title="${lesson.title}"
                                    data-course-id="${courseId}"
                                    data-section-index="${sIdx}"
                                    data-lesson-index="${lIdx}">Watch Video</button>`
                            : '';


                        return `<li>
                                    <div class="lesson-header-cv">
                                        <h5>${lesson.title}</h5>
                                        ${progressMarkerHtml}
                                    </div>
                                    ${lesson.description ? `<p>${lesson.description.replace(/\n/g, '<br>')}</p>` : ''}
                                    ${watchVideoButtonHtml}
                                    ${lesson.resources && lesson.resources.length > 0 ? `<h6>Resources:</h6><ul>${lesson.resources.map(res => `<li><a href="${res.url}" target="_blank" rel="noopener noreferrer">${res.name}</a></li>`).join('')}</ul>` : ''}
                                    ${quizHtml}
                                </li>`;
                    }).join('')}</ul>`;
                }
                return `<li><h4>${section.title}</h4>${lessonsHtml}</li>`;
            }).join('')}</ul>`;
        } else {
            sectionsHtml = '<p>Curriculum details are not yet available for this course.</p>';
        }
    } else if (isPendingPayment) {
        sectionsHtml = `<p class="enroll-prompt">Your enrollment is pending. Please <a href="#payment/${courseId}?enrollmentId=${enrollment.id}">complete your payment</a> to access the course content.</p>`;
    }


    const reviewsHtml = reviews && reviews.length > 0 ? `<ul>${reviews.map(review => {
        const canFlag = authState.isAuthenticated && authState.user && (isOwner || authState.user.role === 'admin');
        const flagButtonText = review.isFlagged ? 'Unflag Review' : 'Flag Review';
        const flagButtonClass = review.isFlagged ? 'secondary' : 'warning';
        const flagIndicator = review.isFlagged ? `<span class="review-flag-indicator" data-flagged="true">🚩 Flagged</span>` : '';

        return `<li>
                    <strong>${review.reviewerName||'Anonymous'}</strong> - ${'⭐'.repeat(review.rating)}(${review.rating}/5) ${flagIndicator}
                    <p>${review.reviewText}</p>
                    <small>${new Date(review.date||review.createdAt).toLocaleDateString()}</small>
                    ${canFlag ? `<button class="flag-review-btn button-like ${flagButtonClass} small-btn"
                                        data-course-id="${courseId}"
                                        data-review-id="${review.id}"
                                        data-current-flag-status="${review.isFlagged}">
                                    ${flagButtonText}
                                 </button>` : ''}
                </li>`;
    }).join('')}</ul>` : '<p>No reviews yet.</p>';

    return `
        <section id="course-view-${courseId}" class="course-view-section" aria-labelledby="cv-title-${courseId}">
            <div class="course-header-cv">
                <img src="${thumbnailUrl || placeholderImage}" alt="${title}" class="course-thumbnail-cv">
                <div class="course-meta-cv">
                    <h2 id="cv-title-${courseId}">${title}</h2>
                    <p class="instructor-cv">By: ${instructorName||'Unknown'}</p>
                    <p class="category-cv">Category: ${category}</p>
                    <p class="price-cv">${displayPrice}</p>
                    <p class="tags-cv">Tags: ${tags?.join(', ')||'N/A'}</p>
                    <div id="cv-enroll-feedback-${courseId}" class="form-feedback" aria-live="assertive" style="display:none;"></div>
                    ${actionButtonHtml}
                    ${(isEnrolled || isCompleted) && enrollment && !isOwner ? `<div style="margin-top:10px;"><label for="overall-progress-${courseId}">Overall Progress:</label><progress id="overall-progress-${courseId}" value="${overallProgress}" max="100" style="width:100%;"></progress><span>${overallProgress}%</span></div>` : ''}
                </div>
            </div>
            <div class="course-content-cv">
                <h3>About this course</h3>
                <p>${description.replace(/\n/g, '<br>')}</p>
                <h3 id="course-content-${courseId}">Course Curriculum</h3>
                ${sectionsHtml}
            </div>
            <div class="course-reviews-cv">
                <h3>Reviews (${reviews?.length||0})</h3>
                <div id="review-flag-feedback-${courseId}" class="form-feedback" aria-live="assertive" style="display:none;"></div>
                ${reviewsHtml}
                ${(authState.isAuthenticated && (isEnrolled || isCompleted) && !hasUserReviewed && !isOwner) ? renderReviewForm(courseId) : ''}
                ${(authState.isAuthenticated && (isEnrolled || isCompleted) && hasUserReviewed && !isOwner) ? '<p>You have already reviewed this course.</p>' : ''}
                ${!authState.isAuthenticated && !isOwner ? '<p><a href="#login">Login</a> to enroll and write a review.</p>' : ''}
                ${(authState.isAuthenticated && !(isEnrolled || isCompleted) && !isPendingPayment && !isOwner) ? '<p>Enroll in this course to write a review.</p>' : ''}
            </div>
        </section>
        <div id="video-player-modal-container" aria-live="assertive" style="display:none;"></div>
    `;
}