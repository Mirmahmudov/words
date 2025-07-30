// Global variables
let words = [];
let currentTest = [];
let currentQuestionIndex = 0;
let currentScore = 0;
let currentPracticeWord = null;
let userStats = {
    totalTests: 0,
    correctAnswers: 0,
    totalQuestions: 0
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadWords();
    loadStats();
    updateHomeStats();
    setupEventListeners();
    showPage('home');
});

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });

    // Add word form
    document.getElementById('add-word-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addWord();
    });

    // Practice input
    document.getElementById('practice-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkPracticeAnswer();
        }
    });
}

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.add('active');
    
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');
    
    // Load page-specific content
    switch(pageId) {
        case 'home':
            updateHomeStats();
            break;
        case 'word-list':
            displayWords();
            break;
        case 'practice':
            startPractice();
            break;
        case 'stats':
            updateStatistics();
            break;
    }
}

// LocalStorage functions
function saveWords() {
    localStorage.setItem('englishWords', JSON.stringify(words));
}

function loadWords() {
    const savedWords = localStorage.getItem('englishWords');
    words = savedWords ? JSON.parse(savedWords) : [];
}

function saveStats() {
    localStorage.setItem('userStats', JSON.stringify(userStats));
}

function loadStats() {
    const savedStats = localStorage.getItem('userStats');
    userStats = savedStats ? JSON.parse(savedStats) : {
        totalTests: 0,
        correctAnswers: 0,
        totalQuestions: 0
    };
}

// Word Management
function addWord() {
    const englishInput = document.getElementById('english-input');
    const uzbekInput = document.getElementById('uzbek-input');
    
    const english = englishInput.value.trim().toLowerCase();
    const uzbek = uzbekInput.value.trim().toLowerCase();
    
    if (!english || !uzbek) {
        alert('Iltimos, barcha maydonlarni to\'ldiring!');
        return;
    }
    
    // Check if word already exists
    if (words.some(word => word.english === english)) {
        alert('Bu so\'z allaqachon mavjud!');
        return;
    }
    
    const newWord = {
        id: Date.now(),
        english: english,
        uzbek: uzbek,
        learned: false,
        correctCount: 0,
        totalAttempts: 0
    };
    
    words.push(newWord);
    saveWords();
    
    // Clear form
    englishInput.value = '';
    uzbekInput.value = '';
    
    // Show success message
    alert('So\'z muvaffaqiyatli qo\'shildi!');
    
    // Update stats
    updateHomeStats();
}

// Bulk import function
function importBulkWords() {
    const bulkInput = document.getElementById('bulk-input');
    const inputText = bulkInput.value.trim();
    
    if (!inputText) {
        alert('Iltimos, so\'zlar ro\'yxatini kiriting!');
        return;
    }
    
    try {
        const wordsArray = JSON.parse(inputText);
        
        if (!Array.isArray(wordsArray)) {
            throw new Error('Ma\'lumot array formatida bo\'lishi kerak');
        }
        
        let addedCount = 0;
        let skippedCount = 0;
        
        wordsArray.forEach((wordData, index) => {
            // Validate word structure
            if (!wordData.english || !wordData.uzbek) {
                console.warn(`${index + 1}-so\'z: english va uzbek maydonlari bo\'lishi shart`);
                skippedCount++;
                return;
            }
            
            const english = wordData.english.trim().toLowerCase();
            const uzbek = wordData.uzbek.trim().toLowerCase();
            
            // Check if word already exists
            if (words.some(word => word.english === english)) {
                console.warn(`"${english}" so\'zi allaqachon mavjud`);
                skippedCount++;
                return;
            }
            
            const newWord = {
                id: Date.now() + index,
                english: english,
                uzbek: uzbek,
                learned: false,
                correctCount: 0,
                totalAttempts: 0
            };
            
            words.push(newWord);
            addedCount++;
        });
        
        if (addedCount > 0) {
            saveWords();
            updateHomeStats();
        }
        
        // Clear input
        bulkInput.value = '';
        
        // Show result message
        let message = `${addedCount} ta so\'z muvaffaqiyatli qo\'shildi!`;
        if (skippedCount > 0) {
            message += `\n${skippedCount} ta so\'z o\'tkazib yuborildi (takroriy yoki noto\'g\'ri format).`;
        }
        alert(message);
        
    } catch (error) {
        alert('Xato: JSON format noto\'g\'ri. Iltimos, to\'g\'ri formatda kiriting.\n\nMisol: [{"english": "apple", "uzbek": "olma"}]');
        console.error('JSON parse error:', error);
    }
}

