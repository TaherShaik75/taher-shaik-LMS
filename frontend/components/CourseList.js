/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { renderCourseCard } from './CourseCard.js';

// API_COURSES_URL will be constructed dynamically using API_ORIGIN from app.js

export async function renderCourseList(searchParams = new URLSearchParams(), authState) {
    let courses = [];
    let isLoading = true;
    let error = null;
    const queryParams = new URLSearchParams(); 
    if (searchParams.get('query')) queryParams.set('query', searchParams.get('query'));
    if (searchParams.get('category')) queryParams.set('category', searchParams.get('category'));
    if (searchParams.get('price')) queryParams.set('price', searchParams.get('price'));
    
    const API_ORIGIN = window.API_ORIGIN || (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:3001' : window.location.origin);
    const API_COURSES_URL_DYNAMIC = `${API_ORIGIN}/api/courses`;

    try {
        const response = await fetch(`${API_COURSES_URL_DYNAMIC}?${queryParams.toString()}`);
        if (!response.ok) {
            const errData = await response.json().catch(()=>({})); 
            throw new Error(errData.message || `HTTP error ${response.status}`);
        }
        courses = await response.json();
    } catch (e) {
        console.error("Failed to fetch courses:", e);
        error = e.message;
    } finally {
        isLoading = false;
    }
    let content;
    if (isLoading) content = '<p class="loading-message">Loading courses...</p>';
    else if (error) content = `<p class="error-message">Could not load courses: ${error}.</p>`;
    else if (courses.length === 0) content = '<p class="not-found">No courses found.</p>';
    else content = `<div class="course-list">${courses.map(course => renderCourseCard(course)).join('')}</div>`;
    return `<section class="course-list-section" aria-labelledby="cl-title"><h2 id="cl-title" class="sr-only">Courses</h2>${content}</section>`;
}
