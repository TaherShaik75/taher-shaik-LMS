/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export function renderCourseCard(course) {
    const placeholderImage = 'https://via.placeholder.com/300x200.png?text=Course+Image';
    const displayPrice = course.price ? `$${course.price.toFixed(2)}` : 'Free';
    
    return `
        <article class="course-card" data-course-id="${course.id}" aria-labelledby="course-title-${course.id}">
            <img src="${course.thumbnailUrl || placeholderImage}" alt="${course.title}" class="course-thumbnail">
            <div class="course-card-content">
                <h3 id="course-title-${course.id}">${course.title}</h3>
                <p class="course-instructor">By: ${course.instructorName || course.instructor || 'Unknown Instructor'}</p>
                <p class="course-category">Category: ${course.category}</p>
                <p class="course-price">${displayPrice}</p>
                <p class="course-rating">Rating: ${course.rating ? `${course.rating.toFixed(1)} ⭐` : 'N/A'}</p>
                <button class="button-like primary view-details-btn">View Details</button>
            </div>
        </article>
    `;
}