// Base JavaScript functions for Quiz Hub - Shared across all pages

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

// Quiz Functions
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
            passed: score >= 70 // Assuming 70% is passing
        };
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
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
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