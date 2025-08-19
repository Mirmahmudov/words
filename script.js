// Global variables
let words = [];
let currentTest = [];
let currentQuestionIndex = 0;
let currentScore = 0;
let currentPracticeWord = null;
let translationMode = localStorage.getItem('translationMode') || 'en-uz'; // 'en-uz' or 'uz-en'
let testStage = 'start'; // 'start' | 'game' | 'result'
let userStats = {
  totalTests: 0,
  correctAnswers: 0,
  totalQuestions: 0,
};

// Wrong words variables
let currentWrongTest = [];
let currentWrongQuestionIndex = 0;
let currentWrongScore = 0;
let currentWrongPracticeWords = [];
let currentWrongPracticeWord = null;

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  loadWords();
  loadStats();
  updateHomeStats();
  setupEventListeners();
  // Restore last page
  const lastPage = localStorage.getItem('lastPage') || 'home';
  showPage(lastPage);

  // Initialize PWA
  initializePWA();

  // Initialize theme
  initializeTheme();

  // Handle URL parameters for shortcuts
  handleURLParameters();
  // Initialize mode toggle label
  updateModeToggleLabel();

  // If we were on test page, try restoring test state
  if ((localStorage.getItem('lastPage') || 'home') === 'test') {
    restoreTestStateIfAny();
  }
});

// PWA Initialization
function initializePWA() {
  // Register Service Worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("./sw.js")
        .then((registration) => {
          console.log("SW registered: ", registration);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New content is available
                showUpdateNotification();
              }
            });
          });

          // Check if there's a new version and clear old cache
          checkForUpdates(registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    });
  }

  // Handle install prompt
  window.deferredPrompt = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    console.log("PWA install prompt triggered");
    e.preventDefault();
    window.deferredPrompt = e;
    showInstallButton();
  });

  // Handle app installed
  window.addEventListener("appinstalled", (evt) => {
    console.log("PWA was installed");
    hideInstallButton();
    showNotification("Dastur muvaffaqiyatli o'rnatildi!", "success");
  });

  // Handle online/offline status
  window.addEventListener("online", () => {
    showNotification("Internet aloqasi qayta tiklandi", "success");
    hideOfflineIndicator();
  });

  window.addEventListener("offline", () => {
    showNotification(
      "Internet aloqasi yo'q. Offline rejimda ishlayapti",
      "warning"
    );
    showOfflineIndicator();
  });
}

// Handle URL parameters for shortcuts
function handleURLParameters() {
  const urlParams = new URLSearchParams(window.location.search);
  const page = urlParams.get("page");

  if (
    page &&
    ["add-word", "test", "practice", "word-list", "stats"].includes(page)
  ) {
    showPage(page);
  }
}

// Show install button
function showInstallButton() {
  const installBtn = document.createElement("button");
  installBtn.className = "btn btn-primary install-btn";
  installBtn.innerHTML = "📱 Dasturni o'rnatish";
  installBtn.style.position = "fixed";
  installBtn.style.bottom = "20px";
  installBtn.style.right = "20px";
  installBtn.style.zIndex = "1000";
  installBtn.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";

  installBtn.addEventListener("click", async () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      window.deferredPrompt = null;
      hideInstallButton();
    }
  });

  document.body.appendChild(installBtn);
}

// Hide install button
function hideInstallButton() {
  const installBtn = document.querySelector(".install-btn");
  if (installBtn) {
    installBtn.remove();
  }
}

