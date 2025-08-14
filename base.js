// Base JavaScript functions for Quiz Hub - Enhanced with Quiz Components

// Utility Functions
const Utils = {
    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        return date.toLocaleDateString();
    },

    // Check if date is recent (within 7 days)
    isRecent(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
    },

    // Get difficulty color
    getDifficultyColor(difficulty) {
        const colors = {
            'beginner': '#4CAF50',
            'intermediate': '#FF9800',
            'advanced': '#F44336'
        };
        return colors[difficulty.toLowerCase()] || '#2196F3';
    },

    // Shuffle array (for randomizing questions)
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Debounce function for search
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Navigation Functions
const Navigation = {
    // Go back to homepage
    goHome() {
        window.location.href = 'home.html';
    },

    // Navigate to specific quiz
    goToQuiz(filename) {
        window.location.href = filename;
    },

    // Set active navigation item
    setActiveNav(currentPage) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }
};

// Local Storage Functions
const Storage = {
    // Save quiz results
    saveQuizResult(quizId, result) {
        const results = this.getQuizResults(quizId) || [];
        results.push({
            ...result,
            timestamp: new Date().toISOString(),
            id: Utils.generateId()
        });
        localStorage.setItem(`quiz_${quizId}`, JSON.stringify(results));
    },

    // Get quiz results
    getQuizResults(quizId) {
        const data = localStorage.getItem(`quiz_${quizId}`);
        return data ? JSON.parse(data) : null;
    },

    // Get best score for a quiz
    getBestScore(quizId) {
        const results = this.getQuizResults(quizId);
        if (!results || results.length === 0) return null;
        return Math.max(...results.map(r => r.score));
    },

    // Get last attempt for a quiz
    getLastAttempt(quizId) {
        const results = this.getQuizResults(quizId);
        if (!results || results.length === 0) return null;
        return results[results.length - 1];
    },

    // Clear quiz results
    clearQuizResults(quizId) {
        localStorage.removeItem(`quiz_${quizId}`);
    },

    // Save quiz progress (for resuming)
    saveProgress(quizId, progress) {
        localStorage.setItem(`progress_${quizId}`, JSON.stringify(progress));
    },

    // Get quiz progress
    getProgress(quizId) {
        const data = localStorage.getItem(`progress_${quizId}`);
        return data ? JSON.parse(data) : null;
    },

    // Clear quiz progress
    clearProgress(quizId) {
        localStorage.removeItem(`progress_${quizId}`);
    }
};

// UI Functions
const UI = {
    // Show loading spinner
    showLoading(element) {
        if (element) {
            element.innerHTML = '<div class="loading">Loading...</div>';
        }
    },

    // Show notification
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            font-weight: bold;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    },

    // Confirm dialog
    confirm(message, onConfirm, onCancel) {
        const confirmed = window.confirm(message);
        if (confirmed && onConfirm) {
            onConfirm();
        } else if (!confirmed && onCancel) {
            onCancel();
        }
        return confirmed;
    },

    // Smooth scroll to element
    scrollTo(element) {
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }
};

