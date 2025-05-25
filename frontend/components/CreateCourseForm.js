/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

var API_COURSES_URL = 'http://localhost:3001/api/courses';

let sectionCounter = 0;
let lessonCounters = {}; 
let resourceCounters = {}; 
let quizCounters = {}; 

function _getSectionHTML(sectionIndex) {
    return `
        <div class="section-item" data-section-index="${sectionIndex}">
            <div class="section-header">
                <h4>Section ${sectionIndex + 1}</h4>
                <button type="button" class="remove-section-btn remove-btn" aria-label="Remove Section ${sectionIndex + 1}">Remove Section</button>
            </div>
            <div class="form-group">
                <label for="section-title-${sectionIndex}">Section Title</label>
                <input type="text" id="section-title-${sectionIndex}" required class="section-title-input">
            </div>
            <div class="lessons-container" id="lessons-container-${sectionIndex}"></div>
            <button type="button" class="add-lesson-btn add-btn" data-section-index="${sectionIndex}">+ Add Lesson</button>
        </div>
    `;
}

function _getLessonHTML(sectionIndex, lessonIndex) {
    const videoFileFieldName = `lesson_s${sectionIndex}_l${lessonIndex}_videoFile`;
    return `
        <div class="lesson-item" data-section-index="${sectionIndex}" data-lesson-index="${lessonIndex}">
            <div class="lesson-header">
                <h5>Lesson ${sectionIndex + 1}.${lessonIndex + 1}</h5>
                <button type="button" class="remove-lesson-btn remove-btn" aria-label="Remove Lesson">Remove Lesson</button>
            </div>
            <div class="form-group">
                <label for="lesson-title-${sectionIndex}-${lessonIndex}">Lesson Title</label>
                <input type="text" id="lesson-title-${sectionIndex}-${lessonIndex}" required class="lesson-title-input">
            </div>
            <div class="form-group">
                <label for="lesson-videoUrl-${sectionIndex}-${lessonIndex}">Video URL (e.g., YouTube, Vimeo)</label>
                <input type="url" id="lesson-videoUrl-${sectionIndex}-${lessonIndex}" class="lesson-videoUrl-input" placeholder="https://example.com/video_url">
            </div>
            <div class="form-group">
                <label for="${videoFileFieldName}">Or Upload Video File (Overrides URL if both provided):</label>
                <input type="file" id="${videoFileFieldName}" name="${videoFileFieldName}" class="lesson-videoFile-input" accept="video/*">
            </div>
            <div class="form-group">
                <label for="lesson-description-${sectionIndex}-${lessonIndex}">Lesson Description</label>
                <textarea id="lesson-description-${sectionIndex}-${lessonIndex}" class="lesson-description-input" rows="3"></textarea>
            </div>
            <div class="resources-container" id="resources-container-${sectionIndex}-${lessonIndex}"><h6>Resources for this Lesson:</h6></div>
            <button type="button" class="add-resource-btn add-btn" data-section-index="${sectionIndex}" data-lesson-index="${lessonIndex}">+ Add Resource</button>
            <div class="quiz-container" id="quiz-container-${sectionIndex}-${lessonIndex}"><h6>Quiz for this Lesson:</h6></div>
            <button type="button" class="add-quiz-question-btn add-btn" data-section-index="${sectionIndex}" data-lesson-index="${lessonIndex}">+ Add Quiz Question</button>
        </div>
    `;
}

function _getResourceHTML(sectionIndex, lessonIndex, resourceIndex) {
    const resourceFileFieldName = `resource_s${sectionIndex}_l${lessonIndex}_r${resourceIndex}_file`;
    return `
        <div class="resource-item" data-section-index="${sectionIndex}" data-lesson-index="${lessonIndex}" data-resource-index="${resourceIndex}">
            <div class="resource-header">
                <p class="item-label">Resource ${resourceIndex + 1}</p>
                <button type="button" class="remove-resource-btn remove-btn" aria-label="Remove Resource">X</button>
            </div>
            <div class="form-group">
                <label for="resource-name-${sectionIndex}-${lessonIndex}-${resourceIndex}">Resource Name</label>
                <input type="text" id="resource-name-${sectionIndex}-${lessonIndex}-${resourceIndex}" required class="resource-name-input">
            </div>
            <div class="form-group">
                <label for="resource-url-${sectionIndex}-${lessonIndex}-${resourceIndex}">Resource URL (e.g., PDF link, website)</label>
                <input type="url" id="resource-url-${sectionIndex}-${lessonIndex}-${resourceIndex}" class="resource-url-input" placeholder="https://example.com/document.pdf">
            </div>
            <div class="form-group">
                <label for="${resourceFileFieldName}">Or Upload Resource File (Overrides URL):</label>
                <input type="file" id="${resourceFileFieldName}" name="${resourceFileFieldName}" class="resource-file-input">
            </div>
        </div>
    `;
}

