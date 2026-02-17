// Timer State
let timerState = {
    isRunning: false,
    isPaused: false,
    totalSeconds: 0,
    elapsedSeconds: 0,
    primaryWarningSeconds: 0,
    secondaryWarningSeconds: 0,
    qaSeconds: 0,
    qaSecondsDuration: 0, // Store original QA duration
    stage: 'setup', // setup, talk, qa, end
    currentWarning: null, // null, primary, secondary, end
    warningAnnounced: {} // Track which warnings have been announced
};

// Audio Context for sound generation
let audioContext;

// Initialize audio context
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

// Play warning sound (beep)
function playWarningSound() {
    initAudioContext();
    const now = audioContext.currentTime;
    const duration = 0.3;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.8, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
}

// Play end warning sound
function playEndWarning() {
    initAudioContext();
    const now = audioContext.currentTime;
    const duration = 0.5;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(600, now);
    oscillator.frequency.linearRampToValueAtTime(400, now + duration);
    
    gainNode.gain.setValueAtTime(0.8, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
}

// Speak text using Web Speech API
function speakText(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        speechSynthesis.speak(utterance);
    }
}

// Format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Get screen element
function getScreen(screenName) {
    return document.getElementById(screenName);
}

// Switch screen
function switchScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    getScreen(screenName).classList.add('active');
}

// Update timer display
function updateDisplay() {
    const timeDisplay = document.getElementById('timeDisplay');
    const statusInfo = document.getElementById('statusInfo');
    const elapsedTime = document.getElementById('elapsedTime');
    const progressFill = document.getElementById('progressFill');
    const timerContainer = document.querySelector('.timer-display');
    
    const remainingSeconds = timerState.totalSeconds - timerState.elapsedSeconds;
    timeDisplay.textContent = formatTime(Math.max(0, remainingSeconds));
    elapsedTime.textContent = formatTime(timerState.elapsedSeconds);
    
    const progress = (timerState.elapsedSeconds / timerState.totalSeconds) * 100;
    progressFill.style.width = progress + '%';
    
    // Status message
    if (timerState.isRunning && !timerState.isPaused) {
        statusInfo.textContent = '▶️ Running...';
    } else if (timerState.isPaused) {
        statusInfo.textContent = '⏸️ Paused';
    } else {
        statusInfo.textContent = '⏹️ Stopped';
    }
    
    // Update warning state
    timerContainer.classList.remove('warning-primary', 'warning-secondary', 'warning-end');
    
    if (remainingSeconds <= 0) {
        timerContainer.classList.add('warning-end');
        timerState.currentWarning = 'end';
    } else if (remainingSeconds <= timerState.secondaryWarningSeconds * 60) {
        timerContainer.classList.add('warning-secondary');
        timerState.currentWarning = 'secondary';
    } else if (remainingSeconds <= timerState.primaryWarningSeconds * 60) {
        timerContainer.classList.add('warning-primary');
        timerState.currentWarning = 'primary';
    } else {
        timerState.currentWarning = null;
    }
}

// Update Q&A display
function updateQADisplay() {
    const qaTimerDisplay = document.getElementById('qaTimerDisplay');
    const qaContainer = document.querySelector('.qa-container');
    
    qaTimerDisplay.textContent = formatTime(Math.max(0, timerState.qaSeconds));
    
    qaContainer.classList.remove('qa-warning');
    if (timerState.qaSeconds <= 30) {
        qaContainer.classList.add('qa-warning');
    }
}

// Main timer loop
let timerInterval = null;

