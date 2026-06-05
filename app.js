// --- État global / initialisation ---
let score = 0, progress = 0, currentDico, currentQuestion, currentQuestionAnswer, currentQuestionIndex = 0, timer = 0;

// Catégorie sélectionnée par l'utilisateur (sauvegardée dans localStorage)
let selectedCategory = localStorage.getItem("selectedCategory") || "all";

// Statistiques par catégorie (good/bad), conservées en localStorage
let categoryStats = JSON.parse(localStorage.getItem("categoryStats")) || {};
let unlockedBadges = JSON.parse(localStorage.getItem("unlockedBadges")) || [];

// Statistiques par mot du dictionnaire (nombre de bonnes réponses)
let wordStats = JSON.parse(localStorage.getItem("wordStats")) || {};

// Statistiques par question (nombre de bonnes réponses)
let questionStats = JSON.parse(localStorage.getItem("questionStats")) || {};

// État du puzzle: mots mélangés et sélections en cours
let puzzleWords = [];
let puzzleSelectedIndices = [];
let puzzleGoalLength = 0;
let oralRecognition = null;
let oralListening = false;

// Seuil de tolérance pour la reconnaissance vocale (0.0 = très laxiste, 1.0 = strictement exact)
const speechRecognitionTolerance = 0.65;

// Liste des catégories disponibles, dérivée des mots du dictionnaire (défini dans data.js)
const categories = [...new Set(dictionaryWords.map(word => word.cat))].sort();

// Initialise les entrées de categoryStats pour éviter les références undefined
startCategories();

function startCategories(){
    // S'assure que chaque catégorie possède un objet de statistiques {good, bad}
    for(const category of categories){
        if(!categoryStats[category]){
            categoryStats[category] = { good: 0, bad: 0 };
        }
    }
}

// Utilise l'API Web Speech pour prononcer un texte en anglais
function speak(t, callback){
    let u = new SpeechSynthesisUtterance(t);
    u.lang = 'en-GB';
    u.onend = () => {if(callback){callback();}};
    speechSynthesis.speak(u);
}