// Show update notification
function showUpdateNotification() {
  const updateDiv = document.createElement("div");
  updateDiv.className = "update-notification";
  updateDiv.innerHTML = `
        <div class="update-content">
            <span>Yangi versiya mavjud!</span>
            <button onclick="updateApp()" class="btn btn-primary">Yangilash</button>
            <button onclick="dismissUpdate()" class="btn btn-secondary">Keyinroq</button>
        </div>
    `;
  updateDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #667eea;
        color: white;
        padding: 1rem;
        z-index: 1001;
        text-align: center;
    `;

  document.body.appendChild(updateDiv);
}

// Check for updates and clear old cache
function checkForUpdates(registration) {
  // Get current version from manifest
  fetch('./manifest.json')
    .then(response => response.json())
    .then(manifest => {
      const currentVersion = manifest.version || 'v1.0.0';
      const cachedVersion = localStorage.getItem('appVersion');
      
      if (cachedVersion && cachedVersion !== currentVersion) {
        // New version detected, clear old cache
        console.log('New version detected, clearing old cache...');
        clearOldCache();
        localStorage.setItem('appVersion', currentVersion);
      } else if (!cachedVersion) {
        localStorage.setItem('appVersion', currentVersion);
      }
    })
    .catch(error => {
      console.log('Could not check for updates:', error);
    });
}

// Clear old cache
function clearOldCache() {
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        if (cacheName.startsWith('my-english-words-')) {
          caches.delete(cacheName);
          console.log('Deleted old cache:', cacheName);
        }
      });
    });
  }
  
  // Clear localStorage data if needed (optional)
  // localStorage.clear();
}

// Update app
function updateApp() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        window.location.reload();
      }
    });
  }
}

// Dismiss update
function dismissUpdate() {
  const updateNotification = document.querySelector(".update-notification");
  if (updateNotification) {
    updateNotification.remove();
  }
}

// Show offline indicator
function showOfflineIndicator() {
  const offlineDiv = document.createElement("div");
  offlineDiv.className = "offline-indicator";
  offlineDiv.innerHTML = "📵 Offline rejim";
  offlineDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #dc3545;
        color: white;
        padding: 0.5rem;
        text-align: center;
        z-index: 1000;
        font-size: 0.9rem;
    `;

  document.body.appendChild(offlineDiv);
}

// Hide offline indicator
function hideOfflineIndicator() {
  const offlineIndicator = document.querySelector(".offline-indicator");
  if (offlineIndicator) {
    offlineIndicator.remove();
  }
}

// Theme Toggle
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update theme toggle icon
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    
    // Update manifest theme color
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
        themeColorMeta.content = newTheme === 'dark' ? '#1e293b' : '#4f46e5';
    }
}

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  const colors = {
    success: "#28a745",
    warning: "#ffc107",
    error: "#dc3545",
    info: "#17a2b8",
  };

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        z-index: 1002;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 3000);
}

// Event Listeners
function setupEventListeners() {
  // Navigation
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const page = this.getAttribute("data-page");
      showPage(page);
      closeMobileNav();
    });
  });

  // Add word form
  document
    .getElementById("add-word-form")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      addWord();
    });

  // Practice input
  document
    .getElementById("practice-input")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        checkPracticeAnswer();
      }
    });
}

// Page Navigation
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.remove("active");
  });

  // Show selected page
  document.getElementById(pageId).classList.add("active");

  // Update navigation
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  document.querySelector(`[data-page="${pageId}"]`).classList.add("active");

  // Persist current page
  localStorage.setItem('lastPage', pageId);

  // Load page-specific content
  switch (pageId) {
    case "home":
      updateHomeStats();
      break;
    case "word-list":
      displayWords();
      break;
    case "practice":
      startPractice();
      break;
    case "stats":
      updateStatistics();
      break;
    case "wrong-words":
      updateWrongWordsPage();
      break;
  }
}

// Translation mode toggle
function toggleMode() {
  translationMode = translationMode === 'en-uz' ? 'uz-en' : 'en-uz';
  localStorage.setItem('translationMode', translationMode);
  updateModeToggleLabel();

  // If user is in test or practice, refresh current view accordingly
  const currentPage = localStorage.getItem('lastPage');
  if (currentPage === 'test') {
    // If a test is running, rebuild current question with new direction
    if (!document.getElementById('test-start').classList.contains('hidden')) {
      // not started yet; just update UI when it starts
    } else if (!document.getElementById('test-game').classList.contains('hidden')) {
      showQuestion();
    }
  } else if (currentPage === 'practice') {
    // Refresh practice word prompt
    if (currentPracticeWord) {
      document.getElementById('practice-word').textContent = translationMode === 'en-uz' ? currentPracticeWord.english : currentPracticeWord.uzbek;
      document.getElementById('practice-input').placeholder = translationMode === 'en-uz' ? "Tarjimasini yozing..." : "Write the translation...";
    }
  }
}