function startTimer() {
    // Reset running state to ensure interval is created
    timerState.isRunning = false;
    timerState.isPaused = false;
    timerState.isRunning = true;
    
    let lastWarning = null;
    
    timerInterval = setInterval(() => {
        if (timerState.isPaused) return;
        
        if (timerState.stage === 'talk') {
            timerState.elapsedSeconds++;
            const remainingSeconds = timerState.totalSeconds - timerState.elapsedSeconds;
            
            // Track which warnings have been announced
            if (!timerState.warningAnnounced) {
                timerState.warningAnnounced = {};
            }
            
            // Check for warning transitions - only announce once per warning
            if (remainingSeconds === timerState.secondaryWarningSeconds * 60 && !timerState.warningAnnounced.secondary) {
                playWarningSound();
                speakText(`${timerState.secondaryWarningSeconds} minutes remaining`);
                timerState.warningAnnounced.secondary = true;
            } else if (remainingSeconds === timerState.primaryWarningSeconds * 60 && !timerState.warningAnnounced.primary) {
                playWarningSound();
                speakText(`${timerState.primaryWarningSeconds} minutes remaining`);
                timerState.warningAnnounced.primary = true;
            } else if (remainingSeconds <= 0) {
                clearInterval(timerInterval);
                timerState.totalSeconds = timerState.elapsedSeconds;
                playEndWarning();
                speakText('Time is up');
                startQAPhase();
                return;
            } else if (remainingSeconds > 0 && remainingSeconds % 5 === 0 && timerState.currentWarning === 'secondary') {
                if (remainingSeconds !== lastWarning) {
                    playEndWarning();
                    lastWarning = remainingSeconds;
                }
            }
            
            updateDisplay();
        } else if (timerState.stage === 'qa') {
            timerState.qaSeconds--;
            
            if (timerState.qaSeconds <= 10 && timerState.qaSeconds > 0 && timerState.qaSeconds % 2 === 0) {
                playEndWarning();
            }
            
            if (timerState.qaSeconds <= 0) {
                clearInterval(timerInterval);
                timerState.qaSeconds = 0;
                speakText('Please take it offline');
                playEndWarning();
                setTimeout(() => {
                    showEndScreen();
                }, 1000);
                return;
            }
            
            updateQADisplay();
        }
    }, 1000);
}

function pauseTimer() {
    timerState.isPaused = !timerState.isPaused;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.textContent = timerState.isPaused ? 'Resume' : 'Pause';
    updateDisplay();
}

function resetTimer() {
    clearInterval(timerInterval);
    timerState = {
        isRunning: false,
        isPaused: false,
        totalSeconds: 0,
        elapsedSeconds: 0,
        primaryWarningSeconds: 0,
        secondaryWarningSeconds: 0,
        qaSeconds: 0,
        qaSecondsDuration: 0,
        stage: 'setup',
        currentWarning: null,
        warningAnnounced: {}
    };
    switchScreen('setupScreen');
    document.getElementById('pauseBtn').textContent = 'Pause';
}

function startQAPhase() {
    timerState.stage = 'qa';
    // qaSeconds is already in seconds from start button, don't multiply again
    timerState.qaSecondsDuration = timerState.qaSeconds; // Store original duration for reference
    timerState.warningAnnounced = {}; // Reset warning announcements for QA
    switchScreen('qaScreen');
    updateQADisplay();
    startTimer();
}

// Event Listeners
document.getElementById('startBtn').addEventListener('click', () => {
    const talkDuration = parseFloat(document.getElementById('talkDuration').value);
    const primaryWarning = parseFloat(document.getElementById('primaryWarning').value);
    const secondaryWarning = parseFloat(document.getElementById('secondaryWarning').value);
    const qaTime = parseFloat(document.getElementById('qaTime').value);
    
    // Validation
    if (talkDuration <= 0) {
        alert('Talk duration must be greater than 0!');
        return;
    }
    if (primaryWarning <= 0) {
        alert('Primary warning must be greater than 0!');
        return;
    }
    if (secondaryWarning <= 0) {
        alert('Secondary warning must be greater than 0!');
        return;
    }
    if (secondaryWarning >= primaryWarning) {
        alert('Secondary warning must be less than primary warning!');
        return;
    }
    
    timerState.totalSeconds = talkDuration * 60;
    timerState.primaryWarningSeconds = primaryWarning;
    timerState.secondaryWarningSeconds = secondaryWarning;
    timerState.qaSeconds = qaTime * 60; // Store as seconds, will convert on QA start
    timerState.stage = 'talk';
    timerState.elapsedSeconds = 0;
    timerState.currentWarning = null;
    
    document.getElementById('totalTime').textContent = formatTime(timerState.totalSeconds);
    
    switchScreen('timerScreen');
    updateDisplay();
    startTimer();
});

