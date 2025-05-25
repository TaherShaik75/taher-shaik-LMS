/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const API_COURSES_URL = 'http://localhost:3001/api/courses';

let editSectionCounter = 0;
let editLessonCounters = {};
let editResourceCounters = {};
let editQuizCounters = {};

function _getSectionHTML(sectionIndex, sectionData = {}) {
    const title = sectionData.title || '';
    editLessonCounters[sectionIndex.toString()] = sectionData.lessons ? sectionData.lessons.length : 0;

    return `
        <div class="section-item" data-section-index="${sectionIndex}">
            <div class="section-header"><h4>Section ${sectionIndex + 1}</h4><button type="button" class="remove-section-btn remove-btn">Remove Section</button></div>
            <div class="form-group"><label for="edit-section-title-${sectionIndex}">Section Title</label><input type="text" id="edit-section-title-${sectionIndex}" class="section-title-input" value="${title}" required></div>
            <div class="lessons-container" id="edit-lessons-container-${sectionIndex}">${sectionData.lessons ? sectionData.lessons.map((lesson, lessonIdx) => _getLessonHTML(sectionIndex, lessonIdx, lesson)).join('') : ''}</div>
            <button type="button" class="add-lesson-btn add-btn" data-section-index="${sectionIndex}">+ Add Lesson</button>
        </div>`;
}

function _getLessonHTML(sectionIndex, lessonIndex, lessonData = {}) {
    const title = lessonData.title || '';
    const videoUrl = lessonData.videoUrl || '';
    const description = lessonData.description || '';
    const videoFileFieldName = `lesson_s${sectionIndex}_l${lessonIndex}_videoFile`;
    const currentVideoDisplay = videoUrl ? `<p style="font-size:0.8em; margin-top:5px;">Current Video: <a href="${videoUrl}" target="_blank" rel="noopener noreferrer">${videoUrl.substring(0,40)}...</a></p>` : '<p style="font-size:0.8em; margin-top:5px;">No current video URL.</p>';
    const lessonKey = `${sectionIndex}_${lessonIndex}`;
    editResourceCounters[lessonKey] = lessonData.resources ? lessonData.resources.length : 0;
    editQuizCounters[lessonKey] = lessonData.quiz ? lessonData.quiz.length : 0;


    return `
        <div class="lesson-item" data-section-index="${sectionIndex}" data-lesson-index="${lessonIndex}">
            <div class="lesson-header"><h5>Lesson ${sectionIndex + 1}.${lessonIndex + 1}</h5><button type="button" class="remove-lesson-btn remove-btn">Remove Lesson</button></div>
            <div class="form-group"><label for="edit-lesson-title-${sectionIndex}-${lessonIndex}">Title</label><input type="text" id="edit-lesson-title-${sectionIndex}-${lessonIndex}" class="lesson-title-input" value="${title}" required></div>
            <div class="form-group">
                <label for="edit-lesson-videoUrl-${sectionIndex}-${lessonIndex}">Video URL (Enter new to replace, or leave blank to keep current/use upload)</label>
                <input type="url" id="edit-lesson-videoUrl-${sectionIndex}-${lessonIndex}" class="lesson-videoUrl-input" value="${videoUrl}" placeholder="New video URL (optional)">
                ${currentVideoDisplay}
            </div>
            <div class="form-group"><label for="edit-${videoFileFieldName}">Or Upload New Video File (Replaces existing video):</label><input type="file" id="edit-${videoFileFieldName}" name="${videoFileFieldName}" class="lesson-videoFile-input" accept="video/*"></div>
            <div class="form-group"><label for="edit-lesson-description-${sectionIndex}-${lessonIndex}">Description</label><textarea id="edit-lesson-description-${sectionIndex}-${lessonIndex}" class="lesson-description-input" rows="3">${description}</textarea></div>
            <div class="resources-container" id="edit-resources-container-${sectionIndex}-${lessonIndex}"><h6>Resources:</h6>${lessonData.resources ? lessonData.resources.map((res, rIdx) => _getResourceHTML(sectionIndex, lessonIndex, rIdx, res)).join('') : ''}</div>
            <button type="button" class="add-resource-btn add-btn" data-section-index="${sectionIndex}" data-lesson-index="${lessonIndex}">+ Add Resource</button>
            <div class="quiz-container" id="edit-quiz-container-${sectionIndex}-${lessonIndex}"><h6>Quiz:</h6>${lessonData.quiz ? lessonData.quiz.map((q, qIdx) => _getQuizQuestionHTML(sectionIndex, lessonIndex, qIdx, q)).join('') : ''}</div>
            <button type="button" class="add-quiz-question-btn add-btn" data-section-index="${sectionIndex}" data-lesson-index="${lessonIndex}">+ Add Quiz Question</button>
        </div>`;
}