function updateModeToggleLabel() {
  const el = document.getElementById('mode-toggle');
  if (el) {
    el.textContent = translationMode === 'en-uz' ? 'EN→UZ' : 'UZ→EN';
    el.title = translationMode === 'en-uz' ? "Savollar inglizcha, javoblar o'zbekcha" : "Savollar o'zbekcha, javoblar inglizcha";
  }
  const mobileEl = document.getElementById('mode-toggle-mobile');
  if (mobileEl) {
    mobileEl.textContent = translationMode === 'en-uz' ? 'EN→UZ' : 'UZ→EN';
  }
}

// Mobile burger menu modal
function toggleMenu() {
  const overlay = document.getElementById('mobile-nav-overlay');
  if (!overlay) return;
  const isHidden = overlay.classList.contains('hidden');
  if (isHidden) {
    overlay.classList.remove('hidden');
    document.body.classList.add('no-scroll');
    updateModeToggleLabel();
  } else {
    overlay.classList.add('hidden');
    document.body.classList.remove('no-scroll');
  }
}

function closeMobileNav(e) {
  const overlay = document.getElementById('mobile-nav-overlay');
  if (!overlay) return;
  if (!e || e.target === overlay) {
    overlay.classList.add('hidden');
    document.body.classList.remove('no-scroll');
  }
}

function mobileNavigate(pageId) {
  showPage(pageId);
  closeMobileNav();
}

// LocalStorage functions
function saveWords() {
  localStorage.setItem("englishWords", JSON.stringify(words));
}

function loadWords() {
  const savedWords = localStorage.getItem("englishWords");
  words = savedWords ? JSON.parse(savedWords) : [];
}

function saveStats() {
  localStorage.setItem("userStats", JSON.stringify(userStats));
}

function loadStats() {
  const savedStats = localStorage.getItem("userStats");
  userStats = savedStats
    ? JSON.parse(savedStats)
    : {
        totalTests: 0,
        correctAnswers: 0,
        totalQuestions: 0,
      };
}

// Word Management
function addWord() {
  const englishInput = document.getElementById("english-input");
  const uzbekInput = document.getElementById("uzbek-input");

  const english = englishInput.value.trim().toLowerCase();
  const uzbek = uzbekInput.value.trim().toLowerCase();

  if (!english || !uzbek) {
    alert("Iltimos, barcha maydonlarni to'ldiring!");
    return;
  }

  // Check if word already exists
  if (words.some((word) => word.english === english)) {
    alert("Bu so'z allaqachon mavjud!");
    return;
  }

  const newWord = {
    id: Date.now(),
    english: english,
    uzbek: uzbek,
    learned: false,
    correctCount: 0,
    totalAttempts: 0,
  };

  words.push(newWord);
  saveWords();

  // Clear form
  englishInput.value = "";
  uzbekInput.value = "";

  // Show success message
  alert("So'z muvaffaqiyatli qo'shildi!");

  // Update stats
  updateHomeStats();
}

