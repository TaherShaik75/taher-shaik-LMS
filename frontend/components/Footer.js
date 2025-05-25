/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export function renderFooter() {
    return `
        <footer>
            <p>© ${new Date().getFullYear()} SkillShareHub. All rights reserved.</p>
            <p>
                <a href="#about">About Us</a> | 
                <a href="#contact">Contact</a> | 
                <a href="#privacy">Privacy Policy</a>
            </p>
        </footer>
    `;
}