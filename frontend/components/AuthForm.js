/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// API_BASE_URL will be derived from API_ORIGIN in app.js for actual fetch calls.
// This constant is primarily for constructing the Google OAuth URL.
const GOOGLE_AUTH_ENDPOINT_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : window.location.origin) + '/api/auth/google';


export function renderAuthForm(type) {
    const isLogin = type === 'login';
    const title = isLogin ? 'Login to SkillShareHub' : 'Create Your SkillShareHub Account';
    const submitButtonText = isLogin ? 'Login' : 'Sign Up';
    const switchLinkText = isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login";
    const switchLinkHref = isLogin ? '#signup' : '#login';

    return `
        <section class="auth-form-container" id="${type}-form-section" aria-labelledby="${type}-form-title">
            <h2 id="${type}-form-title">${title}</h2>
            <form id="${type}-form" novalidate>
                <div id="${type}-feedback" class="form-feedback" aria-live="assertive" style="display:none;"></div>
                ${!isLogin ? `
                    <div class="form-group">
                        <label for="${type}-name">Full Name</label>
                        <input type="text" id="${type}-name" name="name" required autocomplete="name" aria-required="true">
                    </div>
                ` : ''}
                <div class="form-group">
                    <label for="${type}-email">Email Address</label>
                    <input type="email" id="${type}-email" name="email" required autocomplete="email" aria-required="true">
                </div>
                <div class="form-group">
                    <label for="${type}-password">Password</label>
                    <input type="password" id="${type}-password" name="password" required autocomplete="${isLogin ? 'current-password' : 'new-password'}" aria-required="true" minlength="6">
                </div>
                ${!isLogin ? `
                    <div class="form-group">
                        <label for="signup-role">I am a:</label>
                        <select id="signup-role" name="role" required aria-required="true">
                            <option value="learner" selected>Learner</option>
                            <option value="instructor">Instructor</option>
                        </select>
                    </div>
                ` : ''}
                <button type="submit" class="primary">${submitButtonText}</button>
            </form>
            <p>
                <a href="${switchLinkHref}">${switchLinkText}</a>
            </p>
            <div class="divider">OR</div>
            <a href="${GOOGLE_AUTH_ENDPOINT_BASE}" id="google-oauth-btn-link" class="button-like secondary" style="display:flex; align-items:center; justify-content:center; text-decoration:none; background-color: #db4437;" type="button">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" aria-hidden="true" style="width: 18px; height: 18px; margin-right: 8px; vertical-align: middle;">
                Sign ${isLogin ? 'in' : 'up'} with Google
            </a>
        </section>
    `;
}

export async function handleAuthFormSubmit(formElement, type) {
    const feedbackDiv = document.getElementById(`${type}-feedback`);
    if (!feedbackDiv) { console.error('Feedback div not found for form type:', type); return; }
    feedbackDiv.textContent = 'Processing...'; feedbackDiv.className = 'form-feedback processing'; feedbackDiv.style.display = 'block';
    const formData = new FormData(formElement);
    const data = Object.fromEntries(formData.entries());
    if (!data.email || (type ==='signup' && !data.name) || !data.password) {
        feedbackDiv.textContent = 'Please fill in all required fields.'; feedbackDiv.className = 'form-feedback error'; return;
    }
    if (data.password.length < 6) {
        feedbackDiv.textContent = 'Password must be at least 6 characters long.'; feedbackDiv.className = 'form-feedback error'; return;
    }

    // Get API_ORIGIN from global scope (defined in app.js)
    const API_ORIGIN = window.API_ORIGIN || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : window.location.origin);
    const endpoint = type === 'login' ? `${API_ORIGIN}/api/auth/login` : `${API_ORIGIN}/api/auth/signup`;

    try {
        const response = await fetch(endpoint, {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || `An error occurred: ${response.status}`);
        if (type === 'signup') {
            feedbackDiv.textContent = result.message || 'Signup successful! Please login.';
            feedbackDiv.className = 'form-feedback success';
            formElement.reset();
            setTimeout(() => { window.location.hash = '#login'; }, 2000);
        } else { // Login
            const authChangeEvent = new CustomEvent('authChange', { detail: { isAuthenticated: true, user: result.user, token: result.token } });
            document.dispatchEvent(authChangeEvent);
            feedbackDiv.textContent = result.message || 'Login successful! Redirecting...';
            feedbackDiv.className = 'form-feedback success';
        }
    } catch (error) {
        console.error(`Error during ${type}:`, error);
        feedbackDiv.textContent = error.message || `Network error or server issue. Please try again.`;
        feedbackDiv.className = 'form-feedback error';
    }
}