// Bulk import function
function importBulkWords() {
  const bulkInput = document.getElementById("bulk-input");
  const inputText = bulkInput.value.trim();

  if (!inputText) {
    alert("Iltimos, so'zlar ro'yxatini kiriting!");
    return;
  }

  try {
    const wordsArray = JSON.parse(inputText);

    if (!Array.isArray(wordsArray)) {
      throw new Error("Ma'lumot array formatida bo'lishi kerak");
    }

    let addedCount = 0;
    let skippedCount = 0;

    wordsArray.forEach((wordData, index) => {
      // Validate word structure
      if (!wordData.english || !wordData.uzbek) {
        console.warn(
          `${index + 1}-so\'z: english va uzbek maydonlari bo\'lishi shart`
        );
        skippedCount++;
        return;
      }

      const english = wordData.english.trim().toLowerCase();
      const uzbek = wordData.uzbek.trim().toLowerCase();

      // Check if word already exists
      if (words.some((word) => word.english === english)) {
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
        totalAttempts: 0,
      };

      words.push(newWord);
      addedCount++;
    });

    if (addedCount > 0) {
      saveWords();
      updateHomeStats();
    }

    // Clear input
    bulkInput.value = "";

    // Show result message
    let message = `${addedCount} ta so\'z muvaffaqiyatli qo\'shildi!`;
    if (skippedCount > 0) {
      message += `\n${skippedCount} ta so\'z o\'tkazib yuborildi (takroriy yoki noto\'g\'ri format).`;
    }
    alert(message);
  } catch (error) {
    alert(
      'Xato: JSON format noto\'g\'ri. Iltimos, to\'g\'ri formatda kiriting.\n\nMisol: [{"english": "apple", "uzbek": "olma"}]'
    );
    console.error("JSON parse error:", error);
  }
}