function _getResourceHTML(sectionIndex, lessonIndex, resourceIndex, resourceData = {}) {
    const name = resourceData.name || '';
    const url = resourceData.url || '';
    const resourceFileFieldName = `resource_s${sectionIndex}_l${lessonIndex}_r${resourceIndex}_file`;
    const currentResourceDisplay = url ? `<p style="font-size:0.8em; margin-top:5px;">Current Resource: <a href="${url}" target="_blank" rel="noopener noreferrer">${url.substring(0,40)}...</a></p>` : '<p style="font-size:0.8em; margin-top:5px;">No current resource URL.</p>';

    return `
        <div class="resource-item" data-section-index="${sectionIndex}" data-lesson-index="${lessonIndex}" data-resource-index="${resourceIndex}">
            <div class="resource-header"><p class="item-label">Resource ${resourceIndex + 1}</p><button type="button" class="remove-resource-btn remove-btn">X</button></div>
            <div class="form-group"><label for="edit-resource-name-${sectionIndex}-${lessonIndex}-${resourceIndex}">Name</label><input type="text" id="edit-resource-name-${sectionIndex}-${lessonIndex}-${resourceIndex}" class="resource-name-input" value="${name}" required></div>
            <div class="form-group">
                <label for="edit-resource-url-${sectionIndex}-${lessonIndex}-${resourceIndex}">URL (Enter new to replace, or leave blank to keep current/use upload)</label>
                <input type="url" id="edit-resource-url-${sectionIndex}-${lessonIndex}-${resourceIndex}" class="resource-url-input" value="${url}" placeholder="New resource URL (optional)">
                ${currentResourceDisplay}
            </div>
            <div class="form-group"><label for="edit-${resourceFileFieldName}">Or Upload New Resource File (Replaces existing resource):</label><input type="file" id="edit-${resourceFileFieldName}" name="${resourceFileFieldName}" class="resource-file-input"></div>
        </div>`;
}

function _getQuizQuestionHTML(sectionIndex, lessonIndex, questionIndex, questionData = {}) {
    const questionText = questionData.questionText || '';
    const options = questionData.options || ['', '', '', ''];
    const correctAnswerIndex = questionData.correctAnswerIndex !== undefined ? questionData.correctAnswerIndex : 0;
    let optionsHTML = '';
    for (let i = 0; i < 4; i++) {
        optionsHTML += `
            <div class="form-group">
                <label for="edit-quiz-option-${sectionIndex}-${lessonIndex}-${questionIndex}-${i}">Option ${i + 1}</label>
                <input type="text" id="edit-quiz-option-${sectionIndex}-${lessonIndex}-${questionIndex}-${i}" required class="quiz-option-input" value="${options[i] || ''}">
            </div>`;
    }
    return `
        <div class="quiz-question-item" data-section-index="${sectionIndex}" data-lesson-index="${lessonIndex}" data-question-index="${questionIndex}">
            <div class="quiz-header"><p class="item-label">Question ${questionIndex + 1}</p><button type="button" class="remove-quiz-question-btn remove-btn">X</button></div>
            <div class="form-group"><label for="edit-quiz-questionText-${sectionIndex}-${lessonIndex}-${questionIndex}">Question Text</label><textarea id="edit-quiz-questionText-${sectionIndex}-${lessonIndex}-${questionIndex}" required class="quiz-questionText-input" rows="2">${questionText}</textarea></div>
            ${optionsHTML}
            <div class="form-group">
                <label for="edit-quiz-correctAnswer-${sectionIndex}-${lessonIndex}-${questionIndex}">Correct Answer</label>
                <select id="edit-quiz-correctAnswer-${sectionIndex}-${lessonIndex}-${questionIndex}" required class="quiz-correctAnswer-select">
                    <option value="0" ${correctAnswerIndex === 0 ? 'selected' : ''}>Option 1</option>
                    <option value="1" ${correctAnswerIndex === 1 ? 'selected' : ''}>Option 2</option>
                    <option value="2" ${correctAnswerIndex === 2 ? 'selected' : ''}>Option 3</option>
                    <option value="3" ${correctAnswerIndex === 3 ? 'selected' : ''}>Option 4</option>
                </select>
            </div>
        </div>`;
}