// Quiz Question Types - Modular Components
const QuestionTypes = {
    // Matching Question Component
    matching: {
        render(question, currentQuestion, totalQuestions) {
            return `
                <div class="question-container">
                    <div class="question-header">
                        <div class="question-counter">Question ${currentQuestion + 1} of ${totalQuestions}</div>
                        <div class="question-type">Match All ${question.leftItems.length} Concepts</div>
                    </div>
                    
                    <div class="question-text">${question.question}</div>
                    
                    <div class="matching-container">
                        <div class="matching-column">
                            <div class="column-title">Concepts</div>
                            ${question.leftItems.map(item => `
                                <div class="matching-item" data-id="${item.id}" data-correct="${item.correct}">
                                    ${item.text}
                                </div>
                            `).join('')}
                        </div>
                        
                        <div class="matching-column">
                            <div class="column-title">Definitions</div>
                            ${question.rightItems.map(item => `
                                <div class="matching-item" data-id="${item.id}">
                                    ${item.text}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        },

        setupInteraction(questionData, onUpdate, onComplete) {
            const leftItems = document.querySelectorAll('.matching-column:first-child .matching-item');
            const rightItems = document.querySelectorAll('.matching-column:last-child .matching-item');
            let selectedLeft = null;
            let matches = {};
            let correctMatches = 0;

            leftItems.forEach(item => {
                item.addEventListener('click', () => {
                    if (item.classList.contains('correct') || item.classList.contains('incorrect')) {
                        // Allow changing answers
                        item.classList.remove('correct', 'incorrect');
                        const matchedRightId = matches[item.dataset.id];
                        if (matchedRightId) {
                            const rightItem = document.querySelector(`[data-id="${matchedRightId}"]`);
                            if (rightItem) {
                                rightItem.classList.remove('correct', 'incorrect');
                            }
                            if (matchedRightId === item.dataset.correct) {
                                correctMatches--;
                            }
                            delete matches[item.dataset.id];
                            onUpdate({ matches, correctMatches });
                        }
                    }
                    
                    leftItems.forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                    selectedLeft = item;
                });
            });

            rightItems.forEach(item => {
                item.addEventListener('click', () => {
                    if (!selectedLeft) return;
                    
                    if (item.classList.contains('correct') || item.classList.contains('incorrect')) {
                        item.classList.remove('correct', 'incorrect');
                    }
                    
                    const leftId = selectedLeft.dataset.id;
                    const rightId = item.dataset.id;
                    const correctAnswer = selectedLeft.dataset.correct;
                    
                    // Remove existing matches
                    if (matches[leftId]) {
                        const prevRightItem = document.querySelector(`[data-id="${matches[leftId]}"]`);
                        if (prevRightItem) {
                            prevRightItem.classList.remove('matched', 'selected', 'correct', 'incorrect');
                        }
                        if (matches[leftId] === correctAnswer) {
                            correctMatches--;
                        }
                    }
                    
                    for (let [key, value] of Object.entries(matches)) {
                        if (value === rightId) {
                            delete matches[key];
                            const leftItem = document.querySelector(`[data-id="${key}"]`);
                            if (leftItem) {
                                leftItem.classList.remove('matched', 'selected', 'correct', 'incorrect');
                                const prevCorrect = leftItem.dataset.correct;
                                if (rightId === prevCorrect) {
                                    correctMatches--;
                                }
                            }
                            break;
                        }
                    }
                    
                    matches[leftId] = rightId;
                    
                    selectedLeft.classList.remove('selected');
                    item.classList.remove('selected');
                    
                    // Check if correct
                    if (rightId === correctAnswer) {
                        selectedLeft.classList.add('correct');
                        item.classList.add('correct');
                        correctMatches++;
                    } else {
                        selectedLeft.classList.add('incorrect');
                        item.classList.add('incorrect');
                    }
                    
                    selectedLeft = null;
                    onUpdate({ matches, correctMatches });
                    
                    if (correctMatches === questionData.leftItems.length && onComplete) {
                        setTimeout(() => onComplete(), 1000);
                    }
                });
            });

            return { matches, correctMatches };
        }
    },

    // Identification Question Component
    identification: {
        render(question, currentQuestion, totalQuestions) {
            return `
                <div class="question-container">
                    <div class="question-header">
                        <div class="question-counter">Question ${currentQuestion + 1} of ${totalQuestions}</div>
                        <div class="question-type">Identification</div>
                    </div>
                    
                    <div class="question-text">${question.question}</div>
                    
                    <div class="identification-container">
                        <div class="input-grid">
                            ${(question.userAnswers || Array(question.correctAnswers.length).fill('')).map((answer, index) => `
                                <div class="input-item">
                                    <div class="input-number">${index + 1}</div>
                                    <input type="text" class="input-field" id="answer${index}" 
                                           value="${answer}" placeholder="Enter answer...">
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        },

        setupInteraction(questionData, onUpdate) {
            const inputs = document.querySelectorAll('.input-field');
            const userAnswers = questionData.userAnswers || Array(questionData.correctAnswers.length).fill('');
            
            inputs.forEach((input, index) => {
                input.addEventListener('input', (e) => {
                    userAnswers[index] = e.target.value.trim();
                    onUpdate({ userAnswers: [...userAnswers] });
                });
            });

            return { userAnswers };
        },

        checkAnswers(question, userAnswers) {
            const inputs = document.querySelectorAll('.input-field');
            let correctCount = 0;

            inputs.forEach((input, index) => {
                const userAnswer = input.value.trim();
                const isCorrect = question.correctAnswers.some(correct => 
                    correct.toLowerCase() === userAnswer.toLowerCase()
                );

                input.classList.remove('correct', 'incorrect');
                if (userAnswer) {
                    if (isCorrect) {
                        input.classList.add('correct');
                        correctCount++;
                    } else {
                        input.classList.add('incorrect');
                    }
                }
            });

            UI.showNotification(
                `You got ${correctCount} out of ${question.correctAnswers.length} correct!`, 
                correctCount >= Math.ceil(question.correctAnswers.length * 0.7) ? 'success' : 'error'
            );

            return {
                correctCount,
                score: correctCount / question.correctAnswers.length,
                userAnswers
            };
        }
    },

    // Hybrid Question Component (Matching + Identification)
    hybrid: {
        render(question, currentQuestion, totalQuestions) {
            return `
                <div class="question-container">
                    <div class="question-header">
                        <div class="question-counter">Question ${currentQuestion + 1} of ${totalQuestions}</div>
                        <div class="question-type">Block Diagram Analysis</div>
                    </div>
                    
                    <div class="question-text">${question.question}</div>
                    
                    ${question.image ? `
                        <div class="block-diagram-container">
                            <img src="${question.image}" alt="Block Diagram" class="block-diagram-image">
                        </div>
                    ` : ''}
                    
                    <div class="hybrid-container">
                        <!-- Matching Section -->
                        <div class="matching-section">
                            <div class="matching-column">
                                <div class="column-title">Numbers (from diagram)</div>
                                ${question.leftItems.map(item => `
                                    <div class="matching-item" data-id="${item.id}" data-correct="${item.correct}">
                                        ${item.text}
                                    </div>
                                `).join('')}
                            </div>
                            
                            <div class="matching-column">
                                <div class="column-title">Symbols</div>
                                ${question.rightItems.map(item => `
                                    <div class="matching-item" data-id="${item.id}">
                                        ${item.text}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- Identification Section -->
                        <div class="identification-section">
                            <div class="identification-title">Complete the component names (in order 1-${question.identificationAnswers.length}):</div>
                            <div class="input-grid">
                                ${(question.userAnswers || Array(question.identificationAnswers.length).fill('')).map((answer, index) => `
                                    <div class="input-item">
                                        <div class="input-number">${index + 1}</div>
                                        <input type="text" class="input-field" id="hybridAnswer${index}" 
                                               value="${answer}" placeholder="Enter component name...">
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        setupInteraction(questionData, onUpdate) {
            // Matching interaction
            const leftItems = document.querySelectorAll('.matching-section .matching-column:first-child .matching-item');
            const rightItems = document.querySelectorAll('.matching-section .matching-column:last-child .matching-item');
            let selectedLeft = null;
            let matches = {};
            const userAnswers = questionData.userAnswers || Array(questionData.identificationAnswers.length).fill('');

            leftItems.forEach(item => {
                item.addEventListener('click', () => {
                    if (item.classList.contains('correct') || item.classList.contains('incorrect')) {
                        item.classList.remove('correct', 'incorrect');
                        const matchedRightId = matches[item.dataset.id];
                        if (matchedRightId) {
                            const rightItem = document.querySelector(`[data-id="${matchedRightId}"]`);
                            if (rightItem) {
                                rightItem.classList.remove('correct', 'incorrect');
                            }
                            delete matches[item.dataset.id];
                            onUpdate({ matches, userAnswers });
                        }
                    }
                    
                    leftItems.forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                    selectedLeft = item;
                });
            });

            rightItems.forEach(item => {
                item.addEventListener('click', () => {
                    if (!selectedLeft) return;
                    
                    if (item.classList.contains('correct') || item.classList.contains('incorrect')) {
                        item.classList.remove('correct', 'incorrect');
                    }
                    
                    const leftId = selectedLeft.dataset.id;
                    const rightId = item.dataset.id;
                    const correctAnswer = selectedLeft.dataset.correct;
                    
                    // Remove existing matches
                    if (matches[leftId]) {
                        const prevRightItem = document.querySelector(`[data-id="${matches[leftId]}"]`);
                        if (prevRightItem) {
                            prevRightItem.classList.remove('matched', 'selected', 'correct', 'incorrect');
                        }
                    }
                    
                    for (let [key, value] of Object.entries(matches)) {
                        if (value === rightId) {
                            delete matches[key];
                            const leftItem = document.querySelector(`[data-id="${key}"]`);
                            if (leftItem) {
                                leftItem.classList.remove('matched', 'selected', 'correct', 'incorrect');
                            }
                            break;
                        }
                    }
                    
                    matches[leftId] = rightId;
                    
                    selectedLeft.classList.remove('selected');
                    item.classList.remove('selected');
                    
                    // Check if correct
                    if (rightId === correctAnswer || (correctAnswer === 'any' && rightId === 'any')) {
                        selectedLeft.classList.add('correct');
                        item.classList.add('correct');
                    } else {
                        selectedLeft.classList.add('incorrect');
                        item.classList.add('incorrect');
                    }
                    
                    selectedLeft = null;
                    onUpdate({ matches, userAnswers });
                });
            });

            // Identification inputs
            const inputs = document.querySelectorAll('input[id^="hybridAnswer"]');
            inputs.forEach((input, index) => {
                input.addEventListener('input', (e) => {
                    userAnswers[index] = e.target.value.trim();
                    onUpdate({ matches, userAnswers: [...userAnswers] });
                });
            });

            return { matches, userAnswers };
        },

        checkAnswers(question, matches, userAnswers) {
            // Check symbol matches
            let correctSymbols = 0;
            for (let [leftId, rightId] of Object.entries(matches)) {
                const leftItem = question.leftItems.find(item => item.id === leftId);
                if (leftItem && (rightId === leftItem.correct || (leftItem.correct === 'any' && rightId === 'any'))) {
                    correctSymbols++;
                }
            }
            
            // Check identification answers
            let correctNames = 0;
            const inputs = document.querySelectorAll('input[id^="hybridAnswer"]');
            inputs.forEach((input, index) => {
                const userAnswer = input.value.trim();
                const correctAnswer = question.identificationAnswers[index];
                
                input.classList.remove('correct', 'incorrect');
                if (userAnswer) {
                    if (correctAnswer.toLowerCase() === userAnswer.toLowerCase()) {
                        input.classList.add('correct');
                        correctNames++;
                    } else {
                        input.classList.add('incorrect');
                    }
                }
            });

            UI.showNotification(
                `Symbols: ${correctSymbols}/${question.leftItems.length} | Names: ${correctNames}/${question.identificationAnswers.length}`,
                (correctSymbols + correctNames) >= Math.ceil((question.leftItems.length + question.identificationAnswers.length) * 0.7) ? 'success' : 'error'
            );

            return {
                correctSymbols,
                correctNames,
                score: (correctSymbols + correctNames) / (question.leftItems.length + question.identificationAnswers.length),
                matches,
                userAnswers
            };
        }
    }
};

// Quiz Base Class
class QuizBase {
    constructor(data) {
        this.data = data;
        this.currentQuestion = 0;
        this.answers = [];
        this.questionStates = {}; // Store state for each question
        
        this.init();
    }

    init() {
        // Randomize questions if needed
        this.randomizeQuestions();
        this.renderQuestion();
    }

    randomizeQuestions() {
        // Randomize right items for matching questions
        this.data.questions.forEach(question => {
            if (question.type === 'matching' || question.type === 'hybrid') {
                if (question.rightItems) {
                    question.rightItems = Utils.shuffleArray(question.rightItems);
                }
            }
        });
    }

    renderQuestion() {
        const question = this.data.questions[this.currentQuestion];
        const container = document.getElementById('quizContainer');

        if (!QuestionTypes[question.type]) {
            console.error(`Unknown question type: ${question.type}`);
            return;
        }

        const questionHTML = QuestionTypes[question.type].render(
            question, 
            this.currentQuestion, 
            this.data.questions.length
        );

        container.innerHTML = questionHTML + this.renderQuizControls();

        this.setupQuestionInteraction();
        this.updateProgress();
    }

    setupQuestionInteraction() {
        const question = this.data.questions[this.currentQuestion];
        const questionType = QuestionTypes[question.type];

        if (questionType.setupInteraction) {
            const state = questionType.setupInteraction(
                question,
                (data) => this.updateQuestionState(data),
                () => this.onQuestionComplete()
            );
            this.questionStates[this.currentQuestion] = state;
        }
    }

    updateQuestionState(data) {
        this.questionStates[this.currentQuestion] = {
            ...this.questionStates[this.currentQuestion],
            ...data
        };
        this.updateProgress();
    }

    onQuestionComplete() {
        UI.showNotification('Perfect! All matched correctly!', 'success', 2000);
        setTimeout(() => {
            this.nextQuestion();
        }, 2000);
    }

    renderQuizControls() {
        return `
            <div class="quiz-controls">
                <div class="navigation-controls">
                    <button class="btn btn-secondary" onclick="quiz.previousQuestion()" 
                            ${this.currentQuestion === 0 ? 'disabled' : ''}>← Previous</button>
                </div>
                
                <div class="progress-info">
                    <div class="progress-text" id="progressText">Question ${this.currentQuestion + 1} of ${this.data.questions.length}</div>
                    <div class="progress-bar">
                        <div class="progress-fill" id="progressFill"></div>
                    </div>
                </div>
                
                <div class="action-controls">
                    <button class="btn btn-warning" onclick="quiz.resetCurrentQuestion()">Reset</button>
                    <button class="btn btn-secondary" onclick="quiz.showAnswerKey()">Answer Key</button>
                    ${this.renderCheckButton()}
                    <button class="btn btn-success" onclick="quiz.nextQuestion()" id="nextBtn">
                        ${this.currentQuestion === this.data.questions.length - 1 ? 'Finish Quiz' : 'Next →'}
                    </button>
                </div>
            </div>
        `;
    }

    renderCheckButton() {
        const question = this.data.questions[this.currentQuestion];
        if (question.type === 'identification') {
            return '<button class="btn btn-primary" onclick="quiz.checkCurrentAnswers()">Check Answers</button>';
        } else if (question.type === 'hybrid') {
            return '<button class="btn btn-primary" onclick="quiz.checkCurrentAnswers()">Check Names</button>';
        }
        return '';
    }

    updateProgress() {
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        
        if (!progressText || !progressFill) return;

        const question = this.data.questions[this.currentQuestion];
        const state = this.questionStates[this.currentQuestion] || {};

        if (question.type === 'matching') {
            const matchCount = Object.keys(state.matches || {}).length;
            const totalItems = question.leftItems.length;
            progressText.textContent = `Matched: ${matchCount} / ${totalItems}`;
            progressFill.style.width = `${(matchCount / totalItems) * 100}%`;
        } else if (question.type === 'hybrid') {
            const symbolMatches = Object.keys(state.matches || {}).length;
            const nameCount = (state.userAnswers || []).filter(answer => answer.trim() !== '').length;
            const totalSymbols = question.leftItems.length;
            const totalNames = question.identificationAnswers.length;
            progressText.textContent = `Symbols: ${symbolMatches}/${totalSymbols} | Names: ${nameCount}/${totalNames}`;
            progressFill.style.width = `${((symbolMatches + nameCount) / (totalSymbols + totalNames)) * 100}%`;
        } else {
            const overallProgress = ((this.currentQuestion + 1) / this.data.questions.length) * 100;
            progressFill.style.width = `${overallProgress}%`;
        }
    }

    checkCurrentAnswers() {
        const question = this.data.questions[this.currentQuestion];
        const questionType = QuestionTypes[question.type];
        const state = this.questionStates[this.currentQuestion] || {};

        if (questionType.checkAnswers) {
            const result = questionType.checkAnswers(question, state.matches, state.userAnswers);
            this.answers[this.currentQuestion] = {
                questionId: question.id,
                type: question.type,
                ...result
            };
        }
    }

    resetCurrentQuestion() {
        const question = this.data.questions[this.currentQuestion];
        this.questionStates[this.currentQuestion] = {};

        if (question.type === 'matching' || question.type === 'hybrid') {
            const allItems = document.querySelectorAll('.matching-item');
            allItems.forEach(item => {
                item.classList.remove('selected', 'correct', 'incorrect', 'matched');
            });
        }

        if (question.type === 'identification' || question.type === 'hybrid') {
            const inputs = document.querySelectorAll('.input-field');
            inputs.forEach(input => {
                input.value = '';
                input.classList.remove('correct', 'incorrect');
            });
            if (question.userAnswers) {
                question.userAnswers.fill('');
            }
        }

        this.updateProgress();
    }

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.renderQuestion();
        }
    }

    nextQuestion() {
        // Save current question state
        const currentQ = this.data.questions[this.currentQuestion];
        const state = this.questionStates[this.currentQuestion] || {};

        if (!this.answers[this.currentQuestion]) {
            this.answers[this.currentQuestion] = {
                questionId: currentQ.id,
                type: currentQ.type,
                ...state
            };
        }

        if (this.currentQuestion < this.data.questions.length - 1) {
            this.currentQuestion++;
            this.renderQuestion();
        } else {
            this.finishQuiz();
        }
    }

    showAnswerKey() {
        const question = this.data.questions[this.currentQuestion];
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 1000;
            display: flex; align-items: center; justify-content: center; padding: 20px;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white; border-radius: 20px; padding: 30px;
            max-width: 900px; max-height: 80vh; overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        `;
        
        modal.innerHTML = this.generateAnswerKey(question);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    generateAnswerKey(question) {
        let answerKeyHTML = `<h2 style="text-align: center; margin-bottom: 30px; color: var(--primary-color);">Answer Key</h2>`;

        if (question.type === 'matching') {
            answerKeyHTML += `<div style="display: grid; gap: 15px;">`;
            question.leftItems.forEach(item => {
                const correctDefinition = question.rightItems.find(right => right.id === item.correct);
                answerKeyHTML += `
                    <div style="border: 1px solid #e9ecef; border-radius: 10px; padding: 15px; background: #f8f9fa;">
                        <div style="font-weight: bold; color: var(--primary-color); margin-bottom: 8px;">
                            ${item.text}
                        </div>
                        <div style="color: var(--text-dark); font-size: 0.9rem;">
                            ${correctDefinition ? correctDefinition.text : 'No definition found'}
                        </div>
                    </div>
                `;
            });
        } else if (question.type === 'identification') {
            answerKeyHTML += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">`;
            question.correctAnswers.forEach((answer, index) => {
                answerKeyHTML += `
                    <div style="border: 1px solid #28a745; border-radius: 10px; padding: 15px; background: rgba(40, 167, 69, 0.1); text-align: center;">
                        <div style="font-weight: bold; color: #28a745;">
                            ${index + 1}. ${answer}
                        </div>
                    </div>
                `;
            });
        } else if (question.type === 'hybrid') {
            answerKeyHTML += `
                <h3 style="color: var(--primary-color); margin-bottom: 15px;">Symbol Matching:</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 30px;">
            `;
            
            question.leftItems.forEach(item => {
                const correctSymbol = question.rightItems.find(right => right.id === item.correct);
                answerKeyHTML += `
                    <div style="border: 1px solid #e9ecef; border-radius: 8px; padding: 10px; background: #f8f9fa; display: flex; justify-content: space-between;">
                        <span><strong>${item.text}:</strong></span>
                        <span>${correctSymbol ? correctSymbol.text : 'any'}</span>
                    </div>
                `;
            });
            
            answerKeyHTML += `
                </div>
                <h3 style="color: var(--primary-color); margin-bottom: 15px;">Component Names (in order):</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 10px;">
            `;
            
            question.identificationAnswers.forEach((answer, index) => {
                answerKeyHTML += `
                    <div style="border: 1px solid #28a745; border-radius: 8px; padding: 10px; background: rgba(40, 167, 69, 0.1);">
                        <strong>${index + 1}. ${answer}</strong>
                    </div>
                `;
            });
        }
        
        answerKeyHTML += `
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                        style="background: var(--primary-gradient); color: white; border: none; padding: 12px 25px; border-radius: 25px; font-weight: bold; cursor: pointer;">
                    Close Answer Key
                </button>
            </div>
        `;
        
        return answerKeyHTML;
    }

    finishQuiz() {
        // Calculate final score
        let totalScore = 0;
        let totalPossible = 0;
        let correctItems = 0;
        let totalItems = 0;

        this.answers.forEach(answer => {
            if (answer) {
                if (answer.type === 'matching') {
                    const correctMatches = answer.correctMatches || 0;
                    const totalMatches = this.data.questions[this.answers.indexOf(answer)].leftItems.length;
                    totalScore += correctMatches;
                    totalPossible += totalMatches;
                    correctItems += correctMatches;
                    totalItems += totalMatches;
                } else if (answer.type === 'identification') {
                    const correct = answer.correctCount || 0;
                    const total = this.data.questions[this.answers.indexOf(answer)].correctAnswers.length;
                    totalScore += correct;
                    totalPossible += total;
                    correctItems += correct;
                    totalItems += total;
                } else if (answer.type === 'hybrid') {
                    const correctSymbols = answer.correctSymbols || 0;
                    const correctNames = answer.correctNames || 0;
                    const questionIndex = this.answers.indexOf(answer);
                    const question = this.data.questions[questionIndex];
                    const totalSymbols = question.leftItems.length;
                    const totalNames = question.identificationAnswers.length;
                    
                    totalScore += (correctSymbols + correctNames);
                    totalPossible += (totalSymbols + totalNames);
                    correctItems += (correctSymbols + correctNames);
                    totalItems += (totalSymbols + totalNames);
                }
            }
        });

        const finalScore = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
        
        const summary = {
            total: this.data.questions.length,
            correct: correctItems,
            incorrect: totalItems - correctItems,
            totalItems: totalItems,
            score: finalScore,
            percentage: finalScore,
            passed: finalScore >= 70
        };
        
        this.showResults(summary);
    }

    showResults(summary) {
        document.getElementById('quizContainer').style.display = 'none';
        const resultsContainer = document.getElementById('resultsContainer');
        
        resultsContainer.innerHTML = `
            <div class="results-container">
                <h2>Quiz Complete!</h2>
                <div class="score-display">${summary.score}%</div>
                <p class="text-${summary.passed ? 'success' : 'danger'}" style="font-size: 1.2rem; margin-bottom: 30px;">
                    ${summary.passed ? '🎉 Excellent! You have mastered these concepts!' : '📚 Good effort! Keep studying to master these concepts.'}
                </p>
                
                <div class="results-stats">
                    <div class="stat-card">
                        <span class="stat-value text-success">${summary.correct}</span>
                        <span>Correct Answers</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value text-danger">${summary.incorrect}</span>
                        <span>Incorrect Answers</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value text-primary">${summary.totalItems}</span>
                        <span>Total Items</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value text-muted">${summary.total}</span>
                        <span>Questions Completed</span>
                    </div>
                </div>
                
                <div style="margin-top: 40px; display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <button class="btn btn-primary" onclick="window.location.reload()">Try Again</button>
                    <button class="btn btn-secondary" onclick="Navigation.goHome()">Back to Home</button>
                </div>
            </div>
        `;
        
        resultsContainer.style.display = 'block';

        // Save results to localStorage
        Storage.saveQuizResult(this.data.id, summary);
    }
}

// Quiz Timer Functions
const Quiz = {
    // Timer functions
    timer: {
        intervalId: null,
        startTime: null,
        duration: 0,

        start(durationMinutes, onTick, onComplete) {
            this.startTime = Date.now();
            this.duration = durationMinutes * 60 * 1000;
            
            this.intervalId = setInterval(() => {
                const elapsed = Date.now() - this.startTime;
                const remaining = Math.max(0, this.duration - elapsed);
                
                onTick(remaining);
                
                if (remaining === 0) {
                    this.stop();
                    onComplete();
                }
            }, 1000);
        },

        stop() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
        },

        getElapsed() {
            return this.startTime ? Date.now() - this.startTime : 0;
        }
    },

    // Format time for display
    formatTime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },

    // Calculate score
    calculateScore(answers, totalQuestions) {
        const correct = answers.filter(answer => answer.correct).length;
        return Math.round((correct / totalQuestions) * 100);
    },

    // Generate quiz summary
    generateSummary(answers, timeElapsed) {
        const total = answers.length;
        const correct = answers.filter(a => a.correct).length;
        const incorrect = total - correct;
        const score = this.calculateScore(answers, total);
        
        return {
            total,
            correct,
            incorrect,
            score,
            timeElapsed,
            percentage: score,
            passed: score >= 70
        };
    }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .fade-in {
        animation: fadeIn 0.5s ease;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// Initialize base functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set current page as active in navigation
    const currentPage = window.location.pathname.split('/').pop() || 'home.html';
    Navigation.setActiveNav(currentPage);
    
    // Add fade-in animation to main content
    const container = document.querySelector('.container');
    if (container) {
        container.classList.add('fade-in');
    }
});