// Add sample words function
function addSampleWords() {
  const sampleWords = [
    { english: "apple", uzbek: "olma" },
    { english: "book", uzbek: "kitob" },
    { english: "water", uzbek: "suv" },
    { english: "house", uzbek: "uy" },
    { english: "car", uzbek: "mashina" },
    { english: "tree", uzbek: "daraxt" },
    { english: "sun", uzbek: "quyosh" },
    { english: "moon", uzbek: "oy" },
    { english: "star", uzbek: "yulduz" },
    { english: "flower", uzbek: "gul" },
  ];

  let addedCount = 0;
  let skippedCount = 0;

  sampleWords.forEach((wordData, index) => {
    const english = wordData.english.toLowerCase();
    const uzbek = wordData.uzbek.toLowerCase();

    // Check if word already exists
    if (words.some((word) => word.english === english)) {
      skippedCount++;
      return;
    }

    const newWord = {
      id: Date.now() + index,
      english: english,
      uzbek: uzbek,
      learned: false,
      correctCount: 0,
      totalAttempts: 0,
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
  if (confirm("Haqiqatan ham bu so'zni o'chirmoqchimisiz?")) {
    words = words.filter((word) => word.id !== id);
    saveWords();
    displayWords();
    updateHomeStats();
  }
}

function displayWords() {
  const container = document.getElementById("words-container");

  if (words.length === 0) {
    container.innerHTML =
      "<p class=\"text-center\">Hozircha so'zlar yo'q. Birinchi so'zingizni qo'shing!</p>";
    return;
  }

  container.innerHTML = words
    .map(
      (word) => `
        <div class="word-item">
            <div class="word-content">
                <span class="word-english">${word.english}</span>
                <span> - </span>
                <span class="word-uzbek">${word.uzbek}</span>
                ${
                  word.learned
                    ? '<span class="learned-badge">✅ Yodlangan</span>'
                    : ""
                }
            </div>
            <button class="btn btn-danger" onclick="deleteWord(${
              word.id
            })">O'chirish</button>
        </div>
    `
    )
    .join("");
}

// Test Functions
function startTest() {
  if (words.length < 2) {
    alert("Test uchun kamida 2 ta so'z kerak!");
    return;
  }

  // Reset test state
  currentTest = [];
  currentQuestionIndex = 0;
  currentScore = 0;

  // Generate 10 random questions (or all words if less than 10)
  const testWords = [...words]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(10, words.length));
  currentTest = testWords;
  updateTestTotalsUI();

  // Show test game
  document.getElementById("test-start").classList.add("hidden");
  document.getElementById("test-game").classList.remove("hidden");
  document.getElementById("test-result").classList.add("hidden");
  testStage = 'game';
  persistTestState();

  showQuestion();
}

function showQuestion() {
  if (currentQuestionIndex >= currentTest.length) {
    endTest();
    return;
  }

  const currentWord = currentTest[currentQuestionIndex];
  const isEnUz = translationMode === 'en-uz';
  const questionText = isEnUz 
    ? `What is the meaning of "${currentWord.english}"?`
    : `"${currentWord.uzbek}" so'zining inglizchasini toping`;

  // Generate options
  const correctAnswer = isEnUz ? currentWord.uzbek : currentWord.english;
  const wrongAnswers = words
    .filter((word) => word.id !== currentWord.id)
    .map((word) => isEnUz ? word.uzbek : word.english)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const allOptions = [correctAnswer, ...wrongAnswers].sort(
    () => Math.random() - 0.5
  );

  // Update UI
  document.getElementById("current-question").textContent =
    currentQuestionIndex + 1;
  document.getElementById("current-score").textContent = currentScore;
  document.getElementById("question-text").textContent = questionText;
  updateTestTotalsUI();

  const optionsContainer = document.getElementById("options-container");
  optionsContainer.innerHTML = '';
  allOptions.forEach((option) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.addEventListener('click', () => selectAnswer(option, correctAnswer));
    optionsContainer.appendChild(btn);
  });
}

function selectAnswer(selectedAnswer, correctAnswer) {
  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach((btn) => (btn.disabled = true));

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
    buttons.forEach((btn) => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add("correct");
      }
    });
  } else {
    // Highlight correct and incorrect answers
    buttons.forEach((btn) => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add("correct");
      } else if (btn.textContent === selectedAnswer) {
        btn.classList.add("incorrect");
      }
    });
  }

  // Save updated word data
  saveWords();

  // Move to next question after delay
  setTimeout(() => {
    currentQuestionIndex++;
    persistTestState();
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

  document.getElementById("test-game").classList.add("hidden");
  document.getElementById("test-result").classList.remove("hidden");
  document.getElementById("final-score").textContent = percentage + "%";
  document.getElementById("correct-answers").textContent = currentScore;
  updateTestTotalsUI();

  updateHomeStats();
  testStage = 'result';
  persistTestState();
}

function resetTest() {
  document.getElementById("test-result").classList.add("hidden");
  document.getElementById("test-start").classList.remove("hidden");
  testStage = 'start';
  clearTestState();
}

// Practice Functions
function startPractice() {
  if (words.length === 0) {
    document.querySelector(".practice-container").innerHTML = `
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
  document.getElementById("practice-word").textContent =
    translationMode === 'en-uz' ? currentPracticeWord.english : currentPracticeWord.uzbek;
  document.getElementById("practice-input").value = "";
  document.getElementById("practice-feedback").classList.add("hidden");
  document.getElementById("practice-input").placeholder = translationMode === 'en-uz' ? "Tarjimasini yozing..." : "Write the translation...";
}

function checkPracticeAnswer() {
  const userAnswer = document
    .getElementById("practice-input")
    .value.trim()
    .toLowerCase();
  const correctAnswer = (translationMode === 'en-uz' ? currentPracticeWord.uzbek : currentPracticeWord.english).toLowerCase();
  const feedback = document.getElementById("practice-feedback");

  if (!userAnswer) {
    alert("Iltimos, javobni kiriting!");
    return;
  }

  feedback.classList.remove("hidden");

  if (userAnswer === correctAnswer) {
    feedback.textContent = "✅ To'g'ri! Ajoyib!";
    feedback.className = "feedback correct";

    // Update word statistics
    currentPracticeWord.correctCount++;
    currentPracticeWord.totalAttempts++;

    if (currentPracticeWord.correctCount >= 3) {
      currentPracticeWord.learned = true;
    }
  } else {
    const correctText = translationMode === 'en-uz' ? currentPracticeWord.uzbek : currentPracticeWord.english;
    feedback.textContent = `❌ Noto'g'ri. To'g'ri javob: ${correctText}`;
    feedback.className = "feedback incorrect";
    currentPracticeWord.totalAttempts++;
  }

  saveWords();
  updateHomeStats();
}

// --- Test state persistence ---
function persistTestState() {
  try {
    const state = {
      testStage,
      currentScore,
      currentQuestionIndex,
      translationMode,
      testWordIds: currentTest.map(w => w.id),
    };
    localStorage.setItem('testState', JSON.stringify(state));
  } catch (e) {}
}

function clearTestState() {
  localStorage.removeItem('testState');
}

function restoreTestStateIfAny() {
  try {
    const raw = localStorage.getItem('testState');
    if (!raw) return;
    const state = JSON.parse(raw);
    if (!state || !Array.isArray(state.testWordIds)) return;

    // Rebuild currentTest from saved ids
    const idSet = new Set(state.testWordIds);
    currentTest = words.filter(w => idSet.has(w.id));
    // Keep original order as per saved ids
    currentTest.sort((a, b) => state.testWordIds.indexOf(a.id) - state.testWordIds.indexOf(b.id));

    currentScore = Number(state.currentScore) || 0;
    currentQuestionIndex = Math.min(
      Math.max(Number(state.currentQuestionIndex) || 0, 0),
      Math.max(currentTest.length - 1, 0)
    );
    testStage = state.testStage || 'start';
    // Respect saved translation mode
    if (state.translationMode && (state.translationMode === 'en-uz' || state.translationMode === 'uz-en')) {
      translationMode = state.translationMode;
      localStorage.setItem('translationMode', translationMode);
      updateModeToggleLabel();
    }

    // Reflect UI based on stage
    if (testStage === 'game' && currentTest.length > 0) {
      document.getElementById("test-start").classList.add("hidden");
      document.getElementById("test-game").classList.remove("hidden");
      document.getElementById("test-result").classList.add("hidden");
      updateTestTotalsUI();
      showQuestion();
    } else if (testStage === 'result') {
      document.getElementById("test-start").classList.add("hidden");
      document.getElementById("test-game").classList.add("hidden");
      document.getElementById("test-result").classList.remove("hidden");
      const percentage = currentTest.length > 0 ? Math.round((currentScore / currentTest.length) * 100) : 0;
      document.getElementById("final-score").textContent = percentage + "%";
      document.getElementById("correct-answers").textContent = currentScore;
      updateTestTotalsUI();
    } else {
      document.getElementById("test-start").classList.remove("hidden");
      document.getElementById("test-game").classList.add("hidden");
      document.getElementById("test-result").classList.add("hidden");
    }
  } catch (e) {}
}

// Update total questions UI safely
function updateTestTotalsUI() {
  const totalEl = document.getElementById('total-questions');
  const totalResEl = document.getElementById('total-questions-result');
  const total = Array.isArray(currentTest) ? currentTest.length : 0;
  if (totalEl) totalEl.textContent = total;
  if (totalResEl) totalResEl.textContent = total;
}

// Statistics Functions
function updateHomeStats() {
  const totalWords = words.length;
  const learnedWords = words.filter((word) => word.learned).length;

  document.getElementById("total-words").textContent = totalWords;
  document.getElementById("learned-words").textContent = learnedWords;
}

// Wrong Words Functions
function getWrongWords() {
  return words.filter(word => word.totalAttempts > 0 && word.correctCount < word.totalAttempts);
}

function updateWrongWordsPage() {
  const wrongWords = getWrongWords();
  const wrongWordsCount = wrongWords.length;
  const totalAttempts = wrongWords.reduce((sum, word) => sum + word.totalAttempts, 0);
  const totalCorrect = wrongWords.reduce((sum, word) => sum + word.correctCount, 0);
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  // Update stats
  document.getElementById('wrong-words-count').textContent = wrongWordsCount;
  document.getElementById('wrong-words-accuracy').textContent = accuracy + '%';

  // Update list
  const listContainer = document.getElementById('wrong-words-list');
  if (wrongWords.length === 0) {
    listContainer.innerHTML = '<p class="text-center">Hozircha noto\'g\'ri fellelar yo\'q. Barcha so\'zlaringiz to\'g\'ri!</p>';
    return;
  }

  listContainer.innerHTML = wrongWords.map(word => {
    const wordAccuracy = word.totalAttempts > 0 ? Math.round((word.correctCount / word.totalAttempts) * 100) : 0;
    return `
      <div class="wrong-word-item">
        <div class="wrong-word-content">
          <span class="wrong-word-english">${word.english}</span>
          <span> - </span>
          <span class="wrong-word-uzbek">${word.uzbek}</span>
        </div>
        <div class="wrong-word-stats">
          <span class="wrong-word-accuracy">${wordAccuracy}%</span>
          <span>(${word.correctCount}/${word.totalAttempts})</span>
        </div>
      </div>
    `;
  }).join('');
}

function startWrongWordsTest() {
  const wrongWords = getWrongWords();
  if (wrongWords.length < 2) {
    alert('Test uchun kamida 2 ta noto\'g\'ri fellar kerak!');
    return;
  }

  // Hide list and show test
  document.getElementById('wrong-words-list').style.display = 'none';
  document.getElementById('wrong-words-test').classList.remove('hidden');
  
  // Initialize test
  currentWrongTest = [...wrongWords].sort(() => Math.random() - 0.5);
  currentWrongQuestionIndex = 0;
  currentWrongScore = 0;
  
  showWrongQuestion();
}

function showWrongQuestion() {
  if (currentWrongQuestionIndex >= currentWrongTest.length) {
    endWrongTest();
    return;
  }

  const currentWord = currentWrongTest[currentWrongQuestionIndex];
  const isEnUz = translationMode === 'en-uz';
  const questionText = isEnUz 
    ? `What is the meaning of "${currentWord.english}"?`
    : `"${currentWord.uzbek}" so'zining inglizchasini toping`;

  // Generate options
  const correctAnswer = isEnUz ? currentWord.uzbek : currentWord.english;
  const wrongAnswers = words
    .filter(word => word.id !== currentWord.id)
    .map(word => isEnUz ? word.uzbek : word.english)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const allOptions = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);

  // Update UI
  document.getElementById('wrong-test-current').textContent = currentWrongQuestionIndex + 1;
  document.getElementById('wrong-test-total').textContent = currentWrongTest.length;
  document.getElementById('wrong-test-score').textContent = currentWrongScore;
  document.getElementById('wrong-test-question').textContent = questionText;

  const optionsContainer = document.getElementById('wrong-test-options');
  optionsContainer.innerHTML = '';
  allOptions.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.addEventListener('click', () => selectWrongAnswer(option, correctAnswer));
    optionsContainer.appendChild(btn);
  });
}