export function addSection(initialData = {}) {
    const sectionsContainer = document.getElementById('sections-container');
    if (sectionsContainer) {
        const newSectionHTML = _getSectionHTML(editSectionCounter, initialData);
        sectionsContainer.insertAdjacentHTML('beforeend', newSectionHTML);
        editLessonCounters[editSectionCounter.toString()] = initialData.lessons ? initialData.lessons.length : 0;
        editSectionCounter++;
    }
}
export function removeElement(buttonEl, parentSelector) {
    const elementToRemove = buttonEl.closest(parentSelector);
    if (elementToRemove) elementToRemove.remove();
}
export function addLesson(addLessonButtonEl, initialData = {}) {
    const sectionIndex = addLessonButtonEl.dataset.sectionIndex;
    const lessonsContainer = document.getElementById(`edit-lessons-container-${sectionIndex}`);
    if (lessonsContainer) {
        const sectionIndexStr = sectionIndex.toString();
        if (editLessonCounters[sectionIndexStr] === undefined) editLessonCounters[sectionIndexStr] = 0;
        const currentLessonIndex = editLessonCounters[sectionIndexStr];
        lessonsContainer.insertAdjacentHTML('beforeend', _getLessonHTML(sectionIndex, currentLessonIndex, initialData));
        const lessonKey = `${sectionIndexStr}_${currentLessonIndex}`;
        editResourceCounters[lessonKey] = initialData.resources ? initialData.resources.length : 0;
        editQuizCounters[lessonKey] = initialData.quiz ? initialData.quiz.length : 0;
        editLessonCounters[sectionIndexStr]++;
    }
}
export function addResource(addResourceButtonEl, initialData = {}) {
    const sectionIndex = addResourceButtonEl.dataset.sectionIndex;
    const lessonIndex = addResourceButtonEl.dataset.lessonIndex;
    const resourcesContainer = document.getElementById(`edit-resources-container-${sectionIndex}-${lessonIndex}`);
    if (resourcesContainer) {
        const key = `${sectionIndex}_${lessonIndex}`;
        if (editResourceCounters[key] === undefined) editResourceCounters[key] = 0;
        const currentResourceIndex = editResourceCounters[key];
        resourcesContainer.insertAdjacentHTML('beforeend', _getResourceHTML(sectionIndex, lessonIndex, currentResourceIndex, initialData));
        editResourceCounters[key]++;
    }
}
export function addQuizQuestion(addQuizButtonEl, initialData = {}) {
    const sectionIndex = addQuizButtonEl.dataset.sectionIndex;
    const lessonIndex = addQuizButtonEl.dataset.lessonIndex;
    const quizContainer = document.getElementById(`edit-quiz-container-${sectionIndex}-${lessonIndex}`);
    if (quizContainer) {
        const key = `${sectionIndex}_${lessonIndex}`;
        if (editQuizCounters[key] === undefined) editQuizCounters[key] = 0;
        const currentQuestionIndex = editQuizCounters[key];
        quizContainer.insertAdjacentHTML('beforeend', _getQuizQuestionHTML(sectionIndex, lessonIndex, currentQuestionIndex, initialData));
        editQuizCounters[key]++;
    }
}