// Add sample words function
function addSampleWords() {
    const sampleWords = [
        {"english": "apple", "uzbek": "olma"},
        {"english": "book", "uzbek": "kitob"},
        {"english": "water", "uzbek": "suv"},
        {"english": "house", "uzbek": "uy"},
        {"english": "car", "uzbek": "mashina"},
        {"english": "tree", "uzbek": "daraxt"},
        {"english": "sun", "uzbek": "quyosh"},
        {"english": "moon", "uzbek": "oy"},
        {"english": "star", "uzbek": "yulduz"},
        {"english": "flower", "uzbek": "gul"}
    ];
    
    let addedCount = 0;
    let skippedCount = 0;
    
    sampleWords.forEach((wordData, index) => {
        const english = wordData.english.toLowerCase();
        const uzbek = wordData.uzbek.toLowerCase();
        
        // Check if word already exists
        if (words.some(word => word.english === english)) {
            skippedCount++;
            return;
        }
        
        const newWord = {
            id: Date.now() + index,
            english: english,
            uzbek: uzbek,
            learned: false,
            correctCount: 0,
            totalAttempts: 0
        };
        
        words.push(newWord);
        addedCount++;
    });
    
    if (addedCount > 0) {
        saveWords();
        updateHomeStats();
    }
    
    let message = `${addedCount} ta namuna so\'z qo\'shildi!`;
    if (skippedCount > 0) {
        message += `\n${skippedCount} ta so\'z allaqachon mavjud edi.`;
    }
    alert(message);
}

function deleteWord(id) {
    if (confirm('Haqiqatan ham bu so\'zni o\'chirmoqchimisiz?')) {
        words = words.filter(word => word.id !== id);
        saveWords();
        displayWords();
        updateHomeStats();
    }
}

function displayWords() {
    const container = document.getElementById('words-container');
    
    if (words.length === 0) {
        container.innerHTML = '<p class="text-center">Hozircha so\'zlar yo\'q. Birinchi so\'zingizni qo\'shing!</p>';
        return;
    }
    
    container.innerHTML = words.map(word => `
        <div class="word-item">
            <div class="word-content">
                <span class="word-english">${word.english}</span>
                <span> - </span>
                <span class="word-uzbek">${word.uzbek}</span>
                ${word.learned ? '<span class="learned-badge">✅ Yodlangan</span>' : ''}
            </div>
            <button class="btn btn-danger" onclick="deleteWord(${word.id})">O'chirish</button>
        </div>
    `).join('');
}

// Test Functions
function startTest() {
    if (words.length < 4) {
        alert('Test uchun kamida 4 ta so\'z kerak!');
        return;
    }
    
    // Reset test state
    currentTest = [];
    currentQuestionIndex = 0;
    currentScore = 0;
    
    // Generate 10 random questions (or all words if less than 10)
    const testWords = [...words].sort(() => Math.random() - 0.5).slice(0, Math.min(10, words.length));
    currentTest = testWords;
    
    // Show test game
    document.getElementById('test-start').classList.add('hidden');
    document.getElementById('test-game').classList.remove('hidden');
    document.getElementById('test-result').classList.add('hidden');
    
    showQuestion();
}

function showQuestion() {
    if (currentQuestionIndex >= currentTest.length) {
        endTest();
        return;
    }
    
    const currentWord = currentTest[currentQuestionIndex];
    const questionText = `What is the meaning of "${currentWord.english}"?`;
    
    // Generate options
    const correctAnswer = currentWord.uzbek;
    const wrongAnswers = words
        .filter(word => word.id !== currentWord.id)
        .map(word => word.uzbek)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    
    const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    
    // Update UI
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    document.getElementById('current-score').textContent = currentScore;
    document.getElementById('question-text').textContent = questionText;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = allOptions.map(option => `
        <button class="option-btn" onclick="selectAnswer('${option}', '${correctAnswer}')">${option}</button>
    `).join('');
}

