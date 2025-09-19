// Enhanced Quiz Engine - Ensures shuffled answers are always different from previous orientation
class QuizEngine {
    constructor(quizData) {
        this.quizData = quizData;
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.userAnswers = [];
        this.isQuizComplete = false;
        
        // Store previous shuffle states to ensure different orientations
        this.previousShuffleStates = {};
        
        // Global options (can be overridden per question)
        this.globalOptions = {
            shuffleAnswers: quizData.options?.shuffleAnswers ?? false,
            caseSensitive: quizData.options?.caseSensitive ?? false,
            orderSensitive: quizData.options?.orderSensitive ?? true,
            shuffleChoices: quizData.options?.shuffleChoices ?? false,
            shuffleMatches: quizData.options?.shuffleMatches ?? false,
            unequalList: quizData.options?.unequalList ?? false
        };
        
        this.shuffledIndices = {}; // Store shuffle mappings for answer checking
        this.init();
    }

    init() {
        this.renderQuizHeader();
        this.renderQuestion();
        this.setupEventListeners();
        this.updateProgress();
    }

    // Get options for current question (question options override global options)
    getQuestionOptions(question) {
        return {
            shuffleAnswers: question.questionOptions?.shuffleAnswers ?? this.globalOptions.shuffleAnswers,
            caseSensitive: question.questionOptions?.caseSensitive ?? this.globalOptions.caseSensitive,
            orderSensitive: question.questionOptions?.orderSensitive ?? this.globalOptions.orderSensitive,
            shuffleChoices: question.questionOptions?.shuffleChoices ?? this.globalOptions.shuffleChoices,
            shuffleMatches: question.questionOptions?.shuffleMatches ?? this.globalOptions.shuffleMatches,
            unequalList: question.questionOptions?.unequalList ?? this.globalOptions.unequalList
        };
    }

    // Enhanced shuffle that ensures different orientation from previous
    shuffleArrayDifferently(array, stateKey) {
        if (array.length <= 1) {
            return array.map((_, i) => i); // Return indices for single item or empty
        }

        const indices = array.map((_, i) => i);
        let newIndices;
        let attempts = 0;
        const maxAttempts = 50; // Prevent infinite loops
        
        do {
            newIndices = this.shuffleArray(indices);
            attempts++;
        } while (
            this.previousShuffleStates[stateKey] && 
            this.arraysEqual(newIndices, this.previousShuffleStates[stateKey]) && 
            attempts < maxAttempts
        );
        
        // Store the new state
        this.previousShuffleStates[stateKey] = [...newIndices];
        
        return newIndices;
    }