function normalizeText(text){
    return text
        .toLowerCase()
        .trim()
        .replace(/[.,!?;:'"()\-]/g, '')
        .replace(/\s+/g, ' ');
}

function similarity(a, b){
    const [shorter, longer] = a.length < b.length ? [a, b] : [b, a];
    const longerLength = longer.length;
    if(longerLength === 0){
        return 1;
    }
    const distance = levenshteinDistance(shorter, longer);
    return (longerLength - distance) / longerLength;
}

function levenshteinDistance(a, b){
    const matrix = [];
    for(let i = 0; i <= b.length; i++){
        matrix[i] = [i];
    }
    for(let j = 0; j <= a.length; j++){
        matrix[0][j] = j;
    }
    for(let i = 1; i <= b.length; i++){
        for(let j = 1; j <= a.length; j++){
            if(b.charAt(i-1) === a.charAt(j-1)){
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i-1][j] + 1,
                    matrix[i][j-1] + 1,
                    matrix[i-1][j-1] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

function isSpeechMatch(answer, expected){
    if(answer === expected){
        return true;
    }
    if(answer.includes(expected) || expected.includes(answer)){
        return true;
    }
    return similarity(answer, expected) >= speechRecognitionTolerance;
}

// Utilise l'API Web Speech pour prononcer un texte en anglais
function speakfr(t, callback){
    let u = new SpeechSynthesisUtterance(t);
    u.lang = "fr-FR";
    u.onend = () => {if(callback){callback();}};
    speechSynthesis.speak(u);
}

// Met à jour l'affichage du score et de la barre de progression
function update(){
    document.getElementById("score").innerHTML = "⭐ Score : " + score;
    document.getElementById("progress").style.width = progress + "%";
}

// Mélange un tableau (façon simple, non cryptographique)
function shuffle(a){
    return a.sort(() => Math.random() - 0.5);
}

// --- Dictionnaire interactif (choix de traduction) ---
function startDictionary(){
    // Choisit la liste de mots selon la catégorie sélectionnée
    const availableWords = selectedCategory === "all" ? dictionaryWords : dictionaryWords.filter(x => x.cat === selectedCategory);

    // Sélectionne le mot avec le moins de bonnes réponses enregistrées
    const minCorrect = Math.min(...availableWords.map(w => wordStats[w.word] || 0));
    const candidates = availableWords.filter(w => (wordStats[w.word] || 0) === minCorrect);
    currentDico = candidates[Math.floor(Math.random() * candidates.length)];

    // Prononce le mot pour l'exercice oral
    speak(currentDico.word);

    // SourceWords sert à générer des réponses incorrectes plausibles
    const sourceWords = selectedCategory === "all" ? dictionaryWords : dictionaryWords.filter(x => x.cat === selectedCategory);
    const wrongAnswers = sourceWords
        .filter(x => x.fr !== currentDico.fr)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(x => x.fr);

    // Mélange la bonne réponse avec trois mauvaises
    let answers = shuffle([currentDico.fr, ...wrongAnswers]);

    // Construit l'UI de la question (sélecteur de catégorie, boutons audio, etc.)
    question.innerHTML = `<div style="margin-bottom:15px;">
        <select id="categorySelect" onchange="changeCategory(this.value)">
        <option value="all">Toutes les catégories</option>
        ${categories.map(cat => `<option value="${cat}"${cat === selectedCategory ? "selected" : ""}>${cat}</option>`).join("")}
        </select></div>
        🎧 Listen
        <button class="speak" onclick="speak('${currentDico.word}')">🔊</button>
        <button onclick="toggleWord()">👀</button>
        <div id="hiddenWord" style="display:none;margin-top:10px;"><b>${currentDico.word}</b></div>`;

    // Insère les boutons de réponse dans l'élément #answers
    document.getElementById('answers').innerHTML = answers.map(a => `<button onclick="checkDico('${a.replace(/'/g,'')}')">${a}</button><br>`).join('');
}

// Change la catégorie et relance l'exercice
function changeCategory(category){
    selectedCategory = category;
    localStorage.setItem("selectedCategory", category);
    startDictionary();
}

// Vérifie la réponse choisie pour l'exercice dictionnaire
function checkDico(answer){
    const isCorrect = answer === currentDico.fr;
    result.innerHTML = (isCorrect) ? '✅ Correct' : '❌ Wrong';

    // Enregistre la réponse dans les statistiques de la catégorie
    recordAnswer(currentDico.cat, isCorrect);

    // Enregistre le nombre de bonnes réponses pour ce mot
    if(isCorrect){
        wordStats[currentDico.word] = (wordStats[currentDico.word] || 0) + 1;
        localStorage.setItem("wordStats", JSON.stringify(wordStats));
        playSuccessSound();
        score += 10;
        progress = Math.min(progress + 5, 100);
    } else {
        playErrorSound();
    }

    update();
    setTimeout(startDictionary, 1200);
}

// --- Questions à choisir parmi des réponses correctes d'autres questions ---
function pickRandomLeastCorrectQuestion(){
    const questionCounts = dictionaryQuestions.map((q, i) => ({
        question: q,
        index: i,
        count: Number(questionStats[i]) || 0
    }));
    const minCorrect = Math.min(...questionCounts.map(item => item.count));
    const candidates = questionCounts.filter(item => item.count === minCorrect);
    return candidates[Math.floor(Math.random() * candidates.length)];
}

function startQuestions(){
    nextQuestion();
}

function nextQuestion(){
    const selectedItem = pickRandomLeastCorrectQuestion();
    currentQuestion = selectedItem.question;
    currentQuestionIndex = selectedItem.index;
    currentQuestionAnswer = currentQuestion.answers[Math.floor(Math.random() * currentQuestion.answers.length)];
    
    // Prononce le mot pour l'exercice oral
    speak(currentQuestion.question);

    // Récupère des réponses des autres questions pour créer de fausses réponses
    const wrongPool = dictionaryQuestions
        .filter((q, i) => i !== currentQuestionIndex && q.answers && q.answers.length > 0)
        .flatMap(q => q.answers)
        .filter(answer => answer !== currentQuestionAnswer);

    // Déduplique pour éviter d'avoir plusieurs fois la même mauvaise réponse
    const uniqueWrongPool = [...new Set(wrongPool)];
    const wrongAnswers = shuffle(uniqueWrongPool).slice(0, 3);
    const answers = shuffle([currentQuestionAnswer, ...wrongAnswers]);

    question.innerHTML = currentQuestion.question + ` <button onclick="speak('${currentQuestion.question}')">🔊</button>`;
    document.getElementById('answers').innerHTML = answers.map(a => `<button onclick="checkQuestion('${a.replace(/'/g, "\\'")}')">${a}</button><br>`).join('');
}

function checkQuestion(userAnswer){
    const isCorrect = userAnswer === currentQuestionAnswer;
    result.innerHTML = isCorrect ? '✅ Correct' : '❌ Wrong';

    timer = 0;
    if(isCorrect){
        // Enregistre le nombre de bonnes réponses pour cette question
        questionStats[currentQuestionIndex] = (questionStats[currentQuestionIndex] || 0) + 1;
        localStorage.setItem("questionStats", JSON.stringify(questionStats));
        playSuccessSound();
        score += 10;
        progress = Math.min(progress + 5, 100);
        speak(currentQuestionAnswer);
        timer = 2500;
    } else {
        playErrorSound();
        speakfr("La bonne réponse était: ", () => speak(currentQuestionAnswer));
        timer = 4000;
    }

    update();
    setTimeout(nextQuestion, timer);
}

// --- Puzzle : remettre les mots d'une réponse dans l'ordre ---
function startPuzzle(){
    nextPuzzle(false);
}

function startPuzzlePlus(){
    nextPuzzle(true);
}

function startOral(){
    nextOral();
}

function nextOral(){
    const selectedItem = pickRandomLeastCorrectQuestion();
    currentQuestion = selectedItem.question;
    currentQuestionIndex = selectedItem.index;
    currentQuestionAnswer = currentQuestion.answers[Math.floor(Math.random() * currentQuestion.answers.length)];

    speak(currentQuestion.question);
    question.innerHTML = currentQuestion.question + ` <button onclick="speak('${currentQuestion.question}')">🔊</button>`;
    renderOral();
}

function renderOral(){
    const supported = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!supported){
        document.getElementById('answers').innerHTML = '<p>Speech recognition not supported in this browser.</p>';
        return;
    }

    document.getElementById('answers').innerHTML = `
        <p>🎙️ Cliquez sur le micro et dites: <br/><b>${currentQuestionAnswer}</b></p>
        <button onclick="toggleOralListening()">${oralListening ? '⏹️ Stop' : '🎤 Démarrer l\'écoute'}</button>
        <div id="oralHint" style="margin-top:10px; color:#555;"></div>`;
}

function getOralRecognition(){
    if(oralRecognition){
        return oralRecognition;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRecognition){
        return null;
    }

    oralRecognition = new SpeechRecognition();
    oralRecognition.lang = 'en-US';
    oralRecognition.interimResults = false;
    oralRecognition.maxAlternatives = 1;
    oralRecognition.continuous = false;

    oralRecognition.onresult = event => {
        const transcript = event.results[0][0].transcript;
        const normalized = normalizeText(transcript);
        const expected = normalizeText(currentQuestionAnswer);
        document.getElementById('oralHint').textContent = `Vous avez dit : ${transcript}`;
        checkOralAnswer(normalized, expected);
    };

    oralRecognition.onerror = event => {
        document.getElementById('oralHint').textContent = `Erreur reconnaissance : ${event.error}`;
        oralListening = false;
        renderOral();
    };

    oralRecognition.onend = () => {
        oralListening = false;
        renderOral();
    };

    return oralRecognition;
}

function toggleOralListening(){
    const recognition = getOralRecognition();
    if(!recognition){
        alert('Speech recognition non supportée.');
        return;
    }
    if(oralListening){
        recognition.stop();
        oralListening = false;
        renderOral();
        return;
    }
    oralListening = true;
    renderOral();
    recognition.start();
}

function checkOralAnswer(normalizedAnswer, normalizedExpected){
    const isCorrect = isSpeechMatch(normalizedAnswer, normalizedExpected);
    result.innerHTML = isCorrect ? '✅ Correct' : '❌ Wrong';
    oralListening = false;

    timer = 0;
    if(isCorrect){
        questionStats[currentQuestionIndex] = (questionStats[currentQuestionIndex] || 0) + 1;
        localStorage.setItem('questionStats', JSON.stringify(questionStats));
        playSuccessSound();
        score += 10;
        progress = Math.min(progress + 5, 100);
        speak(currentQuestionAnswer);
        timer = 2500;
    } else {
        playErrorSound();
        speakfr('La bonne réponse était: ', () => speak(currentQuestionAnswer));
        timer = 4000;
    }

    update();
    setTimeout(nextOral, timer);
}

function nextPuzzle(withExtraWords){
    const selectedItem = pickRandomLeastCorrectQuestion();
    currentQuestion = selectedItem.question;
    currentQuestionIndex = selectedItem.index;
    currentQuestionAnswer = currentQuestion.answers[Math.floor(Math.random() * currentQuestion.answers.length)];

    // Prononce le mot pour l'exercice oral
    speak(currentQuestion.question);

    // Prépare les mots mélangés du puzzle
    const originalWords = currentQuestionAnswer.split(' ');
    puzzleGoalLength = originalWords.length;
    puzzleWords = shuffle([...originalWords]);

    if(withExtraWords){
        const extraWords = dictionaryQuestions
            .filter((q, i) => i !== currentQuestionIndex && q.answers && q.answers.length > 0)
            .flatMap(q => q.answers)
            .flatMap(answer => answer.split(' '))
            .filter(word => !originalWords.includes(word));

        const uniqueExtraWords = [...new Set(extraWords)];
        const extraSelection = shuffle(uniqueExtraWords).slice(0, Math.min(3, uniqueExtraWords.length));
        puzzleWords = shuffle([...originalWords, ...extraSelection]);
    }

    while(puzzleWords.join(' ') === currentQuestionAnswer && puzzleWords.length > 1){
        puzzleWords = shuffle([...puzzleWords]);
    }
    puzzleSelectedIndices = [];

    question.innerHTML = currentQuestion.question + ` <button onclick="speak('${currentQuestion.question}')">🔊</button>`;
    renderPuzzle();
}

function renderPuzzle(){
    const selectedAnswer = puzzleSelectedIndices.map(i => puzzleWords[i]).join(' ');
    const buttons = puzzleWords.map((word, i) => `
        <button onclick="choosePuzzleWord(${i})">${word}</button>`).join('');

    document.getElementById('answers').innerHTML = `
        <div><strong>Réponse :</strong> ${selectedAnswer || '<em>Choisis les mots</em>'}</div>
        <div class="puzzle-words">${buttons}</div>
        <div style="margin-top:10px;"><button onclick="resetPuzzle()">🔄 Réinitialiser</button></div>`;
}

function choosePuzzleWord(index){
    const word = puzzleWords[index];
    speak(word);

    const existingIndex = puzzleSelectedIndices.indexOf(index);
    if(existingIndex !== -1){
        puzzleSelectedIndices.splice(existingIndex, 1);
    } else {
        puzzleSelectedIndices.push(index);
    }

    renderPuzzle();

    if(puzzleSelectedIndices.length === puzzleGoalLength){
        setTimeout(checkPuzzleAnswer, 300);
    }
}

function resetPuzzle(){
    puzzleSelectedIndices = [];
    renderPuzzle();
}

function checkPuzzleAnswer(){
    const userAnswer = puzzleSelectedIndices.map(i => puzzleWords[i]).join(' ');
    const isCorrect = userAnswer === currentQuestionAnswer;
    result.innerHTML = isCorrect ? '✅ Correct' : '❌ Wrong';

    timer = 0;
    if(isCorrect){
        questionStats[currentQuestionIndex] = (questionStats[currentQuestionIndex] || 0) + 1;
        localStorage.setItem("questionStats", JSON.stringify(questionStats));
        playSuccessSound();
        score += 10;
        progress = Math.min(progress + 5, 100);
        speak(currentQuestionAnswer);
        timer = 2500;
    } else {
        playErrorSound();
        speakfr("La bonne réponse était: ", () => speak(currentQuestionAnswer));
        timer = 4000;
    }

    update();
    setTimeout(nextPuzzle, timer);
}

// --- Sons de feedback ---
function playSuccessSound(){
    // Génère un court son montant pour indiquer une réponse correcte
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.frequency.value = 880;
    gain.gain.value = 0.1;

    oscillator.start();
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(1320, audioContext.currentTime + 0.2);
    oscillator.stop(audioContext.currentTime + 0.2);
}

function playErrorSound(){
    // Génère un court son descendant pour indiquer une erreur
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.frequency.value = 300;
    gain.gain.value = 0.1;

    oscillator.start();
    oscillator.frequency.linearRampToValueAtTime(150, audioContext.currentTime + 0.3);
    oscillator.stop(audioContext.currentTime + 0.3);
}

function playBadgeSound(){
    // Joue une petite mélodie lors du déblocage d'un badge
    const ctx = new AudioContext();
    const notes = [523, 659, 784, 1047];

    notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        gain.gain.value = 0.08;
        osc.start(ctx.currentTime + index * 0.12);
        osc.stop(ctx.currentTime + index * 0.12 + 0.15);
    });
}

// Affiche ou masque le mot caché en dictionnaire
function toggleWord(){
    const hiddenWord = document.getElementById("hiddenWord");
    if(hiddenWord){
        hiddenWord.style.display = hiddenWord.style.display === "none" ? "block" : "none";
    }
}

// --- Enregistrement des réponses et badges ---
function recordAnswer(category, isCorrect){
    // Garantit l'existence de l'entrée categoryStats
    if(!categoryStats[category]){
        categoryStats[category] = { good: 0, bad: 0 };
    }

    if(isCorrect){
        categoryStats[category].good++;
    } else {
        categoryStats[category].bad++;
    }

    // Sauvegarde et mise à jour des badges
    localStorage.setItem("categoryStats", JSON.stringify(categoryStats));
    updateBadges();
}

function updateBadges(){
    // Reconstruit l'affichage des badges en fonction des statistiques
    let html = "";
    for(const category in categoryStats){
        // Si la catégorie n'a jamais eu de badge débloqué, l'ajoute
        if(!unlockedBadges.includes(category)){
            unlockedBadges.push(category);
            localStorage.setItem("unlockedBadges", JSON.stringify(unlockedBadges));
            playBadgeSound();
        }

        const stats = categoryStats[category];
        const total = stats.good + stats.bad;
        const ratio = total > 0 ? stats.good / total : 0;

        // Affiche une version "gagnée" si condition remplie, sinon "non gagnée"
        if(total >= 10 && ratio >= 0.80){
            html += `<span class="badge">🏆 ${category} (${total}/10 - ${Math.round(ratio*100)}%)</span>`;
        } else {
            html += `<span class="notbadge">🏆 ${category} (${total}/10 - ${Math.round(ratio*100)}%)</span>`;
        }
    }
    const badgesElement = document.getElementById("badges");
    if(badgesElement){
        badgesElement.innerHTML = html;
    }
}

// Remet à zéro la progression utilisateur (confirme avant)
function resetProgress(){
    if(!confirm("Reset all progress ?")){ return; }
    score = 0;
    progress = 0;
    categoryStats = {};
    unlockedBadges = [];
    wordStats = {};
    questionStats = {};
    localStorage.removeItem("categoryStats");
    localStorage.removeItem("unlockedBadges");
    localStorage.removeItem("wordStats");
    localStorage.removeItem("questionStats");
    update();
    updateBadges();
    result.innerHTML = "Progress reset";
    localStorage.removeItem("score");
    localStorage.removeItem("progress");
    localStorage.removeItem("selectedCategory");
}

// Mise à jour initiale de l'UI
update();
updateBadges();