function selectAnswer(selectedAnswer, correctAnswer) {
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    // Update word statistics
    const currentWord = currentTest[currentQuestionIndex];
    currentWord.totalAttempts++;
    
    if (selectedAnswer === correctAnswer) {
        currentScore++;
        currentWord.correctCount++;
        
        // Mark as learned if answered correctly multiple times
        if (currentWord.correctCount >= 3) {
            currentWord.learned = true;
        }
        
        // Highlight correct answer
        buttons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });
    } else {
        // Highlight correct and incorrect answers
        buttons.forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            } else if (btn.textContent === selectedAnswer) {
                btn.classList.add('incorrect');
            }
        });
    }
    
    // Save updated word data
    saveWords();
    
    // Move to next question after delay
    setTimeout(() => {
        currentQuestionIndex++;
        showQuestion();
    }, 1500);
}

function endTest() {
    // Update user statistics
    userStats.totalTests++;
    userStats.correctAnswers += currentScore;
    userStats.totalQuestions += currentTest.length;
    saveStats();
    
    // Show results
    const percentage = Math.round((currentScore / currentTest.length) * 100);
    
    document.getElementById('test-game').classList.add('hidden');
    document.getElementById('test-result').classList.remove('hidden');
    document.getElementById('final-score').textContent = percentage + '%';
    document.getElementById('correct-answers').textContent = currentScore;
    
    updateHomeStats();
}

function resetTest() {
    document.getElementById('test-result').classList.add('hidden');
    document.getElementById('test-start').classList.remove('hidden');
}

// Practice Functions
function startPractice() {
    if (words.length === 0) {
        document.querySelector('.practice-container').innerHTML = `
            <h2>🧠 Mashq rejimi</h2>
            <p class="text-center">Mashq qilish uchun avval so'zlar qo'shing!</p>
            <div class="text-center mt-2">
                <button class="btn btn-primary" onclick="showPage('add-word')">So'z qo'shish</button>
            </div>
        `;
        return;
    }
    
    nextPracticeWord();
}

function nextPracticeWord() {
    currentPracticeWord = words[Math.floor(Math.random() * words.length)];
    document.getElementById('practice-word').textContent = currentPracticeWord.english;
    document.getElementById('practice-input').value = '';
    document.getElementById('practice-feedback').classList.add('hidden');
}

function checkPracticeAnswer() {
    const userAnswer = document.getElementById('practice-input').value.trim().toLowerCase();
    const correctAnswer = currentPracticeWord.uzbek.toLowerCase();
    const feedback = document.getElementById('practice-feedback');
    
    if (!userAnswer) {
        alert('Iltimos, javobni kiriting!');
        return;
    }
    
    feedback.classList.remove('hidden');
    
    if (userAnswer === correctAnswer) {
        feedback.textContent = '✅ To\'g\'ri! Ajoyib!';
        feedback.className = 'feedback correct';
        
        // Update word statistics
        currentPracticeWord.correctCount++;
        currentPracticeWord.totalAttempts++;
        
        if (currentPracticeWord.correctCount >= 3) {
            currentPracticeWord.learned = true;
        }
    } else {
        feedback.textContent = `❌ Noto'g'ri. To'g'ri javob: ${currentPracticeWord.uzbek}`;
        feedback.className = 'feedback incorrect';
        currentPracticeWord.totalAttempts++;
    }
    
    saveWords();
    updateHomeStats();
}

// Statistics Functions
function updateHomeStats() {
    const totalWords = words.length;
    const learnedWords = words.filter(word => word.learned).length;
    
    document.getElementById('total-words').textContent = totalWords;
    document.getElementById('learned-words').textContent = learnedWords;
}

function updateStatistics() {
    const totalWords = words.length;
    const learnedWords = words.filter(word => word.learned).length;
    const learnedPercentage = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;
    const accuracy = userStats.totalQuestions > 0 ? Math.round((userStats.correctAnswers / userStats.totalQuestions) * 100) : 0;
    
    // Update progress bar
    document.getElementById('progress-fill').style.width = learnedPercentage + '%';
    document.getElementById('learned-percentage').textContent = learnedPercentage;
    
    // Update stats
    document.getElementById('stats-total').textContent = totalWords;
    document.getElementById('stats-learned').textContent = learnedWords;
    document.getElementById('stats-accuracy').textContent = accuracy + '%';
}