function _getQuizQuestionHTML(sectionIndex, lessonIndex, questionIndex) {
    let optionsHTML = '';
    for (let i = 0; i < 4; i++) {
        optionsHTML += `
            <div class="form-group">
                <label for="quiz-option-${sectionIndex}-${lessonIndex}-${questionIndex}-${i}">Option ${i + 1}</label>
                <input type="text" id="quiz-option-${sectionIndex}-${lessonIndex}-${questionIndex}-${i}" required class="quiz-option-input">
            </div>
        `;
    }
    return `
        <div class="quiz-question-item" data-section-index="${sectionIndex}" data-lesson-index="${lessonIndex}" data-question-index="${questionIndex}">
            <div class="quiz-header">
                <p class="item-label">Question ${questionIndex + 1}</p>
                <button type="button" class="remove-quiz-question-btn remove-btn" aria-label="Remove Question">X</button>
            </div>
            <div class="form-group">
                <label for="quiz-questionText-${sectionIndex}-${lessonIndex}-${questionIndex}">Question Text</label>
                <textarea id="quiz-questionText-${sectionIndex}-${lessonIndex}-${questionIndex}" required class="quiz-questionText-input" rows="2"></textarea>
            </div>
            ${optionsHTML}
            <div class="form-group">
                <label for="quiz-correctAnswer-${sectionIndex}-${lessonIndex}-${questionIndex}">Correct Answer</label>
                <select id="quiz-correctAnswer-${sectionIndex}-${lessonIndex}-${questionIndex}" required class="quiz-correctAnswer-select">
                    <option value="0">Option 1 is Correct</option>
                    <option value="1">Option 2 is Correct</option>
                    <option value="2">Option 3 is Correct</option>
                    <option value="3">Option 4 is Correct</option>
                </select>
            </div>
        </div>
    `;
}

export function addSection() {
    const sectionsContainer = document.getElementById('sections-container');
    if (sectionsContainer) {
        const currentSectionIndex = sectionCounter;
        sectionsContainer.insertAdjacentHTML('beforeend', _getSectionHTML(currentSectionIndex));
        lessonCounters[currentSectionIndex.toString()] = 0;
        sectionCounter++;
    }
}

export function removeElement(buttonEl, parentSelector) {
    const elementToRemove = buttonEl.closest(parentSelector);
    if (elementToRemove) elementToRemove.remove();
}

export function addLesson(addLessonButtonEl) {
    const sectionIndex = addLessonButtonEl.dataset.sectionIndex;
    const lessonsContainer = document.getElementById(`lessons-container-${sectionIndex}`);
    if (lessonsContainer) {
        const sectionIndexStr = sectionIndex.toString();
        if (lessonCounters[sectionIndexStr] === undefined) lessonCounters[sectionIndexStr] = 0;
        const currentLessonIndex = lessonCounters[sectionIndexStr];
        lessonsContainer.insertAdjacentHTML('beforeend', _getLessonHTML(sectionIndex, currentLessonIndex));
        const lessonKey = `${sectionIndexStr}_${currentLessonIndex}`;
        resourceCounters[lessonKey] = 0;
        quizCounters[lessonKey] = 0;
        lessonCounters[sectionIndexStr]++;
    }
}

export function addResource(addResourceButtonEl) {
    const sectionIndex = addResourceButtonEl.dataset.sectionIndex;
    const lessonIndex = addResourceButtonEl.dataset.lessonIndex;
    const resourcesContainer = document.getElementById(`resources-container-${sectionIndex}-${lessonIndex}`);
    if (resourcesContainer) {
        const key = `${sectionIndex}_${lessonIndex}`;
        if (resourceCounters[key] === undefined) resourceCounters[key] = 0;
        const currentResourceIndex = resourceCounters[key];
        resourcesContainer.insertAdjacentHTML('beforeend', _getResourceHTML(sectionIndex, lessonIndex, currentResourceIndex));
        resourceCounters[key]++;
    }
}

export function addQuizQuestion(addQuizButtonEl) {
    const sectionIndex = addQuizButtonEl.dataset.sectionIndex;
    const lessonIndex = addQuizButtonEl.dataset.lessonIndex;
    const quizContainer = document.getElementById(`quiz-container-${sectionIndex}-${lessonIndex}`);
    if (quizContainer) {
        const key = `${sectionIndex}_${lessonIndex}`;
        if (quizCounters[key] === undefined) quizCounters[key] = 0;
        const currentQuestionIndex = quizCounters[key];
        quizContainer.insertAdjacentHTML('beforeend', _getQuizQuestionHTML(sectionIndex, lessonIndex, currentQuestionIndex));
        quizCounters[key]++;
    }
}

