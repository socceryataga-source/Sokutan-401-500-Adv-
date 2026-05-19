(()=>{
  const data=Array.isArray(window.QUIZ_DATA)?window.QUIZ_DATA:[];
  const $=id=>document.getElementById(id);
  const appTitle=$('appTitle'),menuScreen=$('menuScreen'),quizScreen=$('quizScreen'),resultScreen=$('resultScreen'),startNo=$('startNo'),endNo=$('endNo'),rangeInfo=$('rangeInfo'),startBtn=$('startBtn'),backMenuBtn=$('backMenuBtn'),resultMenuBtn=$('resultMenuBtn'),retryBtn=$('retryBtn'),progressText=$('progressText'),progressFill=$('progressFill'),questionNumber=$('questionNumber'),jpText=$('jpText'),enText=$('enText'),choices=$('choices'),feedback=$('feedback'),nextBtn=$('nextBtn'),scoreText=$('scoreText'),resultDetail=$('resultDetail');
  let quizItems=[],currentIndex=0,score=0,answered=false,lastConfig={start:301,end:400,mode:'ordered'};
  if(window.QUIZ_TITLE)appTitle.textContent=window.QUIZ_TITLE;

  function getMode(){const checked=document.querySelector('input[name="mode"]:checked');return checked?checked.value:'ordered'}
  function updateModeStyle(){document.querySelectorAll('.mode-option').forEach(label=>label.classList.remove('selected'));const checked=document.querySelector('input[name="mode"]:checked');if(checked)checked.closest('.mode-option').classList.add('selected')}
  function clampRange(){let s=Number(startNo.value),e=Number(endNo.value);const minId=data.length?Math.min(...data.map(q=>q.id)):301,maxId=data.length?Math.max(...data.map(q=>q.id)):400;if(!Number.isFinite(s))s=minId;if(!Number.isFinite(e))e=maxId;s=Math.max(minId,Math.min(maxId,Math.floor(s)));e=Math.max(minId,Math.min(maxId,Math.floor(e)));if(s>e)[s,e]=[e,s];startNo.value=s;endNo.value=e;const count=data.filter(q=>q.id>=s&&q.id<=e).length;rangeInfo.textContent=`${s}〜${e}の${count}問を出題します。`;return{start:s,end:e,count}}
  function shuffle(array){const a=[...array];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function showScreen(screen){[menuScreen,quizScreen,resultScreen].forEach(el=>el.classList.add('hidden'));screen.classList.remove('hidden')}
  function startQuiz(config=null){const range=config||clampRange();const mode=config?config.mode:getMode();let items=data.filter(q=>q.id>=range.start&&q.id<=range.end).sort((a,b)=>a.id-b.id);if(mode==='random')items=shuffle(items);if(!items.length){rangeInfo.textContent='指定範囲に問題がありません。';return}lastConfig={start:range.start,end:range.end,mode};quizItems=items;currentIndex=0;score=0;answered=false;showScreen(quizScreen);renderQuestion()}
  function renderQuestion(){answered=false;const q=quizItems[currentIndex];const total=quizItems.length;progressText.textContent=`${currentIndex+1} / ${total}`;progressFill.style.width=`${((currentIndex+1)/total)*100}%`;questionNumber.textContent=`No. ${q.id}`;jpText.innerHTML=q.jp;enText.innerHTML=q.en;feedback.className='feedback hidden';feedback.textContent='';nextBtn.textContent=currentIndex+1===quizItems.length?'結果を見る（未回答のまま終了）':'次へ（スキップ）';nextBtn.classList.remove('answered');choices.innerHTML='';q.choices.forEach((choice,index)=>{const btn=document.createElement('button');btn.className='choice-btn';btn.type='button';btn.dataset.index=String(index);btn.innerHTML=`<span class="choice-mark">${['①','②','③','④'][index]}</span> ${escapeHTML(choice)}`;btn.addEventListener('click',()=>answerQuestion(index));choices.appendChild(btn)})}
  function answerQuestion(selected){if(answered)return;answered=true;const q=quizItems[currentIndex];const buttons=choices.querySelectorAll('.choice-btn');buttons.forEach((btn,idx)=>{btn.disabled=true;if(idx===q.answer)btn.classList.add('correct');if(idx===selected&&idx!==q.answer)btn.classList.add('wrong')});const ok=selected===q.answer;if(ok){score+=1;feedback.className='feedback ok';feedback.textContent='正解です。'}else{feedback.className='feedback ng';feedback.textContent=`不正解です。正解は ${['①','②','③','④'][q.answer]} ${q.choices[q.answer]} です。`}nextBtn.textContent=currentIndex+1===quizItems.length?'結果を見る':'次へ';nextBtn.classList.add('answered')}
  function nextQuestion(){if(!answered){skipQuestion();return}moveForward()}
  function skipQuestion(){const q=quizItems[currentIndex];const buttons=choices.querySelectorAll('.choice-btn');buttons.forEach((btn,idx)=>{btn.disabled=true;if(idx===q.answer)btn.classList.add('correct')});feedback.className='feedback ng';feedback.textContent=`スキップしました。正解は ${['①','②','③','④'][q.answer]} ${q.choices[q.answer]} です。`;answered=true;nextBtn.textContent=currentIndex+1===quizItems.length?'結果を見る':'次へ';nextBtn.classList.add('answered')}
  function moveForward(){if(currentIndex+1>=quizItems.length){showResult()}else{currentIndex+=1;renderQuestion()}}
  function showResult(){showScreen(resultScreen);scoreText.textContent=`${score} / ${quizItems.length}`;const percent=Math.round((score/quizItems.length)*100);resultDetail.textContent=`正答率 ${percent}%（出題範囲：${lastConfig.start}〜${lastConfig.end} / ${lastConfig.mode==='random'?'ランダム':'順番通り'}）`}
  function escapeHTML(str){return String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

  document.querySelectorAll('input[name="mode"]').forEach(radio=>radio.addEventListener('change',updateModeStyle));
  [startNo,endNo].forEach(input=>input.addEventListener('input',clampRange));
  startBtn.addEventListener('click',()=>startQuiz());
  nextBtn.addEventListener('click',nextQuestion);
  backMenuBtn.addEventListener('click',()=>showScreen(menuScreen));
  resultMenuBtn.addEventListener('click',()=>showScreen(menuScreen));
  retryBtn.addEventListener('click',()=>startQuiz(lastConfig));
  clampRange();
  updateModeStyle();
})();
