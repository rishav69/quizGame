let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;

function showScreen(screenClass) {
    document.querySelectorAll('.setup-screen, .quiz-screen, .results-screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.querySelector(`.${screenClass}`).classList.add('active');
}

function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

async function startQuiz() {
    const category = document.getElementById('category').value;
    const difficulty = document.getElementById('difficulty').value;
    const amount = document.getElementById('amount').value;

    showLoading(true);

    try {
        let apiUrl = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
        if (category) apiUrl += `&category=${category}`;
        if (difficulty) apiUrl += `&difficulty=${difficulty}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.response_code !== 0) {
            throw new Error('Failed to fetch questions. Please try different settings.');
        }

        quizData = data.results.map(q => ({
            question: decodeHTML(q.question),
            correct: decodeHTML(q.correct_answer),
            options: shuffleArray([
                ...q.incorrect_answers.map(decodeHTML),
                decodeHTML(q.correct_answer)
            ])
        }));

        currentQuestionIndex = 0;
        score = 0;
        selectedAnswer = null;

        showLoading(false);
        showScreen('quiz-screen');
        displayQuestion();

    } catch (error) {
        showLoading(false);
        showError(error.message);
    }
}

function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function displayQuestion() {
    const question = quizData[currentQuestionIndex];

    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    document.getElementById('total-questions').textContent = quizData.length;
    document.getElementById('current-score').textContent = score;
    document.getElementById('question-text').textContent = question.question;

    const progress = ((currentQuestionIndex) / quizData.length) * 100;
    document.getElementById('progress').style.width = progress + '%';

    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';

    question.options.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => selectOption(optionDiv, option);
        optionsContainer.appendChild(optionDiv);
    });

    document.getElementById('next-btn').style.display = 'none';
    selectedAnswer = null;
}

function selectOption(optionElement, answer) {
    if (selectedAnswer !== null) return;

    selectedAnswer = answer;
    const question = quizData[currentQuestionIndex];

    document.querySelectorAll('.option').forEach(opt => {
        opt.onclick = null;
        if (opt.textContent === question.correct) {
            opt.classList.add('correct');
        } else if (opt === optionElement && opt.textContent !== question.correct) {
            opt.classList.add('incorrect');
        }
    });

    if (answer === question.correct) {
        score++;
        document.getElementById('current-score').textContent = score;
    }

    setTimeout(() => {
        document.getElementById('next-btn').style.display = 'block';
    }, 1000);
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        displayQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    const percentage = Math.round((score / quizData.length) * 100);
    document.getElementById('final-score').textContent = `${score}/${quizData.length}`;

    let message = '';
    if (percentage >= 90) {
        message = '🏆 Outstanding! You\'re a quiz master!';
    } else if (percentage >= 70) {
        message = '🎯 Great job! Well done!';
    } else if (percentage >= 50) {
        message = '👍 Not bad! Keep practicing!';
    } else {
        message = '📚 Better luck next time! Keep learning!';
    }

    document.getElementById('result-message').textContent = message;
    showScreen('results-screen');
}

function restartQuiz() {
    quizData = [];
    currentQuestionIndex = 0;
    score = 0;
    selectedAnswer = null;
    showScreen('setup-screen');
}

document.addEventListener('DOMContentLoaded', () => {
    showScreen('setup-screen');
});