    // Check if two arrays are equal
    arraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        return arr1.every((val, index) => val === arr2[index]);
    }

    // Enhanced shuffle for True/False that ensures different orientation
    shuffleTrueFalseDifferently(stateKey) {
        const options = [
            { value: 'true', label: 'True' },
            { value: 'false', label: 'False' }
        ];
        
        // For True/False, we just need to track if it was [T,F] or [F,T] last time
        const previousWasTrueFirst = this.previousShuffleStates[stateKey];
        const trueFirst = previousWasTrueFirst === undefined ? Math.random() < 0.5 : !previousWasTrueFirst;
        
        this.previousShuffleStates[stateKey] = trueFirst;
        
        return trueFirst ? options : [options[1], options[0]];
    }

    renderQuizHeader() {
        const headerHtml = `
            <div class="quiz-header">
                <h1 class="quiz-title">${this.quizData.title}</h1>
                <p>${this.quizData.description}</p>
                <div class="quiz-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <span class="score-display">Score: <span id="currentScore">0</span>/${this.quizData.questions.length}</span>
                </div>
            </div>
        `;
        document.getElementById('quizHeader').innerHTML = headerHtml;
    }

    renderQuestion() {
        const question = this.quizData.questions[this.currentQuestionIndex];
        const questionOptions = this.getQuestionOptions(question);
        
        let questionHtml = `
            <div class="question-container">
                <div class="question-header">
                    <span class="question-number">Question ${this.currentQuestionIndex + 1}</span>
                    <span class="question-type">${this.getQuestionTypeLabel(question.type)}</span>
                </div>
                <div class="question-text">${question.question}</div>
                ${this.getActiveOptionsDisplay(questionOptions)}
                <div id="answerArea">
                    ${this.renderAnswerInput(question, questionOptions)}
                </div>
                <div id="feedbackArea"></div>
            </div>
        `;
        document.getElementById('questionContainer').innerHTML = questionHtml;
        
        // Add event listeners based on question type
        this.attachQuestionListeners(question);
        
        // Update answer key modal
        this.updateAnswerKey(question, questionOptions);
    }

    renderAnswerInput(question, options) {
        switch(question.type) {
            case 'multiple-choice':
                return this.renderMultipleChoice(question, options);
            case 'multiple-answer':
                return this.renderMultipleAnswer(question, options);
            case 'identification':
            case 'text':
                return this.renderTextInput(question);
            case 'matching':
                return this.renderMatching(question, options);
            case 'true-false':
                return this.renderTrueFalse(question, options);
            case 'enumeration':
                return this.renderEnumeration(question);
            default:
                return '<p>Unknown question type</p>';
        }
    }

    renderMultipleChoice(question, options) {
        let indexMapping = question.options.map((_, i) => i);
        
        if (options.shuffleAnswers) {
            const stateKey = `mc_${this.currentQuestionIndex}`;
            indexMapping = this.shuffleArrayDifferently(question.options, stateKey);
        }
        
        const displayOptions = indexMapping.map(i => question.options[i]);
        
        // Store the mapping for this question
        this.shuffledIndices[`mc_${this.currentQuestionIndex}`] = indexMapping;
        
        return `
            <div class="options-container">
                ${displayOptions.map((option, displayIndex) => {
                    const originalIndex = indexMapping[displayIndex];
                    return `
                        <label class="option" data-index="${originalIndex}">
                            <input type="radio" name="q${this.currentQuestionIndex}" value="${originalIndex}">
                            <span>${option}</span>
                        </label>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderMultipleAnswer(question, options) {
        let indexMapping = question.options.map((_, i) => i);
        
        if (options.shuffleAnswers) {
            const stateKey = `ma_${this.currentQuestionIndex}`;
            indexMapping = this.shuffleArrayDifferently(question.options, stateKey);
        }
        
        const displayOptions = indexMapping.map(i => question.options[i]);
        
        // Store the mapping for this question
        this.shuffledIndices[`ma_${this.currentQuestionIndex}`] = indexMapping;
        
        return `
            <div class="options-container">
                ${displayOptions.map((option, displayIndex) => {
                    const originalIndex = indexMapping[displayIndex];
                    return `
                        <label class="option" data-index="${originalIndex}">
                            <input type="checkbox" name="q${this.currentQuestionIndex}" value="${originalIndex}">
                            <span>${option}</span>
                        </label>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderTextInput(question) {
        return `
            <input type="text" class="text-input" id="textAnswer" 
                   placeholder="Type your answer here..." autocomplete="off">
        `;
    }

    renderTrueFalse(question, options) {
        let tfOptions;
        
        if (options.shuffleAnswers) {
            const stateKey = `tf_${this.currentQuestionIndex}`;
            tfOptions = this.shuffleTrueFalseDifferently(stateKey);
        } else {
            tfOptions = [
                { value: 'true', label: 'True' },
                { value: 'false', label: 'False' }
            ];
        }
        
        return `
            <div class="options-container">
                ${tfOptions.map(option => `
                    <label class="option">
                        <input type="radio" name="q${this.currentQuestionIndex}" value="${option.value}">
                        <span>${option.label}</span>
                    </label>
                `).join('')}
            </div>
        `;
    }

    renderEnumeration(question) {
        const numAnswers = question.correctAnswer.length;
        return `
            <div class="enumeration-container">
                ${Array.from({length: numAnswers}, (_, i) => `
                    <div class="enumeration-item">
                        <span>${i + 1}.</span>
                        <input type="text" class="text-input enumeration-input" 
                               data-index="${i}" placeholder="Answer ${i + 1}" autocomplete="off">
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderMatching(question, options) {
        let displayItems = [...question.items];
        let displayMatches = [...question.matches];
        
        if (options.shuffleChoices) {
            const stateKey = `matching_items_${this.currentQuestionIndex}`;
            const itemIndices = this.shuffleArrayDifferently(question.items, stateKey);
            displayItems = itemIndices.map(i => question.items[i]);
        }
        
        if (options.shuffleMatches) {
            const stateKey = `matching_matches_${this.currentQuestionIndex}`;
            const matchIndices = this.shuffleArrayDifferently(question.matches, stateKey);
            displayMatches = matchIndices.map(i => question.matches[i]);
        }
        
        // For unequal lists, add dummy items
        if (options.unequalList) {
            const dummyItems = ['Distractor A', 'Distractor B'];
            const dummyMatches = ['Extra Option 1', 'Extra Option 2'];
            const numDummyItems = Math.floor(Math.random() * 2) + 1;
            const numDummyMatches = Math.floor(Math.random() * 2) + 1;
            displayItems = [...displayItems, ...dummyItems.slice(0, numDummyItems)];
            displayMatches = [...displayMatches, ...dummyMatches.slice(0, numDummyMatches)];
        }
        
        return `
            <div class="matching-container">
                <div class="matching-column">
                    <h4>Items</h4>
                    ${displayItems.map((item, index) => `
                        <div class="matching-item" draggable="true" data-item="${item}">
                            ${item}
                        </div>
                    `).join('')}
                </div>
                <div class="matching-column">
                    <h4>Match With</h4>
                    ${displayMatches.map((match, index) => `
                        <div class="drop-zone" data-match="${match}">
                            <div class="match-label">${match}</div>
                            <div class="dropped-item" title="Click to remove"></div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    attachQuestionListeners(question) {
        switch(question.type) {
            case 'multiple-choice':
            case 'true-false':
                this.attachRadioListeners();
                break;
            case 'multiple-answer':
                this.attachCheckboxListeners();
                break;
            case 'identification':
            case 'text':
                this.attachTextInputListener();
                break;
            case 'enumeration':
                this.attachEnumerationListeners();
                break;
            case 'matching':
                this.attachMatchingListeners();
                break;
        }
    }

    attachRadioListeners() {
        const radios = document.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.addEventListener('change', () => this.checkAnswer());
        });
    }

    attachCheckboxListeners() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => this.checkAnswer());
        });
    }

    attachTextInputListener() {
        const input = document.getElementById('textAnswer');
        if (input) {
            input.addEventListener('input', () => {
                clearTimeout(this.inputTimeout);
                this.inputTimeout = setTimeout(() => this.checkAnswer(), 500);
            });
        }
    }

    attachEnumerationListeners() {
        const inputs = document.querySelectorAll('.enumeration-input');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(this.inputTimeout);
                this.inputTimeout = setTimeout(() => this.checkAnswer(), 500);
            });
        });
    }

    attachMatchingListeners() {
        const items = document.querySelectorAll('.matching-item');
        const zones = document.querySelectorAll('.drop-zone');
        
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('itemText', e.target.dataset.item);
                e.target.classList.add('dragging');
            });
            
            item.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
            });
        });
        
        zones.forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });
            
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });
            
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                const itemText = e.dataTransfer.getData('itemText');
                const droppedItemDiv = zone.querySelector('.dropped-item');
                
                // Clear any existing item in this zone
                droppedItemDiv.innerHTML = itemText;
                zone.classList.remove('drag-over');
                
                // Check this individual match immediately
                this.checkIndividualMatch(zone, itemText);
                
                // Also check overall answer status
                this.checkAnswer();
            });
            
            // Allow clicking to remove items from zones
            zone.addEventListener('click', (e) => {
                if (e.target.classList.contains('dropped-item') && e.target.textContent.trim()) {
                    e.target.innerHTML = '';
                    zone.classList.remove('correct-match', 'incorrect-match');
                    this.checkAnswer();
                }
            });
        });
    }

    checkAnswer() {
        const question = this.quizData.questions[this.currentQuestionIndex];
        const questionOptions = this.getQuestionOptions(question);
        let userAnswer = this.getUserAnswer(question.type);
        let isCorrect = this.isAnswerCorrect(userAnswer, question, questionOptions);
        
        this.showFeedback(isCorrect, question);
        this.updateVisualFeedback(isCorrect, question.type);
        
        // Update score only once per question
        if (!this.userAnswers[this.currentQuestionIndex]) {
            if (isCorrect) {
                this.score++;
                document.getElementById('currentScore').textContent = this.score;
            }
            this.userAnswers[this.currentQuestionIndex] = userAnswer;
        }
    }

    // New method to check individual matches in real-time
    checkIndividualMatch(zone, droppedItem) {
        const question = this.quizData.questions[this.currentQuestionIndex];
        
        if (question.type !== 'matching' || !question.correctMatches) {
            return;
        }
        
        const matchKey = zone.dataset.match;
        const correctItem = question.correctMatches[matchKey];
        
        // Remove previous match styling
        zone.classList.remove('correct-match', 'incorrect-match');
        
        if (droppedItem === correctItem) {
            zone.classList.add('correct-match');
            // Optional: Show a small checkmark or success indicator
            this.showIndividualMatchFeedback(zone, true);
        } else {
            zone.classList.add('incorrect-match');
            // Optional: Show a small X or error indicator
            this.showIndividualMatchFeedback(zone, false);
        }
    }

    // Optional method to show individual match feedback
    showIndividualMatchFeedback(zone, isCorrect) {
        // Remove any existing feedback indicators
        const existingFeedback = zone.querySelector('.match-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        // Add new feedback indicator
        const feedback = document.createElement('div');
        feedback.className = 'match-feedback';
        feedback.innerHTML = isCorrect ? '✓' : '✗';
        feedback.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            font-size: 16px;
            font-weight: bold;
            color: ${isCorrect ? 'var(--success-color)' : 'var(--error-color)'};
            background: ${isCorrect ? '#d4edda' : '#f8d7da'};
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
        `;
        
        zone.style.position = 'relative';
        zone.appendChild(feedback);
    }

    getUserAnswer(type) {
        switch(type) {
            case 'multiple-choice':
            case 'true-false':
                const selected = document.querySelector('input[type="radio"]:checked');
                return selected ? selected.value : null;
            
            case 'multiple-answer':
                const checked = document.querySelectorAll('input[type="checkbox"]:checked');
                return Array.from(checked).map(cb => parseInt(cb.value));
            
            case 'identification':
            case 'text':
                const textInput = document.getElementById('textAnswer');
                return textInput ? textInput.value.trim() : '';
            
            case 'enumeration':
                const enumInputs = document.querySelectorAll('.enumeration-input');
                return Array.from(enumInputs).map(input => input.value.trim()).filter(v => v !== '');
            
            case 'matching':
                const zones = document.querySelectorAll('.drop-zone');
                const matches = {};
                zones.forEach(zone => {
                    const matchLabel = zone.dataset.match;
                    const droppedText = zone.querySelector('.dropped-item').textContent.trim();
                    if (droppedText) {
                        matches[matchLabel] = droppedText;
                    }
                });
                return matches;
            
            default:
                return null;
        }
    }

    isAnswerCorrect(userAnswer, question, options) {
        switch(question.type) {
            case 'multiple-choice':
                return parseInt(userAnswer) === question.correctAnswer;
            
            case 'true-false':
                return userAnswer === question.correctAnswer.toString();
            
            case 'multiple-answer':
                if (!userAnswer || !question.correctAnswer) return false;
                return userAnswer.length === question.correctAnswer.length &&
                    userAnswer.every(ans => question.correctAnswer.includes(ans));
            
            case 'identification':
            case 'text':
                if (!userAnswer) return false;
                const compareFunc = options.caseSensitive 
                    ? (a, b) => a === b 
                    : (a, b) => a.toLowerCase() === b.toLowerCase();
                
                if (Array.isArray(question.correctAnswer)) {
                    return question.correctAnswer.some(ans => 
                        compareFunc(ans, userAnswer)
                    );
                }
                return compareFunc(question.correctAnswer, userAnswer);
            
            case 'enumeration':
                if (!userAnswer || userAnswer.length === 0) return false;
                
                const enumCompare = options.caseSensitive 
                    ? (a, b) => a === b 
                    : (a, b) => a.toLowerCase() === b.toLowerCase();
                
                // Get all acceptable answers flattened
                const allAcceptableAnswers = [];
                question.correctAnswer.forEach(answerSet => {
                    if (Array.isArray(answerSet)) {
                        allAcceptableAnswers.push(...answerSet);
                    } else {
                        allAcceptableAnswers.push(answerSet);
                    }
                });
                
                if (options.orderSensitive) {
                    // Order matters - check each position
                    if (userAnswer.length !== question.correctAnswer.length) return false;
                    
                    return userAnswer.every((ans, index) => {
                        if (Array.isArray(question.correctAnswer[index])) {
                            return question.correctAnswer[index].some(acceptable => 
                                enumCompare(acceptable, ans)
                            );
                        }
                        return enumCompare(question.correctAnswer[index], ans);
                    });
                } else {
                    // Order doesn't matter - any valid answers in any order
                    if (userAnswer.length > question.correctAnswer.length) return false;
                    
                    // Check if all user answers are valid
                    const usedAnswers = new Set();
                    for (let userAns of userAnswer) {
                        let found = false;
                        for (let acceptableAns of allAcceptableAnswers) {
                            if (!usedAnswers.has(acceptableAns) && enumCompare(acceptableAns, userAns)) {
                                usedAnswers.add(acceptableAns);
                                found = true;
                                break;
                            }
                        }
                        if (!found) return false;
                    }
                    
                    // Check if we have the required number of unique answers
                    const uniqueGroups = new Set();
                    for (let userAns of userAnswer) {
                        for (let i = 0; i < question.correctAnswer.length; i++) {
                            const answerGroup = Array.isArray(question.correctAnswer[i]) 
                                ? question.correctAnswer[i] 
                                : [question.correctAnswer[i]];
                            
                            if (answerGroup.some(a => enumCompare(a, userAns))) {
                                uniqueGroups.add(i);
                                break;
                            }
                        }
                    }
                    
                    return uniqueGroups.size === userAnswer.length && 
                           userAnswer.length <= question.correctAnswer.length;
                }
            
            case 'matching':
                if (!question.correctMatches) return false;
                for (let matchKey in question.correctMatches) {
                    const correctItem = question.correctMatches[matchKey];
                    if (userAnswer[matchKey] !== correctItem) {
                        return false;
                    }
                }
                return Object.keys(userAnswer).length === Object.keys(question.correctMatches).length;
            
            default:
                return false;
        }
    }

    showFeedback(isCorrect, question) {
        const feedbackArea = document.getElementById('feedbackArea');
        if (isCorrect) {
            feedbackArea.innerHTML = `
                <div class="feedback correct">
                    ✓ Correct! ${question.explanation || ''}
                </div>
            `;
        } else if (this.getUserAnswer(question.type)) {
            feedbackArea.innerHTML = `
                <div class="feedback incorrect">
                    ✗ Not quite right. ${question.hint || 'Try again!'}
                </div>
            `;
        }
    }

    updateVisualFeedback(isCorrect, type) {
        switch(type) {
            case 'multiple-choice':
            case 'true-false':
            case 'multiple-answer':
                const options = document.querySelectorAll('.option');
                options.forEach(option => {
                    option.classList.remove('correct', 'incorrect');
                    const input = option.querySelector('input');
                    if (input.checked) {
                        option.classList.add(isCorrect ? 'correct' : 'incorrect');
                    }
                });
                break;
            
            case 'identification':
            case 'text':
                const textInput = document.getElementById('textAnswer');
                if (textInput && textInput.value) {
                    textInput.classList.remove('correct', 'incorrect');
                    textInput.classList.add(isCorrect ? 'correct' : 'incorrect');
                }
                break;
            
            case 'enumeration':
                const enumInputs = document.querySelectorAll('.enumeration-input');
                enumInputs.forEach(input => {
                    if (input.value) {
                        input.classList.remove('correct', 'incorrect');
                        input.classList.add(isCorrect ? 'correct' : 'incorrect');
                    }
                });
                break;
            
            case 'matching':
                // Individual matches are handled by checkIndividualMatch()
                // This just provides overall completion feedback
                const zones = document.querySelectorAll('.drop-zone');
                const filledZones = Array.from(zones).filter(zone => 
                    zone.querySelector('.dropped-item').textContent.trim()
                );
                
                if (isCorrect && filledZones.length === zones.length) {
                    // All matches are correct and complete
                    zones.forEach(zone => {
                        if (!zone.classList.contains('correct-match')) {
                            zone.classList.add('overall-complete');
                        }
                    });
                }
                break;
        }
    }

    updateAnswerKey(question, options) {
        const answerKeyBody = document.getElementById('answerKeyBody');
        let answerHtml = '';
        
        switch(question.type) {
            case 'multiple-choice':
                answerHtml = `Correct Answer: ${question.options[question.correctAnswer]}`;
                break;
            case 'true-false':
                answerHtml = `Correct Answer: ${question.correctAnswer ? 'True' : 'False'}`;
                break;
            case 'multiple-answer':
                const correctOptions = question.correctAnswer.map(i => question.options[i]).join(', ');
                answerHtml = `Correct Answers: ${correctOptions}`;
                break;
            case 'identification':
            case 'text':
                if (Array.isArray(question.correctAnswer)) {
                    answerHtml = `Acceptable Answers: ${question.correctAnswer.join(', ')}`;
                } else {
                    answerHtml = `Correct Answer: ${question.correctAnswer}`;
                }
                if (options.caseSensitive) {
                    answerHtml += `<br><em>Note: Case sensitive</em>`;
                }
                break;
            case 'enumeration':
                answerHtml = `Correct Answers:<br>`;
                question.correctAnswer.forEach((ans, i) => {
                    if (Array.isArray(ans)) {
                        answerHtml += `${i + 1}. ${ans.join(' or ')}<br>`;
                    } else {
                        answerHtml += `${i + 1}. ${ans}<br>`;
                    }
                });
                if (!options.orderSensitive) {
                    answerHtml += `<br><em>Note: Any order is acceptable</em>`;
                }
                if (options.caseSensitive) {
                    answerHtml += `<br><em>Note: Case sensitive</em>`;
                }
                break;
            case 'matching':
                answerHtml = `Correct Matches:<br>`;
                for (let matchKey in question.correctMatches) {
                    answerHtml += `${matchKey} → ${question.correctMatches[matchKey]}<br>`;
                }
                break;
        }
        
        answerKeyBody.innerHTML = `
            <div class="answer-item">
                <strong>Question ${this.currentQuestionIndex + 1}:</strong><br>
                ${question.question}<br><br>
                ${answerHtml}
                ${question.explanation ? `<br><br>Explanation: ${question.explanation}` : ''}
            </div>
        `;
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.quizData.questions.length - 1) {
            this.currentQuestionIndex++;
            this.renderQuestion();
            this.updateProgress();
            this.updateNavigation();
        } else {
            this.showResults();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderQuestion();
            this.updateProgress();
            this.updateNavigation();
        }
    }

    updateProgress() {
        const progress = ((this.currentQuestionIndex + 1) / this.quizData.questions.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentQuestionIndex === 0;
        }
        
        if (nextBtn) {
            nextBtn.textContent = this.currentQuestionIndex === this.quizData.questions.length - 1 
                ? 'Finish Quiz' : 'Next Question';
        }
    }

    showResults() {
        const percentage = Math.round((this.score / this.quizData.questions.length) * 100);
        let message = '';
        
        if (percentage >= 90) {
            message = 'Excellent work! You mastered this quiz!';
        } else if (percentage >= 70) {
            message = 'Good job! Keep practicing to improve further.';
        } else if (percentage >= 50) {
            message = 'Not bad! Review the material and try again.';
        } else {
            message = 'Keep studying! You can do better with more practice.';
        }
        
        const resultsHtml = `
            <div class="results-container">
                <h2>Quiz Complete!</h2>
                <div class="results-score">${this.score}/${this.quizData.questions.length}</div>
                <div class="results-percentage">${percentage}%</div>
                <p class="results-message">${message}</p>
                <button class="retry-button" onclick="location.reload()">Try Again</button>
                <button class="nav-button" onclick="location.href='index.html'">Back to Home</button>
            </div>
        `;
        
        document.getElementById('quizContent').innerHTML = resultsHtml;
        this.isQuizComplete = true;
    }

    setupEventListeners() {
        // Navigation buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'nextBtn') {
                this.nextQuestion();
            } else if (e.target.id === 'prevBtn') {
                this.previousQuestion();
            } else if (e.target.id === 'answerKeyToggle') {
                this.toggleAnswerKey();
            } else if (e.target.classList.contains('close-modal')) {
                this.closeAnswerKey();
            }
        });

        // Close modal on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('answer-key-modal')) {
                this.closeAnswerKey();
            }
        });
    }

    toggleAnswerKey() {
        const modal = document.getElementById('answerKeyModal');
        modal.classList.toggle('show');
    }

    closeAnswerKey() {
        const modal = document.getElementById('answerKeyModal');
        modal.classList.remove('show');
    }

    getQuestionTypeLabel(type) {
        const labels = {
            'multiple-choice': 'Multiple Choice',
            'multiple-answer': 'Multiple Answer',
            'identification': 'Identification',
            'text': 'Text Answer',
            'matching': 'Matching Type',
            'true-false': 'True or False',
            'enumeration': 'Enumeration'
        };
        return labels[type] || 'Question';
    }

    // Random shuffle array (not seeded - truly random each time)
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    getActiveOptionsDisplay(options) {
        const active = [];
        if (options.shuffleAnswers) active.push('🔀 Shuffled'); else active.push('📋 Fixed Order');
        if (options.caseSensitive) active.push('Aa Case Sensitive'); else active.push('aa Case Insensitive');
        if (!options.orderSensitive) active.push('↕️ Any Order'); else active.push('🔢 Order Matters');
        if (options.shuffleChoices) active.push('🔀 Mixed Items'); else active.push('📝 Fixed Items');
        if (options.shuffleMatches) active.push('🔀 Mixed Matches'); else active.push('🎯 Fixed Matches');
        if (options.unequalList) active.push('➕ Extra Options'); else active.push('⚖️ Equal Lists');
        
        return active.length > 0 
            ? `<div class="quiz-options-display">
                <span class="options-label">Active options:</span> ${active.join(' • ')}
              </div>` 
            : '';
    }

    // Method to clear shuffle history (useful for quiz retries)
    clearShuffleHistory() {
        this.previousShuffleStates = {};
    }

    // Method to get debug info about current shuffle states
    getShuffleDebugInfo() {
        console.log('Current shuffle states:', this.previousShuffleStates);
        return this.previousShuffleStates;
    }
}