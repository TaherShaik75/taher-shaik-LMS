/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export function renderHeader(authState) {
    let navLinks = '';
    let utilityLinks = '';

    if (authState && authState.isAuthenticated && authState.user) {
        const userName = authState.user.name || 'User';
        // Start with Welcome message
        navLinks += `<li class="welcome-message">Welcome, ${userName}! (${authState.user.role})</li>`;
        // Then Course Home (always present for logged-in users)
        navLinks += `<li><a href="#home">Course Home</a></li>`;

        let dashboardDefaultLink = '#my-learning'; // Default for learner
        let dropdownItems = `<li><a href="#my-learning">My Learning</a></li>`;

        if (authState.user.role === 'instructor' || authState.user.role === 'admin') {
            dashboardDefaultLink = '#instructor-panel'; // Default for instructor
            dropdownItems += `<li><a href="#instructor-panel">Instructor Panel</a></li>`;
        }
        if (authState.user.role === 'admin') {
            dashboardDefaultLink = '#admin-panel'; // Default for admin (overrides instructor default)
            dropdownItems += `<li><a href="#admin-panel">Admin Panel</a></li>`;
        }

        // If only "My Learning" is the target (Learner role), make "My Dashboard" a direct link.
        if (authState.user.role === 'learner') {
            navLinks += `<li><a href="${dashboardDefaultLink}">My Dashboard</a></li>`;
        } else { // For instructor and admin, create the dropdown
            navLinks += `
                <li class="dropdown-menu-item">
                    <a href="${dashboardDefaultLink}" aria-haspopup="true">My Dashboard</a>
                    <ul class="dropdown-content">
                        ${dropdownItems}
                    </ul>
                </li>`;
        }
        
        utilityLinks = `<li><a href="#logout">Logout</a></li>`;
    } else {
        // If not authenticated, only Course Home in navLinks
        navLinks = `<li><a href="#home">Course Home</a></li>`;
        utilityLinks = `<li><a href="#login">Login</a></li><li><a href="#signup">Sign Up</a></li>`;
    }
    return `<header><nav><a href="#home" class="logo" aria-label="SkillShareHub Home">🎓 SkillShareHub</a><ul>${navLinks}${utilityLinks}</ul></nav></header>`;
}