export async function renderEditCourseForm(courseId, authState) {
    editSectionCounter = 0; editLessonCounters = {}; editResourceCounters = {}; editQuizCounters = {};
    let courseData = null;
    let isLoading = true;
    let error = null;

    try {
        const headers = {};
        if(authState.token) headers['Authorization'] = `Bearer ${authState.token}`;

        const response = await fetch(`${API_COURSES_URL}/${courseId}`, { headers });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        courseData = await response.json();
        if (courseData.instructor !== authState.user.userId && authState.user.role !== 'admin') {
            throw new Error("You are not authorized to edit this course.");
        }
    } catch (e) { error = e.message; } finally { isLoading = false; }

    if (isLoading) return '<p class="loading-message">Loading course for editing...</p>';
    if (error) return `<p class="error-message">Error loading course: ${error}</p>`;
    if (!courseData) return '<p class="not-found">Course not found or could not be loaded.</p>';

    editSectionCounter = courseData.sections ? courseData.sections.length : 0;
    courseData.sections?.forEach((section, sIdx) => {
        editLessonCounters[sIdx.toString()] = section.lessons ? section.lessons.length : 0;
        section.lessons?.forEach((lesson, lIdx) => {
            const lessonKey = `${sIdx}_${lIdx}`;
            editResourceCounters[lessonKey] = lesson.resources ? lesson.resources.length : 0;
            editQuizCounters[lessonKey] = lesson.quiz ? lesson.quiz.length : 0;
        });
    });
    const currentThumbnailDisplay = courseData.thumbnailUrl ? `<p style="font-size:0.8em; margin-top:5px;">Current Thumbnail: <img src="${courseData.thumbnailUrl}" alt="Current Thumbnail" style="max-width:100px; max-height:60px; vertical-align:middle; margin-left:10px;"/></p>` : '<p style="font-size:0.8em; margin-top:5px;">No current thumbnail.</p>';


    return `
        <section class="create-course-form-container" aria-labelledby="edit-course-title-page">
            <h2 id="edit-course-title-page">Edit Course: ${courseData.title}</h2>
            <form id="edit-course-form" data-course-id="${courseId}" novalidate>
                <div id="edit-course-feedback" class="form-feedback" aria-live="assertive"></div>
                <fieldset><legend>Course Details</legend>
                    <div class="form-group"><label for="edit-course-title">Title</label><input type="text" id="edit-course-title" name="title" value="${courseData.title || ''}" required></div>
                    <div class="form-group"><label for="edit-course-description">Description</label><textarea id="edit-course-description" name="description" rows="5" required>${courseData.description || ''}</textarea></div>
                    <div class="form-group"><label for="edit-course-category">Category</label>
                        <select id="edit-course-category" name="category" required>
                            <option value="Programming" ${courseData.category === 'Programming' ? 'selected' : ''}>Programming</option>
                            <option value="Design" ${courseData.category === 'Design' ? 'selected' : ''}>Design</option>
                            <option value="Business" ${courseData.category === 'Business' ? 'selected' : ''}>Business</option>
                            <option value="Data Science" ${courseData.category === 'Data Science' ? 'selected' : ''}>Data Science</option>
                            <option value="Marketing" ${courseData.category === 'Marketing' ? 'selected' : ''}>Marketing</option>
                            <option value="Personal Development" ${courseData.category === 'Personal Development' ? 'selected' : ''}>Personal Development</option>
                            <option value="Other" ${courseData.category === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="form-group"><label for="edit-course-price">Price (USD)</label><input type="number" id="edit-course-price" name="price" min="0" step="0.01" value="${courseData.price !== undefined ? courseData.price : ''}" placeholder="0 for free"></div>
                    <div class="form-group">
                        <label for="edit-course-thumbnailImage">Upload New Thumbnail Image (Optional):</label>
                        <input type="file" id="edit-course-thumbnailImage" name="thumbnailImage" accept="image/*">
                        ${currentThumbnailDisplay}
                    </div>
                    <div class="form-group"><label for="edit-course-tags">Tags (comma-separated)</label><input type="text" id="edit-course-tags" name="tags" value="${courseData.tags?.join(', ') || ''}" placeholder="e.g., web, js, react"></div>
                </fieldset>
                <fieldset><legend>Course Content</legend>
                    <div id="sections-container">
                        ${courseData.sections ? courseData.sections.map((section, idx) => _getSectionHTML(idx, section)).join('') : ''}
                    </div>
                    <button type="button" id="add-section-btn" class="button-like secondary add-btn">+ Add Section</button>
                </fieldset>
                <button type="submit" class="accent button-like" style="width:100%; padding: 1rem;">Save Changes</button>
            </form>
        </section>`;
}