document.getElementById('pauseBtn').addEventListener('click', pauseTimer);

document.getElementById('doneBtn').addEventListener('click', () => {
    const remainingTalkSeconds = timerState.totalSeconds - timerState.elapsedSeconds;
    timerState.qaSeconds += remainingTalkSeconds;
    clearInterval(timerInterval);
    startQAPhase();
});

document.getElementById('closeTalkBtn').addEventListener('click', () => {
    clearInterval(timerInterval);
    resetTimer();
});

document.getElementById('endTalkQABtn').addEventListener('click', () => {
    clearInterval(timerInterval);
    resetTimer();
});

document.getElementById('newSessionBtn').addEventListener('click', resetTimer);

// Easter Eggs
let easterEggClicks = 0;
let easterEggTimer = null;

document.getElementById('easterEggTrigger').addEventListener('click', () => {
    easterEggClicks++;
    
    clearTimeout(easterEggTimer);
    easterEggTimer = setTimeout(() => {
        easterEggClicks = 0;
    }, 2000);
    
    if (easterEggClicks === 1) {
        const randomEasterEgg = Math.floor(Math.random() * 5);
        let content = '';
        
        switch(randomEasterEgg) {
            case 0:
                content = `
                    <p>🎪 Why did the timer go to the conference?</p>
                    <p>It wanted to <strong>count on</strong> a great presentation! ⏱️</p>
                `;
                break;
            case 1:
                content = `
                    <p>🚀 You've unlocked the Secret Mode!</p>
                    <p>Hint: Presentations are like rockets... they must have a <strong>launch time</strong>! 🎯</p>
                `;
                break;
            case 2:
                content = `
                    <div style="font-size: 3em;">🎬</div>
                    <p>Directors don't look at watches...</p>
                    <p>They have CONFERENCE TIMERS! 🎞️</p>
                `;
                break;
            case 3:
                content = `
                    <p>💡 Did you know?</p>
                    <p>The best presenters always have <strong>time to shine</strong>! ✨</p>
                    <p style="margin-top: 15px; font-size: 0.9em; color: #999;">This timer helps you do just that!</p>
                `;
                break;
            case 4:
                content = `
                    <div style="font-size: 2em; margin-bottom: 10px;">🏆</div>
                    <p>Congratulations! You've discovered the</p>
                    <p><strong>Random Wisdom Feature</strong></p>
                    <p style="margin-top: 15px; font-size: 1.2em;">🎟️ Time flies when you're having fun! 🎟️</p>
                `;
                break;
        }
        
        document.getElementById('easterEggContent').innerHTML = content;
        document.getElementById('easterEggModal').style.display = 'block';
        
        // Play a fun sound
        initAudioContext();
        const now = audioContext.currentTime;
        for (let i = 0; i < 3; i++) {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.value = 400 + (i * 200);
            gain.gain.setValueAtTime(0.1, now + i * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.2);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.2);
        }
        
        easterEggClicks = 0;
    }
});

// Modal close functionality
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
        e.target.closest('.modal').style.display = 'none';
    });
});

window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        if (timerState.stage === 'talk' && timerState.isRunning) {
            pauseTimer();
        } else if (timerState.stage === 'talk') {
            startTimer();
        }
    }
    
    if (event.code === 'Escape' && (timerState.stage === 'talk' || timerState.stage === 'qa')) {
        resetTimer();
    }
});

// Function to show end screen
function showEndScreen() {
    document.getElementById('endMessage').textContent = '⏹️ PLEASE TAKE IT OFFLINE';
    switchScreen('endScreen');
    timerState.stage = 'end';
}

// Prevent context menu on easter egg trigger
document.getElementById('easterEggTrigger').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    playWarningSound();
});

// Initialize
console.log('Conference Timer Ready! 🎤');
console.log('Keyboard Shortcuts: SPACE = Pause/Resume, ESC = Close Talk');