export function renderCreateCourseForm() {
    sectionCounter = 0; lessonCounters = {}; resourceCounters = {}; quizCounters = {};
    return `
        <section class="create-course-form-container" aria-labelledby="create-course-title">
            <h2 id="create-course-title">Create New Course</h2>
            <form id="create-course-form" novalidate>
                <div id="create-course-feedback" class="form-feedback" aria-live="assertive"></div>
                <fieldset><legend>Course Details</legend>
                    <div class="form-group"><label for="course-title">Title</label><input type="text" id="course-title" name="title" required></div>
                    <div class="form-group"><label for="course-description">Description</label><textarea id="course-description" name="description" rows="5" required></textarea></div>
                    <div class="form-group"><label for="course-category">Category</label><select id="course-category" name="category" required><option value="">Select category</option><option value="Programming">Programming</option><option value="Design">Design</option><option value="Business">Business</option><option value="Data Science">Data Science</option><option value="Marketing">Marketing</option><option value="Personal Development">Personal Development</option><option value="Other">Other</option></select></div>
                    <div class="form-group"><label for="course-price">Price (USD)</label><input type="number" id="course-price" name="price" min="0" step="0.01" placeholder="0 for free"></div>
                    <div class="form-group"><label for="course-thumbnailImage">Thumbnail Image</label><input type="file" id="course-thumbnailImage" name="thumbnailImage" accept="image/*"></div>
                    <div class="form-group"><label for="course-tags">Tags (comma-separated)</label><input type="text" id="course-tags" name="tags" placeholder="e.g., web, js, react"></div>
                </fieldset>
                <fieldset><legend>Course Content</legend><div id="sections-container"></div><button type="button" id="add-section-btn" class="button-like secondary add-btn">+ Add Section</button></fieldset>
                <button type="submit" class="accent button-like" style="width:100%; padding: 1rem;">Create Course</button>
            </form>
        </section>`;
}

export async function handleCreateCourseFormSubmit(formElement) {
    const feedbackDiv = document.getElementById('create-course-feedback');
    feedbackDiv.textContent = 'Processing...'; feedbackDiv.className = 'form-feedback processing';  feedbackDiv.style.display = 'block';
    const token = localStorage.getItem('skillShareHubToken');
    if (!token) { feedbackDiv.textContent = 'Auth error.'; feedbackDiv.className = 'form-feedback error'; return; }
    
    const formData = new FormData();
    formData.append('title', formElement.querySelector('#course-title').value);
    formData.append('description', formElement.querySelector('#course-description').value);
    formData.append('category', formElement.querySelector('#course-category').value);
    formData.append('price', formElement.querySelector('#course-price').value || '0');
    formData.append('tags', formElement.querySelector('#course-tags').value);
    const thumbnailFile = formElement.querySelector('#course-thumbnailImage').files[0];
    if (thumbnailFile) formData.append('thumbnailImage', thumbnailFile);

    const sectionsData = [];
    formElement.querySelectorAll('.section-item').forEach((sectionEl, sIdx) => {
        const sectionTitleInput = sectionEl.querySelector('.section-title-input');
        if (!sectionTitleInput || !sectionTitleInput.value.trim()) { console.warn(`Skipping section ${sIdx} with empty title`); return; }
        const section = { title: sectionTitleInput.value.trim(), lessons: [] };
        sectionEl.querySelectorAll('.lesson-item').forEach((lessonEl, lIdx) => {
            const lessonTitleInput = lessonEl.querySelector('.lesson-title-input');
            if (!lessonTitleInput || !lessonTitleInput.value.trim()) { console.warn(`Skipping lesson ${lIdx} in section ${sIdx} with empty title`); return; }
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
                     console.warn(`Skipping resource S${sIdx}L${lIdx}R${rIdx} due to empty name.`);
                }
            });
            
            lessonEl.querySelectorAll('.quiz-question-item').forEach((quizEl, qIdx) => {
                const questionTextInput = quizEl.querySelector('.quiz-questionText-input');
                if (!questionTextInput || !questionTextInput.value.trim()) { console.warn(`Skipping quiz S${sIdx}L${lIdx}Q${qIdx} due to empty text.`); return; }
                const options = []; let allOptionsFilled = true;
                for (let i = 0; i < 4; i++) { 
                    const optInput = quizEl.querySelector(`#quiz-option-${sIdx}-${lIdx}-${qIdx}-${i}`); 
                    if (optInput && optInput.value.trim()) options.push(optInput.value.trim()); else allOptionsFilled = false;
                }
                if (!allOptionsFilled || options.length !== 4) {  console.warn(`Skipping quiz S${sIdx}L${lIdx}Q${qIdx} due to incomplete options.`); return; }
                const correctAnswerSelect = quizEl.querySelector('.quiz-correctAnswer-select');
                const correctAnswerIndex = correctAnswerSelect ? parseInt(correctAnswerSelect.value) : -1;
                if (correctAnswerIndex < 0 || correctAnswerIndex > 3) { console.warn(`Skipping quiz S${sIdx}L${lIdx}Q${qIdx} due to invalid correct answer.`); return; }
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
        const response = await fetch(API_COURSES_URL, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || `HTTP error ${response.status}`);
        feedbackDiv.textContent = 'Course created successfully!'; feedbackDiv.className = 'form-feedback success';
        formElement.reset(); document.getElementById('sections-container').innerHTML = '';
        sectionCounter = 0; lessonCounters = {}; resourceCounters = {}; quizCounters = {};
        setTimeout(() => { window.location.hash = '#instructor-dashboard'; }, 1500);
    } catch (error) {
        console.error('Error creating course:', error);
        feedbackDiv.textContent = error.message || 'Failed to create course.';
        feedbackDiv.className = 'form-feedback error';
    }
}