function selectWrongAnswer(selectedAnswer, correctAnswer) {
  const buttons = document.querySelectorAll('#wrong-test-options .option-btn');
  buttons.forEach(btn => btn.disabled = true);

  const currentWord = currentWrongTest[currentWrongQuestionIndex];
  currentWord.totalAttempts++;

  if (selectedAnswer === correctAnswer) {
    currentWrongScore++;
    currentWord.correctCount++;
    
    if (currentWord.correctCount >= 3) {
      currentWord.learned = true;
    }

    buttons.forEach(btn => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add('correct');
      }
    });
  } else {
    buttons.forEach(btn => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add('correct');
      } else if (btn.textContent === selectedAnswer) {
        btn.classList.add('incorrect');
      }
    });
  }

  saveWords();

  setTimeout(() => {
    currentWrongQuestionIndex++;
    showWrongQuestion();
  }, 1500);
}

function endWrongTest() {
  const percentage = Math.round((currentWrongScore / currentWrongTest.length) * 100);
  
  alert(`Test yakunlandi! Siz ${currentWrongScore}/${currentWrongTest.length} ta savolga to'g'ri javob berdingiz (${percentage}%)`);
  
  exitWrongWordsTest();
}

function exitWrongWordsTest() {
  document.getElementById('wrong-words-test').classList.add('hidden');
  document.getElementById('wrong-words-list').style.display = 'block';
  updateWrongWordsPage();
}

