/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export function renderReviewForm(courseId) {
    return `
        <div class="review-form-container">
            <h4>Write a Review</h4>
            <form id="submit-review-form" data-course-id="${courseId}">
                <div id="review-form-feedback-${courseId}" class="form-feedback" aria-live="assertive" style="display:none;"></div>
                <div class="form-group">
                    <label for="review-rating-${courseId}">Rating:</label>
                    <select id="review-rating-${courseId}" name="rating" required>
                        <option value="">Select Rating</option>
                        <option value="5">5 Stars (Excellent)</option>
                        <option value="4">4 Stars (Good)</option>
                        <option value="3">3 Stars (Average)</option>
                        <option value="2">2 Stars (Fair)</option>
                        <option value="1">1 Star (Poor)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="review-text-${courseId}">Your Review:</label>
                    <textarea id="review-text-${courseId}" name="reviewText" rows="4" required></textarea>
                </div>
                <button type="submit" class="button-like primary">Submit Review</button>
            </form>
        </div>
    `;
}
// Event listener for this form is handled in app.js using delegation by form