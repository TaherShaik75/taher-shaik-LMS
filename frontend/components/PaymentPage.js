/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// API_COURSES_URL_PAYMENT will be constructed dynamically using API_ORIGIN from app.js

export async function renderPaymentPage(courseId, enrollmentId, authState) { // Added enrollmentId parameter
    if (!authState.isAuthenticated) {
        return '<p class="error-message">Please <a href="#login">login</a> to proceed with payment.</p>';
    }

    if (!enrollmentId) { // Crucial check for the new flow
        // This could happen if user navigates directly to payment page without going through enrollment first
        console.error("Payment page loaded without enrollmentId.");
         setTimeout(() => { window.location.hash = `#course-view/${courseId}`; }, 0); // Redirect to course view to restart enrollment
        return '<p class="error-message">Invalid payment session. Please try enrolling again from the course page.</p>';
    }

    let courseDetails;
    const API_ORIGIN = window.API_ORIGIN || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : window.location.origin);
    const API_COURSES_URL_PAYMENT_DYNAMIC = `${API_ORIGIN}/api/courses`;

    try {
        const headers = {};
        if(authState.token) headers['Authorization'] = `Bearer ${authState.token}`;

        const response = await fetch(`${API_COURSES_URL_PAYMENT_DYNAMIC}/${courseId}`, { headers });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Could not fetch course details (status ${response.status})`);
        }
        courseDetails = await response.json();
    } catch (e) {
        console.error("Error fetching course details for payment page:", e);
        return `<section class="payment-page-container-paypal"><p class="error-message">Error loading course details: ${e.message}</p></section>`;
    }

    if (!courseDetails || courseDetails.price === undefined) {
        return `<section class="payment-page-container-paypal"><p class="error-message">Could not determine course price.</p></section>`;
    }
    
    const price = parseFloat(courseDetails.price);

    if (price === 0) {
        setTimeout(() => { window.location.hash = `#course-view/${courseId}`; }, 0);
        return '<p class="loading-message">This is a free course, redirecting...</p>';
    }

    return `
        <section class="payment-page-container-paypal" aria-labelledby="payment-page-title">
            <div id="payment-form-area"> 
                <header class="paypal-header">
                    <h2 id="payment-page-title">SkillShareHub Secure Checkout</h2>
                </header>
                <div class="paypal-order-summary">
                    <h3>Order Summary</h3>
                    <p><strong>Item:</strong> ${courseDetails.title}</p>
                    <p><strong>Price:</strong> <span class="price-display">$${price.toFixed(2)}</span></p>
                </div>
                <form id="payment-form" 
                      data-course-id="${courseId}" 
                      data-course-name="${courseDetails.title}" 
                      data-expected-price="${price.toFixed(2)}"
                      data-enrollment-id="${enrollmentId}"> {/* Pass enrollmentId to the form handler */}
                    <div id="payment-feedback" class="form-feedback" aria-live="assertive" style="display:none;"></div>
                    <p class="payment-disclaimer"><em>You will be enrolled upon clicking 'Pay Now'. This is a simulated payment.</em></p>
                    <button type="submit" class="paypal-like-button">Pay Now $${price.toFixed(2)}</button>
                </form>
                <footer class="paypal-footer-mock">
                    <p>Secured by SkillShareHub | <a href="#privacy" target="_blank">Privacy</a> | <a href="#legal" target="_blank">Legal</a></p>
                </footer>
            </div>
        </section>
    `;
}