function startWrongWordsPractice() {
  const wrongWords = getWrongWords();
  if (wrongWords.length === 0) {
    alert('Mashq qilish uchun noto\'g\'ri fellelar yo\'q!');
    return;
  }

  // Hide list and show practice
  document.getElementById('wrong-words-list').style.display = 'none';
  document.getElementById('wrong-words-practice').classList.remove('hidden');
  
  currentWrongPracticeWords = [...wrongWords];
  nextWrongPracticeWord();
}

function nextWrongPracticeWord() {
  if (currentWrongPracticeWords.length === 0) {
    alert('Barcha noto\'g\'ri fellelar bilan mashq qildingiz!');
    exitWrongWordsPractice();
    return;
  }

  const randomIndex = Math.floor(Math.random() * currentWrongPracticeWords.length);
  currentWrongPracticeWord = currentWrongPracticeWords[randomIndex];
  
  document.getElementById('wrong-practice-word').textContent = 
    translationMode === 'en-uz' ? currentWrongPracticeWord.english : currentWrongPracticeWord.uzbek;
  document.getElementById('wrong-practice-input').value = '';
  document.getElementById('wrong-practice-feedback').classList.add('hidden');
}

function checkWrongPracticeAnswer() {
  const userAnswer = document.getElementById('wrong-practice-input').value.trim().toLowerCase();
  const correctAnswer = (translationMode === 'en-uz' ? currentWrongPracticeWord.uzbek : currentWrongPracticeWord.english).toLowerCase();
  const feedback = document.getElementById('wrong-practice-feedback');

  if (!userAnswer) {
    alert('Iltimos, javobni kiriting!');
    return;
  }

  feedback.classList.remove('hidden');
  currentWrongPracticeWord.totalAttempts++;

  if (userAnswer === correctAnswer) {
    feedback.textContent = '✅ To\'g\'ri! Ajoyib!';
    feedback.className = 'feedback correct';
    currentWrongPracticeWord.correctCount++;
    
    if (currentWrongPracticeWord.correctCount >= 3) {
      currentWrongPracticeWord.learned = true;
    }

    // Remove from practice list if learned
    if (currentWrongPracticeWord.learned) {
      currentWrongPracticeWords = currentWrongPracticeWords.filter(w => w.id !== currentWrongPracticeWord.id);
    }
  } else {
    const correctText = translationMode === 'en-uz' ? currentWrongPracticeWord.uzbek : currentWrongPracticeWord.english;
    feedback.textContent = `❌ Noto'g'ri. To'g'ri javob: ${correctText}`;
    feedback.className = 'feedback incorrect';
  }

  saveWords();
}

