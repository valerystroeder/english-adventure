// Logic for Adventure mode
(function(){
    function qs(id){ return document.getElementById(id); }
    const body = document.body;

    let progress = loadProgress();
    let adventureState = { active:false, playing:false, levelId:null, questions:[], currentIndex:0, correct:0 };
    window.adventureModeActive = false;
    window.resetAdventureProgress = resetAdventureProgress;

    document.addEventListener('DOMContentLoaded', () => {
        const advBtn = qs('adventureStart');
        const trainBtn = qs('trainingStart');
        const mainCard = qs('mainCard');
        const backBtn = qs('backButton');

        advBtn.addEventListener('click', () => {
            const bd = document.getElementById('badges'); if(bd) bd.style.display = 'none';
            document.getElementById('startScreen').style.display = 'none';
            mainCard.style.display = 'block';
            if(backBtn) backBtn.style.display = 'block';
            body.classList.add('adventure-mode');
            window.adventureModeActive = true;
            showAdventureIntro();
        });

        trainBtn.addEventListener('click', () => {
            document.getElementById('startScreen').style.display = 'none';
            mainCard.style.display = 'block';
            if(backBtn) backBtn.style.display = 'block';
            body.classList.remove('adventure-mode');
            window.adventureModeActive = false;
            document.getElementById('score').style.display = 'block';
            const map = document.getElementById('adventureMap');
            if(map){ map.style.display = 'none'; }
        });

        if(backBtn){
            backBtn.addEventListener('click', ()=>{
                // stop current level and go back to start screen
                adventureState.playing = false;
                document.getElementById('mainCard').style.display = 'none';
                document.getElementById('startScreen').style.display = 'flex';
                body.classList.remove('adventure-mode');
                window.adventureModeActive = false;
                backBtn.style.display = 'none';
            });
        }
    });

    function loadProgress(){
        const raw = localStorage.getItem('adventureProgress');
        if(raw) try{ return JSON.parse(raw);}catch(e){}
        // default: level 1 unlocked
        return { currentLevel: 1, completed: {}, unlocked: [1], percentages: {} };
    }

    function saveProgress(){
        localStorage.setItem('adventureProgress', JSON.stringify(progress));
    }

    function showAdventureUI(){
        const card = document.getElementById('mainCard');
        adventureState.active = true;
        adventureState.playing = false;
        ensureAdventureMap(card);
        showMapView();
    }

    function ensureAdventureMap(card){
        let map = document.getElementById('adventureMap');
        if(!map){
            map = document.createElement('div');
            map.id = 'adventureMap';
            card.insertBefore(map, card.firstChild);
        }
        return map;
    }

    function showMapView(){
        const map = document.getElementById('adventureMap');
        map.style.display = 'flex';
        document.getElementById('question').style.display = 'none';
        document.getElementById('answers').style.display = 'none';
        document.getElementById('result').style.display = 'none';
        document.querySelector('.progress').style.display = 'none';
        renderMap();
        document.getElementById('question').textContent = 'Choisis un niveau';
    }

    function showLevelView(){
        document.getElementById('adventureMap').style.display = 'none';
        document.getElementById('question').style.display = 'block';
        document.getElementById('answers').style.display = 'block';
        document.getElementById('result').style.display = 'block';
        document.querySelector('.progress').style.display = 'block';
        updateAdventureProgressBar();
    }

    function updateAdventureProgressBar(){
        const progressBar = document.getElementById('progress');
        const total = adventureState.questions.length || 1;
        const done = adventureState.currentIndex;
        const percent = Math.round((done / total) * 100);
        progressBar.style.width = percent + '%';
    }

    function showAdventureIntro(){
        // create intro overlay with message and CTA
        const existing = document.getElementById('advIntro');
        if(existing) existing.remove();
        const overlay = document.createElement('div');
        overlay.id = 'advIntro';
        overlay.className = 'intro-overlay';
        overlay.innerHTML = `
            <div class="intro-box">
                <h2>😵 Quel choc, madame Christelle a oublié l'anglais!</h2>
                <p>Aide la à retrouver sa mémoire</p>
                <div class="intro-actions">
                    <button id="advStartLevel" class="big-btn">Débloque les niveaux !!!</button>
                </div>
            </div>`;
        document.body.appendChild(overlay);
        document.getElementById('advStartLevel').addEventListener('click', ()=>{
            overlay.remove();
            showAdventureUI();
        });
    }

    function renderMap(){
        const map = document.getElementById('adventureMap');
        let avatar = map.querySelector('#avatar');
        if(avatar){
            // keep avatar previous position for animation
            avatar = avatar.cloneNode(true);
            avatar.style.transition = 'top 1s ease';
        } else {
            avatar = document.createElement('div');
            avatar.id = 'avatar';
            avatar.textContent = '🏃‍♀️';
            avatar.style.position = 'absolute';
            avatar.style.left = '70%';
            avatar.style.transform = `translateX(-50%)`;
            avatar.style.top = '0px';
            avatar.style.transition = 'top 1s ease';
        }
        map.innerHTML = '';
        map.appendChild(avatar);

        // vertical layout bottom->top
        const levels = [...adventureConfig.levels];
        // render bottom -> top visually using column-reverse via flex ordering
        map.style.display = 'flex'; map.style.flexDirection = 'column-reverse'; map.style.alignItems = 'center';
        levels.forEach((lvl, idx) => {
            const item = document.createElement('div');
            item.className = 'level-item';

            const node = document.createElement('div');
            node.className = 'level-node';
            node.dataset.levelId = lvl.id;
            node.innerHTML = `<div class="icon">${lvl.icon}</div><div class="title">${lvl.title}</div>`;

            // determine state
            if(progress.completed[lvl.id]){
                node.classList.add('completed');
                node.innerHTML += '<div style="position:absolute;right:6px;top:6px">⭐</div>';
            } else if(progress.unlocked.includes(lvl.id)){
                node.classList.add('available');
            } else {
                node.classList.add('locked');
            }

            // pulse current level
            if(lvl.id === progress.currentLevel){
                node.classList.add('pulse');
            }

            node.addEventListener('click', () => {
                if(progress.unlocked.includes(lvl.id)){
                    startLevel(lvl.id);
                }
            });

            item.appendChild(node);
            // add connecting line
            if(idx < levels.length -1){
                const line = document.createElement('div');
                line.className = 'level-line';
                item.appendChild(line);
            }

            map.appendChild(item);
        });

        // position avatar below current level after layout
        requestAnimationFrame(()=>{
            const avatar = document.getElementById('avatar');
            if(!avatar) return;
            const node = map.querySelector(`[data-level-id="${progress.currentLevel}"]`);
            if(node){
                const rect = node.getBoundingClientRect();
                const mapRect = map.getBoundingClientRect();
                const y = rect.top - mapRect.top + rect.height/2 - 40;
                avatar.style.transform =`translate(-50%, ${y}px)`;
            } else {
                avatar.style.top = '0px';
            }
        });
    }

    function startLevel(levelId){
        const lvl = adventureConfig.levels.find(l=>l.id===levelId);
        if(!lvl) return;
        adventureState.active = true;
        adventureState.playing = true;
        adventureState.levelId = levelId;
        adventureState.questions = generateLevelQuestions(lvl);
        adventureState.currentIndex = 0;
        adventureState.correct = 0;
        showLevelView();
        nextQuestion();

        function nextQuestion(){
            if(adventureState.currentIndex >= adventureState.questions.length){
                finishLevel();
                return;
            }
            const current = adventureState.questions[adventureState.currentIndex];
            present(current, (ok)=>{
                if(ok) adventureState.correct++;
                adventureState.currentIndex++;
                updateAdventureProgressBar();
                setTimeout(nextQuestion, 600);
            });
        }

        function finishLevel(){
            const percent = Math.round((adventureState.correct / adventureState.questions.length) * 100);
            progress.percentages[levelId] = percent;
            const passed = percent >= adventureConfig.passPercentage;
            if(passed){
                progress.completed[levelId] = true;
                const nextLvl = adventureConfig.levels.find(l=>l.id===levelId+1);
                if(nextLvl && !progress.unlocked.includes(nextLvl.id)){
                    progress.unlocked.push(nextLvl.id);
                    progress.currentLevel = nextLvl.id;
                }
                playBadgeSound();
                if(levelId === adventureConfig.levels[adventureConfig.levels.length-1].id){
                    showFinalVictory(percent);
                } else {
                    showLevelResult(lvl.title, percent, true, levelId);
                }
                triggerStarRain();
                setTimeout(()=> moveAvatarToLevel(progress.currentLevel), 900);
            } else {
                showLevelResult(lvl.title, percent, false, levelId);
            }
            saveProgress();
            renderMap();
        }
    }

    function showLevelResult(title, percent, passed, levelId){
        const overlay = document.createElement('div');
        overlay.className = 'result-overlay';
        overlay.innerHTML = `<h2>${passed ? '👩‍🏫🏆 '+title+' : réussi !' : '👩‍🏫⚠️ '+title+' : à refaire'}</h2><p>Score: ${percent}%</p>`;
        overlay.innerHTML += passed ? '<p>Bravo ! Le niveau suivant est débloqué.</p>' : `<p>Essaie encore pour atteindre ${adventureConfig.passPercentage}%.</p>`;
        const btn = document.createElement('div');
        btn.style.marginTop = '12px';
        btn.innerHTML = passed ? `<button class="big-btn">Retour à la carte</button>` : `<button class="big-btn">Réessayer</button>`;
        overlay.appendChild(btn);
        document.body.appendChild(overlay);
        btn.querySelector('button').addEventListener('click', ()=>{
            overlay.remove();
            if(passed){
                showMapView();
            } else {
                startLevel(levelId);
            }
        });
    }

    function showFinalVictory(percent){
        const overlay = document.createElement('div');
        overlay.className = 'result-overlay';
        overlay.innerHTML = `<h2>Félicitations !!!</h2><p>Madame Christelle a retrouvé la mémoire !!!</p><p>Thank you !!</p><p>Score: ${percent}%</p>`;
        const btn = document.createElement('div');
        btn.style.marginTop = '12px';
        btn.innerHTML = `<button class="big-btn">Terminé</button>`;
        overlay.appendChild(btn);
        document.body.appendChild(overlay);
        createConfetti();
        btn.querySelector('button').addEventListener('click', ()=>{
            overlay.remove();
            showMapView();
        });
    }

    function createConfetti(){
        const wrapper = document.createElement('div');
        wrapper.className = 'confetti';
        for(let i=0;i<40;i++){
            const piece = document.createElement('div');
            piece.textContent = '✨';
            piece.style.position = 'absolute';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.top = '-10px';
            piece.style.fontSize = `${8 + Math.random()*12}px`;
            piece.style.animation = `fall ${1.8 + Math.random()}s linear ${Math.random()*0.5}s forwards`;
            wrapper.appendChild(piece);
        }
        document.body.appendChild(wrapper);
        setTimeout(()=> wrapper.remove(), 2600);
    }

    function generateLevelQuestions(lvl){
        const total = lvl.numberofQuestions || 10;
        let dicoCount = Math.round(total * 0.4);
        let quizCount = Math.round(total * 0.3);
        let puzzleCount = Math.round(total * 0.2);
        let oralCount = total - (dicoCount + quizCount + puzzleCount);

        const poolWords = dictionaryWords.filter(w=> lvl.categories.includes(w.cat));
        const poolQuestions = dictionaryQuestions.filter(q => questionMatchesCategories(q, lvl.categories));

        const items = [];
        const dicoItems = selectLeastCorrectWords(poolWords, dicoCount);
        dicoItems.forEach(w => items.push({type:'dico', word:w}));

        const neededQuestions = quizCount + puzzleCount + oralCount;
        const chosenQuestions = selectLeastCorrectQuestions(poolQuestions, neededQuestions);

        for(let i=0;i<quizCount;i++){
            const q = chosenQuestions[i % chosenQuestions.length];
            if(q) items.push({type:'quiz', q});
        }
        for(let i=0;i<puzzleCount;i++){
            const q = chosenQuestions[(quizCount + i) % chosenQuestions.length];
            if(q){
                const ans = q.answers[Math.floor(Math.random()*q.answers.length)];
                items.push({type:'puzzle', answer: ans, question: q.question});
            }
        }
        for(let i=0;i<oralCount;i++){
            const q = chosenQuestions[(quizCount + puzzleCount + i) % chosenQuestions.length];
            if(q){
                const ans = q.answers[Math.floor(Math.random()*q.answers.length)];
                items.push({type:'oral', question: q.question, expected: ans});
            }
        }

        return shuffle(items);
    }

    function questionMatchesCategories(question, categories){
        const text = (question.question + ' ' + question.answers.join(' ')).toLowerCase();
        return dictionaryWords
            .filter(w => categories.includes(w.cat))
            .some(w => text.includes(w.word.toLowerCase()));
    }

    function selectLeastCorrectWords(words, count){
        const sorted = [...words].sort((a,b)=> (wordStats[a.word]||0) - (wordStats[b.word]||0));
        const result = [];
        while(result.length < count && sorted.length){
            result.push(sorted[result.length % sorted.length]);
        }
        return result;
    }

    function selectLeastCorrectQuestions(questions, count){
        const scored = questions.map(q => ({ q, score: questionStats[dictionaryQuestions.indexOf(q)] || 0 }));
        scored.sort((a,b)=> a.score - b.score);
        const result = [];
        if(scored.length === 0) return result;
        while(result.length < count){
            result.push(scored[result.length % scored.length].q);
        }
        return result;
    }

    function present(item, callback){
        const qEl = document.getElementById('question');
        const aEl = document.getElementById('answers');
        const resEl = document.getElementById('result');
        resEl.innerHTML = '<div id="advFeedback"></div>';
        const feedback = document.getElementById('advFeedback');
        const quitBtn = document.createElement('button');
        quitBtn.className = 'big-btn';
        quitBtn.textContent = 'Retour à la carte';
        quitBtn.style.marginTop = '10px';
        quitBtn.addEventListener('click', ()=>{
            adventureState.playing = false;
            showMapView();
        });
        resEl.appendChild(quitBtn);
        aEl.innerHTML = '';

        if(item.type === 'dico'){
            qEl.textContent = '🔊 Listen';
            const speakBtn = document.createElement('button');
            speakBtn.textContent = '🔊';
            speakBtn.addEventListener('click', ()=> speak(item.word.word));
            qEl.appendChild(speakBtn);
            speak(item.word.word);
            const candidates = dictionaryWords.filter(x=> x.cat === item.word.cat && x.fr !== item.word.fr).slice(0,6);
            const wrongs = shuffle(candidates).slice(0,3).map(x=>x.fr);
            const answers = shuffle([item.word.fr, ...wrongs]);
            aEl.innerHTML = answers.map(a=> `<button class="adv-choice">${a}</button>`).join('<br>');
            aEl.querySelectorAll('.adv-choice').forEach(btn=> btn.addEventListener('click', ()=>{
                const ok = btn.textContent === item.word.fr;
                if(ok){ playSuccessSound(); feedback.textContent='✅'; } else { playErrorSound(); feedback.textContent='❌'; }
                callback(ok);
            }));
        } else if(item.type === 'quiz'){
            qEl.textContent = item.q.question;
            const speakBtn = document.createElement('button');
            speakBtn.textContent = '🔊';
            speakBtn.addEventListener('click', ()=> speak(item.q.question));
            qEl.appendChild(speakBtn);
            speak(item.q.question);
            const wrongPool = dictionaryQuestions.filter(q=> q !== item.q).flatMap(q=> q.answers);
            const wrongs = shuffle([...new Set(wrongPool)]).slice(0,3);
            const answers = shuffle([item.q.answers[Math.floor(Math.random()*item.q.answers.length)], ...wrongs]);
            aEl.innerHTML = answers.map(a=> `<button class="adv-choice">${a}</button>`).join('<br>');
            aEl.querySelectorAll('.adv-choice').forEach(btn=> btn.addEventListener('click', ()=>{
                const ok = item.q.answers.includes(btn.textContent);
                if(ok){ playSuccessSound(); feedback.textContent='✅'; } else { playErrorSound(); feedback.textContent='❌'; }
                callback(ok);
            }));
        } else if(item.type === 'puzzle'){
            qEl.textContent = item.question;
            const speakBtn = document.createElement('button');
            speakBtn.textContent = '🔊';
            speakBtn.addEventListener('click', ()=> speak(item.question));
            qEl.appendChild(speakBtn);
            speak(item.question);
            const words = item.answer.split(' ');
            const shuffled = shuffle([...words]);
            let selection = [];
            aEl.innerHTML = `<div id="puzzleAnswer"></div><div id="puzzleWords">${shuffled.map((w,i)=>`<button class="puzz-word" data-i="${i}">${w}</button>`).join('')}</div>`;
            aEl.querySelectorAll('.puzz-word').forEach(btn=> btn.addEventListener('click', ()=>{
                const i = Number(btn.dataset.i);
                speak(btn.textContent);
                if(selection.includes(i)){ selection = selection.filter(x=>x!==i); } else selection.push(i);
                document.getElementById('puzzleAnswer').textContent = selection.map(i=> shuffled[i]).join(' ');
                if(selection.length === words.length){ const user = selection.map(i=>shuffled[i]).join(' '); const ok = user === item.answer; if(ok){ playSuccessSound(); feedback.textContent='✅'; } else { playErrorSound(); feedback.textContent='❌'; } callback(ok); }
            }));
        } else if(item.type === 'oral'){
            qEl.textContent = item.question;
            const speakBtn = document.createElement('button');
            speakBtn.textContent = '🔊';
            speakBtn.addEventListener('click', ()=> speak(item.question));
            qEl.appendChild(speakBtn);
            speak(item.question);
            aEl.innerHTML = `<p>🎙️ Click record and say: <strong>${item.expected}</strong></p><button id="advRecord">🎤 Record</button><div id="advOralHint"></div>`;
            const recBtn = document.getElementById('advRecord');
            recBtn.addEventListener('click', ()=>{
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if(!SpeechRecognition){ alert('Speech not supported'); callback(false); return; }
                const r = new SpeechRecognition(); r.lang='en-US'; r.interimResults=false; r.maxAlternatives=1;
                r.onresult = e => { const t = e.results[0][0].transcript; const n = normalizeText(t); const exp = normalizeText(item.expected); document.getElementById('advOralHint').textContent = `You said: ${t}`; const ok = isSpeechMatch(n, exp); if(ok){ playSuccessSound(); feedback.textContent='✅'; } else { playErrorSound(); feedback.textContent='❌'; } callback(ok); };
                r.onerror = ()=>{ document.getElementById('advOralHint').textContent='Recognition error'; callback(false); };
                r.start();
            });
        }
    }

    function showResultOverlay(text, success){
        const overlay = document.createElement('div');
        overlay.className = 'result-overlay';
        overlay.innerHTML = `<h2>${success ? '🏆 ' : '⚠️ '}${text}</h2>`;
        document.body.appendChild(overlay);
        setTimeout(()=> overlay.remove(), 2200);
    }

    function triggerStarRain(){
        const map = document.getElementById('adventureMap');
        const container = document.createElement('div');
        container.className = 'star-rain';
        for(let i=0;i<20;i++){ const s = document.createElement('div'); s.className='star'; s.style.left = Math.random()*90+'%'; s.style.top = Math.random()*10+'%'; s.style.animationDelay = (Math.random()*0.6)+'s'; s.textContent='✦'; container.appendChild(s); }
        map.appendChild(container);
        setTimeout(()=> container.remove(), 2000);
    }

    function moveAvatarToLevel(nextLevelId){
        const map = document.getElementById('adventureMap');
        const node = map.querySelector(`[data-level-id="${nextLevelId}"]`);
        const avatar = document.getElementById('avatar');
        if(node && avatar){
            const y = node.offsetTop + node.offsetHeight - 10;
            avatar.style.transform = `translate(-50%, ${y}px)`;
        }
    }

    function resetAdventureProgress(){
        progress = { currentLevel: 1, completed: {}, unlocked: [1], percentages: {} };
        adventureState = { active:true, playing:false, levelId:null, questions:[], currentIndex:0, correct:0 };
        saveProgress();
        showMapView();
    }

    // utility shuffle
    function shuffle(a){ return a.sort(()=>Math.random()-0.5); }

})();
