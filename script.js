(()=>{
  const data=Array.isArray(window.QUIZ_DATA)?window.QUIZ_DATA:[];
  const $=id=>document.getElementById(id);
  const appTitle=$('appTitle'),menuScreen=$('menuScreen'),quizScreen=$('quizScreen'),resultScreen=$('resultScreen'),startNo=$('startNo'),endNo=$('endNo'),rangeInfo=$('rangeInfo'),startBtn=$('startBtn'),prevBtn=$('prevBtn'),backMenuBtn=$('backMenuBtn'),resultMenuBtn=$('resultMenuBtn'),retryBtn=$('retryBtn'),progressText=$('progressText'),progressFill=$('progressFill'),questionNumber=$('questionNumber'),jpText=$('jpText'),enText=$('enText'),choices=$('choices'),feedback=$('feedback'),nextBtn=$('nextBtn'),scoreText=$('scoreText'),resultDetail=$('resultDetail');
  let quizItems=[],currentIndex=0,answerStates=[],lastConfig={start:301,end:400,mode:'ordered'};
  if(window.QUIZ_TITLE)appTitle.textContent=window.QUIZ_TITLE;

  function getMode(){const checked=document.querySelector('input[name="mode"]:checked');return checked?checked.value:'ordered'}
  function updateModeStyle(){document.querySelectorAll('.mode-option').forEach(label=>label.classList.remove('selected'));const checked=document.querySelector('input[name="mode"]:checked');if(checked)checked.closest('.mode-option').classList.add('selected')}
  function getMinMax(){return{minId:data.length?Math.min(...data.map(q=>q.id)):301,maxId:data.length?Math.max(...data.map(q=>q.id)):400}}
  function toNumber(value){const cleaned=String(value).replace(/[^0-9]/g,'');return cleaned===''?NaN:Number(cleaned)}
  function normalizeRange(writeBack=true){let s=toNumber(startNo.value),e=toNumber(endNo.value);const{minId,maxId}=getMinMax();if(!Number.isFinite(s))s=minId;if(!Number.isFinite(e))e=maxId;s=Math.max(minId,Math.min(maxId,Math.floor(s)));e=Math.max(minId,Math.min(maxId,Math.floor(e)));if(s>e)[s,e]=[e,s];const count=data.filter(q=>q.id>=s&&q.id<=e).length;if(writeBack){startNo.value=s;endNo.value=e}rangeInfo.textContent=`${s}〜${e}の${count}問を出題します。`;return{start:s,end:e,count}}
  function updateRangeInfo(){const s=toNumber(startNo.value),e=toNumber(endNo.value);const{minId,maxId}=getMinMax();if(!Number.isFinite(s)||!Number.isFinite(e)){rangeInfo.textContent=`${minId}〜${maxId}の範囲で番号を直接入力できます。`;return}const ns=Math.max(minId,Math.min(maxId,Math.floor(s)));const ne=Math.max(minId,Math.min(maxId,Math.floor(e)));const start=Math.min(ns,ne),end=Math.max(ns,ne);const count=data.filter(q=>q.id>=start&&q.id<=end).length;rangeInfo.textContent=`${start}〜${end}の${count}問を出題します。`}
  function shuffle(array){const a=[...array];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
  function showScreen(screen){[menuScreen,quizScreen,resultScreen].forEach(el=>el.classList.add('hidden'));screen.classList.remove('hidden')}
  function startQuiz(config=null){const range=config||normalizeRange(true);const mode=config?config.mode:getMode();let items=data.filter(q=>q.id>=range.start&&q.id<=range.end).sort((a,b)=>a.id-b.id);if(mode==='random')items=shuffle(items);if(!items.length){rangeInfo.textContent='指定範囲に問題がありません。';return}lastConfig={start:range.start,end:range.end,mode};quizItems=items;currentIndex=0;answerStates=quizItems.map(()=>({status:'unanswered',selected:null,correct:false}));showScreen(quizScreen);renderQuestion()}
  function renderQuestion(){const q=quizItems[currentIndex];const state=answerStates[currentIndex];const total=quizItems.length;progressText.textContent=`${currentIndex+1} / ${total}`;progressFill.style.width=`${((currentIndex+1)/total)*100}%`;questionNumber.textContent=`No. ${q.id}`;jpText.innerHTML=q.jp;enText.innerHTML=q.en;feedback.className='feedback hidden';feedback.textContent='';prevBtn.disabled=currentIndex===0;prevBtn.classList.toggle('disabled',currentIndex===0);choices.innerHTML='';q.choices.forEach((choice,index)=>{const btn=document.createElement('button');btn.className='choice-btn';btn.type='button';btn.dataset.index=String(index);btn.innerHTML=`<span class="choice-mark">${['①','②','③','④'][index]}</span> ${escapeHTML(choice)}`;btn.addEventListener('click',()=>answerQuestion(index));choices.appendChild(btn)});if(state.status==='unanswered'){nextBtn.textContent=currentIndex+1===quizItems.length?'結果を見る（未回答のまま終了）':'次へ（スキップ）';nextBtn.classList.remove('answered')}else{restoreAnsweredState(q,state)}}
  function restoreAnsweredState(q,state){const buttons=choices.querySelectorAll('.choice-btn');buttons.forEach((btn,idx)=>{btn.disabled=true;if(idx===q.answer)btn.classList.add('correct');if(state.status==='answered'&&idx===state.selected&&idx!==q.answer)btn.classList.add('wrong')});if(state.status==='answered'&&state.correct){feedback.className='feedback ok';feedback.textContent='正解です。'}else if(state.status==='answered'){feedback.className='feedback ng';feedback.textContent=`不正解です。正解は ${['①','②','③','④'][q.answer]} ${q.choices[q.answer]} です。`}else if(state.status==='skipped'){feedback.className='feedback ng';feedback.textContent=`スキップしました。正解は ${['①','②','③','④'][q.answer]} ${q.choices[q.answer]} です。`}nextBtn.textContent=currentIndex+1===quizItems.length?'結果を見る':'次へ';nextBtn.classList.add('answered')}
  function answerQuestion(selected){const state=answerStates[currentIndex];if(state.status!=='unanswered')return;const q=quizItems[currentIndex];const ok=selected===q.answer;answerStates[currentIndex]={status:'answered',selected,correct:ok};restoreAnsweredState(q,answerStates[currentIndex])}
  function nextQuestion(){const state=answerStates[currentIndex];if(state.status==='unanswered'){skipQuestion();return}moveForward()}
  function prevQuestion(){if(currentIndex===0)return;currentIndex-=1;renderQuestion()}
  function skipQuestion(){const q=quizItems[currentIndex];answerStates[currentIndex]={status:'skipped',selected:null,correct:false};restoreAnsweredState(q,answerStates[currentIndex])}
  function moveForward(){if(currentIndex+1>=quizItems.length){showResult()}else{currentIndex+=1;renderQuestion()}}
  function showResult(){showScreen(resultScreen);const score=answerStates.filter(s=>s.correct).length;scoreText.textContent=`${score} / ${quizItems.length}`;const percent=Math.round((score/quizItems.length)*100);const skipped=answerStates.filter(s=>s.status==='skipped').length;const unanswered=answerStates.filter(s=>s.status==='unanswered').length;const extra=skipped||unanswered?`（スキップ ${skipped}問 / 未回答 ${unanswered}問）`:'';resultDetail.textContent=`正答率 ${percent}%（出題範囲：${lastConfig.start}〜${lastConfig.end} / ${lastConfig.mode==='random'?'ランダム':'順番通り'}）${extra}`}
  function escapeHTML(str){return String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

  document.querySelectorAll('input[name="mode"]').forEach(radio=>radio.addEventListener('change',updateModeStyle));
  [startNo,endNo].forEach(input=>{input.addEventListener('input',updateRangeInfo);input.addEventListener('blur',()=>normalizeRange(true));input.addEventListener('keydown',event=>{if(event.key==='Enter')normalizeRange(true)})});
  startBtn.addEventListener('click',()=>startQuiz());
  prevBtn.addEventListener('click',prevQuestion);
  nextBtn.addEventListener('click',nextQuestion);
  backMenuBtn.addEventListener('click',()=>showScreen(menuScreen));
  resultMenuBtn.addEventListener('click',()=>showScreen(menuScreen));
  retryBtn.addEventListener('click',()=>startQuiz(lastConfig));
  normalizeRange(true);
  updateModeStyle();
})();