function exitWrongWordsPractice() {
  document.getElementById('wrong-words-practice').classList.add('hidden');
  document.getElementById('wrong-words-list').style.display = 'block';
  updateWrongWordsPage();
}

function resetWrongWordsProgress() {
  if (confirm('Haqiqatan ham barcha so\'zlarning progressini qayta boshlashni xohlaysizmi? Bu amalni qaytarib bo\'lmaydi.')) {
    words.forEach(word => {
      word.learned = false;
      word.correctCount = 0;
      word.totalAttempts = 0;
    });
    saveWords();
    updateWrongWordsPage();
    updateHomeStats();
    alert('Progress muvaffaqiyatli qayta boshlandi!');
  }
}

function updateStatistics() {
  const totalWords = words.length;
  const learnedWords = words.filter((word) => word.learned).length;
  const learnedPercentage =
    totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;
  const accuracy =
    userStats.totalQuestions > 0
      ? Math.round((userStats.correctAnswers / userStats.totalQuestions) * 100)
      : 0;

  // Update progress bar
  document.getElementById("progress-fill").style.width =
    learnedPercentage + "%";
  document.getElementById("learned-percentage").textContent = learnedPercentage;

  // Update stats
  document.getElementById("stats-total").textContent = totalWords;
  document.getElementById("stats-learned").textContent = learnedWords;
  document.getElementById("stats-accuracy").textContent = accuracy + "%";
}
