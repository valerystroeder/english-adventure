
let score=Number(localStorage.getItem('score')||0);
function save(){localStorage.setItem('score',score);document.getElementById('score').innerText='⭐ '+score+' points';}
save();
function speak(t){speechSynthesis.speak(new SpeechSynthesisUtterance(t));}
function showQuiz(){
 let q=quiz[Math.floor(Math.random()*quiz.length)];
 question.innerHTML=q.q+' <button onclick="speak(`'+q.q+'`)">🔊</button>';
 content.innerHTML=q.a.map((x,i)=>`<button onclick="ans(${i},${q.c})">${x}</button>`).join('');
}
function ans(i,c){result.innerText=i===c?'✅ Great!':'❌ Try again'; if(i===c){score+=10;save();}}
function showOral(){
 let q=oral[Math.floor(Math.random()*oral.length)];
 question.innerHTML=q+' <button onclick="speak(`'+q+'`)">🔊</button>';
 content.innerHTML='<p>Answer aloud, then click:</p><button onclick="showExample()">Show example</button>';
 window.current=q;
}
function showExample(){
 const ex={
 "What's your name?":"My name is Emma.",
 "How old are you?":"I am 9 years old.",
 "What's your favourite colour?":"My favourite colour is blue.",
 "When is your birthday?":"My birthday is in May.",
 "How do you go to school?":"I go to school by bus."
 };
 result.innerText=ex[current]||''; speak(ex[current]||'');
}
function showMemory(){
 question.innerText='Memory (sample)';
 content.innerHTML='<div class="memory">🐶 Dog</div><div class="memory">🐱 Cat</div><div class="memory">☀️ Sunny</div>';
}