export async function handleEditCourseFormSubmit(formElement, courseId) {
    const feedbackDiv = document.getElementById('edit-course-feedback');
    feedbackDiv.textContent = 'Processing...'; feedbackDiv.className = 'form-feedback processing'; feedbackDiv.style.display = 'block';
    const token = localStorage.getItem('skillShareHubToken');
    if (!token) { feedbackDiv.textContent = 'Authentication error.'; feedbackDiv.className = 'form-feedback error'; return; }

    const formData = new FormData();
    formData.append('title', formElement.querySelector('#edit-course-title').value);
    formData.append('description', formElement.querySelector('#edit-course-description').value);
    formData.append('category', formElement.querySelector('#edit-course-category').value);
    formData.append('price', formElement.querySelector('#edit-course-price').value || '0');
    formData.append('tags', formElement.querySelector('#edit-course-tags').value);
    const thumbnailFile = formElement.querySelector('#edit-course-thumbnailImage').files[0];
    if (thumbnailFile) formData.append('thumbnailImage', thumbnailFile);

    const sectionsData = [];
    formElement.querySelectorAll('.section-item').forEach((sectionEl, sIdx) => {
        const sectionTitleInput = sectionEl.querySelector('.section-title-input');
        if (!sectionTitleInput || !sectionTitleInput.value.trim()) { console.warn(`Skipping section ${sIdx} with empty title in edit`); return; }
        const section = { title: sectionTitleInput.value.trim(), lessons: [] };

        sectionEl.querySelectorAll('.lesson-item').forEach((lessonEl, lIdx) => {
            const lessonTitleInput = lessonEl.querySelector('.lesson-title-input');
            if (!lessonTitleInput || !lessonTitleInput.value.trim()) { console.warn(`Skipping lesson ${lIdx} in section ${sIdx} with empty title in edit`); return; }
            const lesson = {
                title: lessonTitleInput.value.trim(),
                videoUrl: lessonEl.querySelector('.lesson-videoUrl-input').value.trim(),
                description: lessonEl.querySelector('.lesson-description-input').value.trim(),
                resources: [], quiz: []
            };
            
            const lessonVideoFileInput = lessonEl.querySelector('.lesson-videoFile-input');
            if (lessonVideoFileInput && lessonVideoFileInput.files[0]) {
                formData.append(`lesson_s${sIdx}_l${lIdx}_videoFile`, lessonVideoFileInput.files[0]);
            }

            lessonEl.querySelectorAll('.resource-item').forEach((resourceEl, rIdx) => {
                const resourceNameInput = resourceEl.querySelector('.resource-name-input');
                const resourceUrlInput = resourceEl.querySelector('.resource-url-input');
                if (resourceNameInput && resourceNameInput.value.trim()) {
                    const resource = { name: resourceNameInput.value.trim(), url: resourceUrlInput.value.trim() };
                    lesson.resources.push(resource);
                     const resourceFileInput = resourceEl.querySelector('.resource-file-input');
                    if (resourceFileInput && resourceFileInput.files[0]) {
                        formData.append(`resource_s${sIdx}_l${lIdx}_r${rIdx}_file`, resourceFileInput.files[0]);
                    }
                } else {
                    console.warn(`Skipping resource S${sIdx}L${lIdx}R${rIdx} due to empty name in edit.`);
                }
            });

            lessonEl.querySelectorAll('.quiz-question-item').forEach((quizEl, qIdx) => {
                const questionTextInput = quizEl.querySelector('.quiz-questionText-input');
                if (!questionTextInput || !questionTextInput.value.trim()) { console.warn(`Skipping quiz S${sIdx}L${lIdx}Q${qIdx} due to empty text in edit.`); return; }
                const options = []; let allOptionsFilled = true;
                for (let i = 0; i < 4; i++) {
                    const optInput = quizEl.querySelector(`#edit-quiz-option-${sIdx}-${lIdx}-${qIdx}-${i}`);
                    if (optInput && optInput.value.trim()) options.push(optInput.value.trim()); else allOptionsFilled = false;
                }
                if (!allOptionsFilled || options.length !== 4) {  console.warn(`Skipping quiz S${sIdx}L${lIdx}Q${qIdx} due to incomplete options in edit.`); return; }
                const correctAnswerSelect = quizEl.querySelector('.quiz-correctAnswer-select');
                const correctAnswerIndex = correctAnswerSelect ? parseInt(correctAnswerSelect.value) : -1;
                if (correctAnswerIndex < 0 || correctAnswerIndex > 3) { console.warn(`Skipping quiz S${sIdx}L${lIdx}Q${qIdx} due to invalid correct answer in edit.`); return; }
                lesson.quiz.push({ questionText: questionTextInput.value.trim(), options, correctAnswerIndex });
            });
            section.lessons.push(lesson);
        });
        sectionsData.push(section);
    });
    formData.append('sections', JSON.stringify(sectionsData));

    if (!formData.get('title') || !formData.get('description') || !formData.get('category')) {
        feedbackDiv.textContent = 'Title, Description, and Category are required.';
        feedbackDiv.className = 'form-feedback error'; return;
    }

    try {
        const response = await fetch(`${API_COURSES_URL}/${courseId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || `HTTP error ${response.status}`);
        feedbackDiv.textContent = 'Course updated successfully!'; feedbackDiv.className = 'form-feedback success';
        
        // Optionally reset form elements or re-fetch data if dynamic content IDs might change
        // For now, just redirecting.
        setTimeout(() => { window.location.hash = `#course-view/${courseId}`; }, 1500);
    } catch (error) {
        console.error('Error updating course:', error);
        feedbackDiv.textContent = error.message || 'Failed to update course.';
        feedbackDiv.className = 'form-feedback error';
    }
}