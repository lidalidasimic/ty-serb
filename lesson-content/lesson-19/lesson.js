const sections = [
  ['comic','Комикс','Полинин рођендан','Прочитай историю. Что приготовила Полина своим друзьям?'],
  ['heroes','Герои','Ко је шта урадио?','Соедини героя и действие. Затем перескажи историю в прошедшем времени.'],
  ['words','Новые слова','Речи из приче','Соедини слова с переводом.'],
  ['grammar','Повторение','Јуче · данас · сутра','Коротко повторим прошедшее и будущее время.'],
  ['timeline','Три времени','Сложи временску линију','Разложи предложения: сначала прошлое, затем настоящее, затем будущее.'],
  ['transform','Преобразования','Из садашњег у прошло и будуће','Один глагол — три времени. Сохраняй лицо, число и смысл.'],
  ['negative','Отрицания','Нисмо · нећемо','Сделай отрицание в прошлом и будущем.'],
  ['questions','Вопросы','Да ли? Хоће ли? Зар?','Собери вопросы, затем составь свои вопросы в двух временах.'],
  ['reading','Новый текст','Сутрадан после авантуре','Прочитай продолжение истории и ответь на вопросы.'],
  ['gifts','Подарки','Полина отвара поклоне','Кому дарят подарки? Первые фразы с дательным падежом.'],
  ['quiz','Проверка','Поруке из свемира','Помоги инопланетянам выбрать правильные формы.'],
  ['homework','Домашнее задание','Јуче смо… Сутра ћемо…','Напиши продолжение истории или расскажи о своём дне рождения.']
];
const comic = [
  ['Данас је Полинин рођендан!','Имам изненађење за вас!','Сегодня день рождения Полины! У меня для вас сюрприз!'],
  ['Идемо на наше омиљено место у шуми.','Волимо ову шетњу!','Идём в наше любимое место в лесу. Мы любим эту прогулку!'],
  ['Гледајте! Пећина!','Хајдемо унутра!','Смотрите! Пещера! Пойдём внутрь!'],
  ['Нашли су ванземаљце!','Гледамо цртани!','Они нашли инопланетян! Мы смотрим мультфильм!'],
  ['Позив на цртани','Хоћете ли да гледате са нама?','Хотите посмотреть с нами?'],
  ['Нова мисија','Да ли ћемо после ићи кући? — Нећемо. Тражићемо благо!','Мы потом пойдём домой? — Нет. Будем искать сокровища!'],
  ['А онда су дошле вештице…','Ко сте ви? Шта радите овде?','А потом пришли ведьмы… Кто вы? Что вы здесь делаете?'],
  ['Опасно обећање','Претворићемо вас у жабе!','Мы превратим вас в лягушек!'],
  ['Отишли су до пирамиде.','Можда је благо унутра!','Они дошли до пирамиды. Может быть, сокровища внутри!'],
  ['Ја сам фараон!','Благо није ваше! Вештице су га украле од мог народа!','Я фараон! Сокровища не ваши! Ведьмы украли их у моего народа!'],
  ['Фараон је користио своју магију.','Вештице, вратите благо и никоме више немојте штетити!','Фараон использовал свою магию. Ведьмы, верните сокровища и больше никому не вредите!'],
  ['Благо је враћено, а пријатељи су добили награду!','Најбољи рођендан икада!','Сокровища вернули, а друзья получили награду! Лучший день рождения в жизни!']
];
const people=['ја','ти','он / она','ми','ви','они / оне'];
const pastAux=['сам','си','је','смо','сте','су'];
const pastNeg=['нисам','ниси','није','нисмо','нисте','нису'];
const futureAux=['ћу','ћеш','ће','ћемо','ћете','ће'];
const futureNeg=['нећу','нећеш','неће','нећемо','нећете','неће'];
const row=(prompt,answer,alternatives=[],hint='')=>({prompt,answer,alternatives,hint});
const tasks={
  heroes:{title:'Ко је шта урадио?',type:'match',rows:[row('Полина','је имала рођендан.'),row('Ванземаљци','су гледали цртани.'),row('Вештице','су украле благо.'),row('Фараон','је користио магију.')]},
  words:{title:'Слово и перевод',type:'match',rows:[row('рођендан','день рождения'),row('поклон','подарок'),row('пећина','пещера'),row('ванземаљац','инопланетянин'),row('благо','сокровища'),row('вештица','ведьма'),row('фараон','фараон'),row('пирамида','пирамида'),row('претворити','превратить'),row('вратити','вернуть')]},
  past:{title:'Сначала — прошедшее время',description:'Пример: Гледамо цртани. → Гледали смо цртани.',rows:[
    row('Ми гледамо цртани.','Ми смо гледали цртани.',['Гледали смо цртани.','Ми смо гледале цртани.','Гледале смо цртани.']),
    row('Полина слави рођендан.','Полина је славила рођендан.'),
    row('Маша тражи поклон.','Маша је тражила поклон.'),
    row('Коцкослав носи мапу.','Коцкослав је носио мапу.')]},
  future:{title:'Затем — будущее время',description:'Пример: Гледамо цртани. → Гледаћемо цртани.',rows:[
    row('Ми гледамо цртани.','Ми ћемо гледати цртани.',['Гледаћемо цртани.']),
    row('Полина слави рођендан.','Полина ће славити рођендан.'),
    row('Маша тражи поклон.','Маша ће тражити поклон.'),
    row('Коцкослав носи мапу.','Коцкослав ће носити мапу.')]},
  negativePast:{title:'Отрицание в прошедшем',rows:[
    row('Полина је заборавила поклон.','Полина није заборавила поклон.'),
    row('Ми смо ушли у пећину.','Ми нисмо ушли у пећину.',['Нисмо ушли у пећину.']),
    row('Вештице су вратиле благо.','Вештице нису вратиле благо.'),
    row('Ти си гледао цртани.','Ти ниси гледао цртани.',['Ниси гледао цртани.'])]},
  negativeFuture:{title:'Отрицание в будущем',rows:[
    row('Полина ће заборавити поклон.','Полина неће заборавити поклон.'),
    row('Ми ћемо ући у пећину.','Ми нећемо ући у пећину.',['Нећемо ући у пећину.']),
    row('Вештице ће вратити благо.','Вештице неће вратити благо.'),
    row('Ти ћеш гледати цртани.','Ти нећеш гледати цртани.',['Нећеш гледати цртани.'])]},
  questionsPast:{title:'Вопросы о прошлом',description:'Используй Да ли…? или форму с ли.',rows:[
    row('Полина је добила поклон.','Да ли је Полина добила поклон?',['Је ли Полина добила поклон?']),
    row('Маша је гледала цртани.','Да ли је Маша гледала цртани?',['Је ли Маша гледала цртани?']),
    row('Ванземаљци су нашли мапу.','Да ли су ванземаљци нашли мапу?',['Јесу ли ванземаљци нашли мапу?']),
    row('Ви сте тражили благо.','Да ли сте ви тражили благо?',['Да ли сте тражили благо?','Јесте ли ви тражили благо?','Јесте ли тражили благо?'])]},
  questionsFuture:{title:'Вопросы о будущем',description:'Используй Да ли…? или Хоће ли…?',rows:[
    row('Полина ће отворити поклон.','Да ли ће Полина отворити поклон?',['Хоће ли Полина отворити поклон?']),
    row('Маша ће гледати цртани.','Да ли ће Маша гледати цртани?',['Хоће ли Маша гледати цртани?']),
    row('Ванземаљци ће тражити мапу.','Да ли ће ванземаљци тражити мапу?',['Хоће ли ванземаљци тражити мапу?']),
    row('Ви ћете ући у пећину.','Да ли ћете ви ући у пећину?',['Да ли ћете ући у пећину?','Хоћете ли ви ући у пећину?','Хоћете ли ући у пећину?'])]},
  negativeQuestions:{title:'Отрицательные вопросы',description:'Начни с Зар…? Здесь говорящий удивлён или ожидает подтверждения.',rows:[
    row('Прошлое: Полина је добила поклон.','Зар Полина није добила поклон?',['Зар није Полина добила поклон?']),
    row('Будущее: Полина ће добити поклон.','Зар Полина неће добити поклон?',['Зар неће Полина добити поклон?']),
    row('Прошлое: Ви сте гледали цртани.','Зар ви нисте гледали цртани?',['Зар нисте гледали цртани?','Зар нисте ви гледали цртани?']),
    row('Будущее: Ви ћете гледати цртани.','Зар ви нећете гледати цртани?',['Зар нећете гледати цртани?','Зар нећете ви гледати цртани?']),
    row('Прошлое: Ванземаљци су нашли благо.','Зар ванземаљци нису нашли благо?',['Зар нису ванземаљци нашли благо?']),
    row('Будущее: Ванземаљци ће тражити благо.','Зар ванземаљци неће тражити благо?',['Зар неће ванземаљци тражити благо?'])]},
  comprehension:{title:'Что случится после приключения?',type:'choice',rows:[
    {prompt:'Кога ће Полина позвати?',answer:'Машу и Коцкослава',options:['Машу и Коцкослава','Само фараона','Вештице']},
    {prompt:'Шта је Полина добила јуче?',answer:'Награду',options:['Нову торту','Награду','Писмо од Маше']},
    {prompt:'Шта ће бити у кутији?',answer:'Звездана мапа',options:['Жаба','Сендвич','Звездана мапа']},
    {prompt:'Да ли ће ванземаљци одмах ићи кући?',answer:'Не, неће.',options:['Да, хоће.','Не, неће.','Не, нису.']},
    {prompt:'Шта ће пријатељи прво урадити?',answer:'Даће Полини поклоне.',options:['Ући ће у пећину.','Даће Полини поклоне.','Вратиће се кући.']}]},
  dative:{title:'Коме? Кому?',type:'select',rows:[
    {prompt:'Маша даје ___ поклон. (Полина)',answer:'Полини',options:['Полина','Полину','Полини']},
    {prompt:'Полина показује ___ мапу. (Маша)',answer:'Маши',options:['Маши','Машу','Маша']},
    {prompt:'Ванземаљци шаљу ___ поруку. (Коцкослав)',answer:'Коцкославу',options:['Коцкослав','Коцкославу','Коцкослава']},
    {prompt:'Полина ће дати ___ поклон.',answer:'Маши',options:['Машу','Маша','Маши']},
    {prompt:'Коцкослав је поклонио ___ лампу.',answer:'Полини',options:['Полину','Полини','Полина']},
    {prompt:'Полина је послала ___ писмо.',answer:'фараону',options:['фараона','фараону','фараон']}]},
  quiz:{title:'Сообщения с другой планеты',type:'choice',rows:[
    {prompt:'Јуче ___ гледали цртани.',answer:'смо',options:['смо','ћемо','ће']},
    {prompt:'Сутра ___ тражити благо.',answer:'ћемо',options:['смо','ћемо','сам']},
    {prompt:'Маша је ___ поклон.',answer:'отворила',options:['отворио','отворили','отворила']},
    {prompt:'Вештице ___ украле благо.',answer:'су',options:['је','су','ће']},
    {prompt:'Јуче Полина ___ изгубила мапу.',answer:'није',options:['неће','није','не']},
    {prompt:'Сутра Полина ___ изгубити мапу.',answer:'неће',options:['није','не','неће']},
    {prompt:'Прошлое: ___ ли сте нашли благо?',answer:'Јесте',options:['Сте','Јесте','Хоћете']},
    {prompt:'Будущее: ___ ли ћете доћи?',answer:'Да',options:['Да','Хоће','Јесте']},
    {prompt:'Выбери вопрос в будущем.',answer:'Хоће ли Полина доћи?',options:['Ће ли Полина доћи?','Хоће ли Полина доћи?','Је ли Полина дошла?']},
    {prompt:'Кому? Маша даје ___ поклон.',answer:'Полини',options:['Полину','Полини','Полина']}]}
};
const timeline=[
  ['Гледали смо цртани.','past'],['Гледамо цртани.','present'],['Гледаћемо цртани.','future'],
  ['Тражили смо благо.','past'],['Тражимо благо.','present'],['Тражићемо благо.','future'],
  ['Вештице су украле благо.','past'],['Вештице краду благо.','present'],['Вештице ће украсти благо.','future'],
  ['Фараон је користио магију.','past'],['Фараон користи магију.','present'],['Фараон ће користити магију.','future'],
  ['Полина је имала рођендан.','past'],['Полина има рођендан.','present'],['Полина ће имати рођендан.','future'],
  ['Претворили смо вас у жабе.','past'],['Претварамо вас у жабе.','present'],['Претворићемо вас у жабе.','future']
];
const timelineOrder=[8,0,10,14,4,6,11,1,17,3,13,9,2,15,7,12,5,16];
const timeLabels={past:'ПРОШЛО',present:'САДАШЊЕ',future:'БУДУЋЕ'};
const assembled=[
  ['Да ли је Полина добила поклон?',['поклон?','Полина','Да','добила','је','ли']],
  ['Да ли ће Полина добити поклон?',['ће','поклон?','ли','Полина','добити','Да']],
  ['Јесте ли гледали цртани?',['цртани?','ли','гледали','Јесте']],
  ['Хоћете ли гледати цртани?',['ли','цртани?','Хоћете','гледати']],
  ['Када су вештице украле благо?',['украле','Када','благо?','су','вештице']],
  ['Када ће вештице вратити благо?',['благо?','ће','Када','вештице','вратити']],
  ['Зар Полина није добила поклон?',['није','поклон?','Полина','Зар','добила']],
  ['Зар Полина неће добити поклон?',['Полина','неће','добити','Зар','поклон?']]
];
const reading=[
  ['Јуче и данас',[
    'Полина <v t="past">је јуче славила</v> рођендан. Она и њени пријатељи <v t="past">су нашли</v> ванземаљце у пећини. Вештице <v t="past">су украле</v> благо, али фараон <v t="past">је користио</v> магију. Пријатељи <v t="past">су на крају добили</v> награду.',
    'Данас Полина <v t="present">гледа</v> чудну кутију. На њој <v t="present">пише</v>: „Отвори ме сутра!“ Маша <v t="present">чита</v> поруку, а Коцкослав <v t="present">тражи</v> мапу Ртња.'
  ]],
  ['План за сутра',[
    'Сутрадан после авантуре <v t="future">ће Полина позвати</v> Машу и Коцкослава. На столу <v t="future">ће бити</v> торта и свећице. Полина <v t="future">ће отворити</v> кутију, а из ње <v t="future">ће испасти</v> мала звездана мапа.',
    'Ванземаљци <v t="future">ће се појавити</v> на екрану. „<v t="future">Нећемо ићи</v> кући. <v t="present">Имамо</v> нову мисију!“ <v t="future">рећи ће</v> они.'
  ]],
  ['Поклони па мисија',[
    'Маша <v t="future">ће питати</v>: „Да ли <v t="future">ћемо опет ићи</v> у пећину?“ Коцкослав <v t="future">ће одговорити</v>: „<v t="future">Ићи ћемо</v>, али прво <v t="future">ћемо Полини дати</v> поклоне.“',
    '„Зар <v t="past">нисте јуче нашли</v> благо?“ <v t="future">питаће</v> Полина. „<v t="past">Јесмо</v>! Али ова мапа <v t="present">показује</v> пут до друге планете!“'
  ]]
];
const readingTokens=reading.flatMap((c,chapter)=>c[1].flatMap((p,paragraph)=>Array.from(p.matchAll(/<v t="(\w+)">(.*?)<\/v>/g), (m,i)=>({key:`${chapter}-${paragraph}-${i}`,time:m[1],text:m[2]}))));
let saved={current:0,answers:{},orders:{},marks:{},drafts:{},visitedFrames:[],seen:[],completed:[],finished:false};
try {const data=JSON.parse(localStorage.getItem('tyserb-lesson19')||'{}');if(data&&typeof data==='object')saved={...saved,...data};} catch {}
for(const key of ['answers','orders','marks','drafts'])if(!saved[key]||Array.isArray(saved[key])||typeof saved[key]!=='object')saved[key]={};
for(const key of ['visitedFrames','seen','completed'])if(!Array.isArray(saved[key]))saved[key]=[];
let current=Number.isInteger(saved.current)&&saved.current>=0&&saved.current<sections.length?saved.current:0;
let frame=0,chapter=0,translated=false,selectedCard=null,selectedWord=null,readingMode='past',modelTime='past';
const activity=document.querySelector('#activity');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const translit={'а':'a','б':'b','в':'v','г':'g','д':'d','ђ':'đ','е':'e','ж':'ž','з':'z','и':'i','ј':'j','к':'k','л':'l','љ':'lj','м':'m','н':'n','њ':'nj','о':'o','п':'p','р':'r','с':'s','т':'t','ћ':'ć','у':'u','ф':'f','х':'h','ц':'c','ч':'č','џ':'dž','ш':'š'};
function normalize(s){return String(s).toLowerCase().replace(/[а-яђјљњћџ]/g,c=>translit[c]||c).replace(/đ/g,'dj').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();}
function isCorrect(value,r){return [r.answer,...(r.alternatives||[])].some(a=>normalize(a)===normalize(value));}
function record(key){return saved.answers[key]||{value:'',status:''};}
function icons(){window.lucide?.createIcons();}
function persist(){saved.current=current;try{localStorage.setItem('tyserb-lesson19',JSON.stringify(saved));document.querySelector('#save-status').textContent='Прогресс сохранён на этом устройстве.';}catch{document.querySelector('#save-status').textContent='Прогресс доступен до закрытия страницы.';}}
function allCorrect(id){return tasks[id].rows.every((r,i)=>record(`${id}-${i}`).status==='correct'&&isCorrect(record(`${id}-${i}`).value,r));}
function complete(i){
  if(i===0)return new Set(saved.visitedFrames).size===comic.length;
  if(i===3)return saved.seen.includes('grammar');
  if(i===4)return timeline.every((r,j)=>record(`timeline-${j}`).status==='correct'&&record(`timeline-${j}`).value===r[1]);
  if(i===7)return ['questionsPast','questionsFuture','negativeQuestions'].every(allCorrect)&&assembled.every((q,j)=>record(`assembled-${j}`).status==='correct');
  if(i===8)return allCorrect('comprehension')&&readingTokens.every(t=>saved.marks[t.key]===t.time);
  if(i===11)return saved.finished;
  const ids={1:['heroes'],2:['words'],5:['past','future'],6:['negativePast','negativeFuture'],9:['dative'],10:['quiz']}[i];
  return ids?.every(allCorrect)||false;
}
function progress(){saved.completed=sections.map((_,i)=>i).filter(complete);document.querySelector('#progress-count').textContent=`${saved.completed.length}/${sections.length}`;document.querySelector('#steps').innerHTML=sections.map((s,i)=>`<button class="step ${i===current?'active':''} ${saved.completed.includes(i)?'complete':''}" data-step="${i}" title="${i+1}. ${s[1]}" aria-label="Раздел ${i+1}: ${s[1]}" ${i===current?'aria-current="step"':''}></button>`).join('');persist();}
document.body.classList.toggle('embedded',window.self!==window.top);
function render(){
  const s=sections[current];
  document.querySelector('#section-kicker').textContent=`${current+1}. ${s[1].toUpperCase()}`;
  document.querySelector('#section-title').textContent=s[2];document.querySelector('#section-description').textContent=s[3];
  document.querySelector('#previous').disabled=current===0;document.querySelector('#next').textContent=current===11?'Завершить урок':'Дальше';document.querySelector('#step-caption').textContent=`${current+1} из ${sections.length}`;document.querySelector('#navigation-status').textContent='';
  const audio=document.querySelector('#section-audio-player');audio.pause();audio.removeAttribute('src');audio.load();document.querySelector('#audio-title').textContent=`Аудио · ${current+1}. ${s[1]}`;
  if(current===3&&!saved.seen.includes('grammar'))saved.seen.push('grammar');
  renderActivity();renderFeedback();icons();progress();
}
function go(i){current=i;selectedCard=null;selectedWord=null;render();document.querySelector('.section-heading').scrollIntoView({behavior:'smooth',block:'start'});document.querySelector('#section-title').focus({preventScroll:true});}
function renderComic(){
  if(!saved.visitedFrames.includes(frame))saved.visitedFrames.push(frame);
  const c=comic[frame];activity.innerHTML=`<div class="comic-layout"><div><a href="assets/comic-${String(frame+1).padStart(2,'0')}.png" target="_blank" rel="noopener" aria-label="Открыть кадр ${frame+1} крупно"><img class="comic-image" src="assets/comic-${String(frame+1).padStart(2,'0')}.png" alt="Кадр ${frame+1}: ${esc(c[0])}" width="384" height="341"></a><div class="comic-controls"><button id="comic-prev" class="icon-button" aria-label="Предыдущий кадр" title="Предыдущий кадр" ${frame===0?'disabled':''}><i data-lucide="chevron-left"></i></button><span class="comic-counter">${frame+1} / 12</span><button id="comic-next" class="icon-button" aria-label="Следующий кадр" title="Следующий кадр" ${frame===11?'disabled':''}><i data-lucide="chevron-right"></i></button></div></div><div><p class="comic-number">КОМИКС · КАДР ${frame+1}</p><h3 lang="sr-Cyrl">${esc(c[0])}</h3><div class="dialogue"><p lang="sr-Cyrl">${esc(c[1])}</p>${translated?`<p class="translation">${esc(c[2])}</p>`:''}</div><div class="comic-tools"><button id="translation" class="text-button" aria-expanded="${translated}">${translated?'Скрыть перевод':'Показать перевод'}</button></div>${frame===1?'<p class="note">В реплике исправляем опечатку: <strong>Волимо ову шетњу!</strong></p>':''}${frame===8?'<p class="note">Пирамида — часть фантастического приключения героев.</p>':''}</div></div>`;icons();progress();
}
function feedbackHTML(key,r){const a=record(key);if(!a.status)return '';return `<p class="feedback ${a.status}" role="status">${esc(a.status==='correct'?'Верно!'+(r.hint?' '+r.hint:''):a.status==='wrong'?'Пока неверно. Проверь форму и порядок слов.':'Пример: '+r.answer)}</p>`;}
function taskHTML(id){
  const t=tasks[id],count=t.rows.filter((r,i)=>record(`${id}-${i}`).status==='correct').length;
  return `<div class="task" data-task="${id}"><h3>${t.title}</h3>${t.description?`<p class="task-description">${t.description}</p>`:''}${t.rows.map((r,i)=>{const key=`${id}-${i}`,a=record(key);const options=t.type==='match'?[...t.rows.map(r=>r.answer).slice(2),...t.rows.map(r=>r.answer).slice(0,2)]:r.options;
    return `<div id="row-${key}" class="${t.type==='match'?'match-row':'question'} ${a.status}"><${t.type==='match'?'label':'div'} ${t.type==='match'?`for="${key}"`:`class="question-prompt"`} id="label-${key}">${t.type==='match'?'':`<span class="q-number">${i+1}</span>`}<span lang="sr-Cyrl" class="${t.type==='match'?'match-word':''}">${esc(r.prompt)}</span></${t.type==='match'?'label':'div'}>${t.type==='match'||t.type==='select'?`<select id="${key}" data-answer="${key}" aria-labelledby="label-${key}"><option value="">Выбери…</option>${options.map(o=>`<option value="${esc(o)}" ${a.value===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`:t.type==='choice'?`<div class="answers" role="radiogroup" aria-labelledby="label-${key}">${options.map(o=>`<label class="choice"><input type="radio" name="${key}" data-answer="${key}" value="${esc(o)}" ${a.value===o?'checked':''}><span>${esc(o)}</span></label>`).join('')}</div>`:`<input type="text" data-answer="${key}" value="${esc(a.value)}" aria-labelledby="label-${key}" placeholder="Ответ по-сербски" spellcheck="false" autocomplete="off">`}${feedbackHTML(key,r)}</div>`;}).join('')}<div class="task-actions"><button class="button secondary" data-check="${id}"><i data-lucide="check"></i>Проверить</button><button class="text-button" data-reveal="${id}">Показать ответы</button><button class="text-button" data-retry="${id}">Ещё раз</button><p class="task-summary" aria-live="polite">${count} из ${t.rows.length} верно</p></div></div>`;
}
function wordConnectionsHTML(){
  const rows=tasks.words.rows,order=[3,0,8,5,1,9,4,7,2,6];
  const endpoint=(side,i)=>{
    const pair=side==='word'?i:rows.findIndex((r,j)=>record(`words-${j}`).value===rows[i].answer);
    const a=pair<0?{value:'',status:''}:record(`words-${pair}`),connected=Boolean(a.value);
    const selected=selectedWord?.side===side&&selectedWord.index===i;
    const text=side==='word'?rows[i].prompt:rows[i].answer;
    const label=`${text}${connected?': соединено с '+(side==='word'?a.value:rows[pair].prompt):''}${a.status==='correct'?': верно':a.status==='wrong'?': пока неверно':''}`;
    return `<button type="button" class="connection-endpoint ${a.status} ${connected?'connected':''}" data-word-side="${side}" data-word-index="${i}" aria-pressed="${selected}" aria-label="${esc(label)}" ${side==='word'?'lang="sr-Cyrl"':''}><span class="connection-label">${esc(text)}</span><span class="connection-number" aria-hidden="true">${connected?pair+1:''}</span></button>`;
  };
  const count=rows.filter((r,i)=>record(`words-${i}`).status==='correct'&&isCorrect(record(`words-${i}`).value,r)).length;
  const revealed=rows.some((_,i)=>record(`words-${i}`).status==='revealed');
  const wrong=rows.filter((_,i)=>record(`words-${i}`).status==='wrong');
  return `<div class="task" data-task="words"><h3>${tasks.words.title}</h3><div class="connection-headings"><span>Сербский</span><span>Русский</span></div><div class="word-connections"><svg class="connection-lines" aria-hidden="true"></svg><div class="connection-column">${rows.map((_,i)=>endpoint('word',i)).join('')}</div><div class="connection-column">${order.map(i=>endpoint('translation',i)).join('')}</div></div><div class="task-actions"><button class="button secondary" data-check="words"><i data-lucide="check"></i>Проверить</button><button class="text-button" data-reveal="words">Показать ответы</button><button class="text-button" data-retry="words">Ещё раз</button><p class="task-summary" aria-live="polite">${count} из ${rows.length} верно</p></div>${wrong.length?`<p class="feedback wrong" role="status">Проверь пары: ${wrong.map(r=>esc(r.prompt)).join(', ')}.</p>`:''}${revealed?`<ul class="connection-solutions">${rows.map(r=>`<li><strong lang="sr-Cyrl">${esc(r.prompt)}</strong> — ${esc(r.answer)}</li>`).join('')}</ul>`:''}</div>`;
}
function drawWordConnections(){
  const board=activity.querySelector('.word-connections');if(!board)return;
  const svg=board.querySelector('.connection-lines'),rect=board.getBoundingClientRect();
  svg.setAttribute('viewBox',`0 0 ${rect.width} ${rect.height}`);
  svg.innerHTML=tasks.words.rows.map((r,i)=>{
    const a=record(`words-${i}`),j=tasks.words.rows.findIndex(r=>r.answer===a.value);if(j<0)return '';
    const left=board.querySelector(`[data-word-side="word"][data-word-index="${i}"]`).getBoundingClientRect();
    const right=board.querySelector(`[data-word-side="translation"][data-word-index="${j}"]`).getBoundingClientRect();
    const x1=left.right-rect.left,y1=left.top+left.height/2-rect.top,x2=right.left-rect.left,y2=right.top+right.height/2-rect.top,m=(x1+x2)/2;
    return `<path class="${a.status}" d="M ${x1} ${y1} C ${m} ${y1}, ${m} ${y2}, ${x2} ${y2}"/>`;
  }).join('');
}
function selectWordEndpoint(side,index){
  if(selectedWord&&selectedWord.side!==side){
    const word=side==='word'?index:selectedWord.index,translation=side==='translation'?index:selectedWord.index,value=tasks.words.rows[translation].answer;
    tasks.words.rows.forEach((_,i)=>{if(i!==word&&record(`words-${i}`).value===value)delete saved.answers[`words-${i}`];});
    saved.answers[`words-${word}`]={value,status:''};selectedWord=null;
  }else selectedWord=selectedWord?.side===side&&selectedWord.index===index?null:{side,index};
  renderActivity();progress();activity.querySelector(`[data-word-side="${side}"][data-word-index="${index}"]`).focus({preventScroll:true});
}
function checkTask(id,reveal=false){selectedWord=null;tasks[id].rows.forEach((r,i)=>{const key=`${id}-${i}`,a=record(key);saved.answers[key]={value:a.value,status:reveal?'revealed':isCorrect(a.value,r)?'correct':'wrong'};});renderActivity();progress();}
function grammarHTML(){return `<div class="table-scroll"><table class="grammar-table"><thead><tr><th>Кто?</th><th>ПРОШЛО</th><th>БУДУЋЕ</th><th>НЕ</th></tr></thead><tbody>${people.map((p,i)=>`<tr><td>${p}</td><td>${pastAux[i]} + гледао / гледала / гледали…</td><td>${futureAux[i]} + гледати</td><td>${pastNeg[i]} / ${futureNeg[i]}</td></tr>`).join('')}</tbody></table></div><div class="models"><div class="model"><strong>Гледали смо.</strong><span>Мы смотрели.</span></div><div class="model"><strong>Гледамо.</strong><span>Мы смотрим.</span></div><div class="model"><strong>Гледаћемо.</strong><span>Мы будем смотреть.</span></div></div><div class="compare"><section><h3>Прошедшее: перфекат</h3><p>Маша <strong>је гледала</strong> цртани.</p><p>Коцкослав <strong>је гледао</strong> цртани.</p><p>Вештице <strong>су гледале</strong> цртани.</p><p>Ванземаљци <strong>су гледали</strong> цртани.</p><p>Род и число важны: -о, -ла, -ло; -ли, -ле, -ла.</p><p>Ићи → <strong>ишао / ишла / ишли</strong>.</p></section><section><h3>Будущее: футур 1</h3><p>Маша <strong>ће гледати</strong> цртани.</p><p><strong>Гледаће</strong> цртани.</p><p>Ми <strong>ћемо ићи</strong> у пећину.</p><p><strong>Ићи ћемо</strong> у пећину.</p><p>С -ти без подлежащего: гледати → гледаћу. С -ћи пишем раздельно: доћи ћу.</p></section></div><p class="note">В вопросе <strong>Хоћете ли да гледате са нама?</strong> из комикса смысл — «Хотите посмотреть с нами?». Для будущего используем <strong>Да ли ћете гледати?</strong> или <strong>Хоћете ли гледати?</strong></p><div class="builder"><div class="segmented" aria-label="Время модели">${['past','present','future'].map(t=>`<button data-model-time="${t}" aria-pressed="${t===modelTime}">${timeLabels[t]}</button>`).join('')}</div><div class="builder-controls"><label>Кто?<select id="model-person">${people.map((p,i)=>`<option value="${i}" ${String(i)===(saved.drafts.modelPerson||'3')?'selected':''}>${p}</option>`).join('')}</select></label><label>Форма в прошлом<select id="model-gender"><option value="masc" ${saved.drafts.modelGender!=='fem'?'selected':''}>мужской / смешанная группа</option><option value="fem" ${saved.drafts.modelGender==='fem'?'selected':''}>женский / женская группа</option></select></label></div><p class="builder-result" id="model-result" role="status"></p></div>`;}
function updateModel(){const i=Number(document.querySelector('#model-person').value),f=document.querySelector('#model-gender').value==='fem';const subject=['Ја','Ти',f?'Она':'Он','Ми','Ви',f?'Оне':'Они'][i];const forms=['гледам','гледаш','гледа','гледамо','гледате','гледају'];const past=i<3?(f?'гледала':'гледао'):(f?'гледале':'гледали');document.querySelector('#model-result').textContent=modelTime==='past'?`${subject} ${pastAux[i]} ${past} цртани.`:modelTime==='present'?`${subject} ${forms[i]} цртани.`:`${subject} ${futureAux[i]} гледати цртани.`;}
function sortHTML(){const card=i=>`<button class="sort-card ${record(`timeline-${i}`).status} ${selectedCard===i?'selected':''}" draggable="true" data-sort-card="${i}" aria-pressed="${selectedCard===i}">${esc(timeline[i][0])}</button>`;return `<p class="task-description">Перетащи предложение в колонку или нажми на него, а затем на название времени. Для возврата выбери предложение и нажми «Вернуть».</p><div class="sort-bank">${timelineOrder.filter(i=>!record(`timeline-${i}`).value).map(card).join('')}</div><div class="sort-columns">${Object.entries(timeLabels).map(([t,label])=>`<section class="sort-column" data-drop="${t}" aria-label="${label}"><h3><button class="drop-target" data-sort-time="${t}">${label}</button></h3>${timelineOrder.filter(i=>record(`timeline-${i}`).value===t).map(card).join('')}</section>`).join('')}</div><button class="text-button sort-return" id="sort-return" ${selectedCard===null?'disabled':''}>Вернуть в набор</button><div class="task-actions"><button id="check-sort" class="button secondary"><i data-lucide="check"></i>Проверить</button><button class="text-button" id="reveal-sort">Показать ответы</button><button class="text-button" id="reset-sort">Ещё раз</button><p id="sort-status" class="task-summary" role="status">${timeline.filter((_,i)=>record(`timeline-${i}`).status==='correct').length} из ${timeline.length} верно</p></div><p class="note">Красть → краду / крали / красти. Украсть → украли / украсти. В некоторых строках меняется и вид глагола: сравни значение действия.</p>`;}
function moveCard(time){if(selectedCard===null)return;saved.answers[`timeline-${selectedCard}`]={value:time,status:''};selectedCard=null;renderActivity();progress();}
function orderHTML(){return `<div class="task"><h3>Собери вопрос</h3><p class="task-description">Нажимай на слова по порядку. Нажатие на слово в собранном вопросе возвращает его в набор.</p>${assembled.map((q,i)=>{const selected=saved.orders[i]||[],a=record(`assembled-${i}`);return `<div class="builder-question" data-assembled="${i}"><h3>${i+1}. ${i<2?'Подарок':i<4?'Мультфильм':i<6?'Сокровища':'Удивление'} · ${i%2===0?'прошлое':'будущее'}</h3><div class="token-answer" aria-label="Собранный вопрос ${i+1}">${selected.map(j=>`<button class="token" data-token-remove="${i}" data-token-index="${j}">${esc(q[1][j])}</button>`).join('')}</div><div class="tokens" aria-label="Слова для вопроса ${i+1}">${q[1].map((w,j)=>selected.includes(j)?'':`<button class="token" data-token-add="${i}" data-token-index="${j}">${esc(w)}</button>`).join('')}</div><button class="text-button" data-order-reset="${i}">Начать заново</button>${a.status?`<p class="feedback ${a.status}" role="status">${esc(a.status==='correct'?'Верно!':a.status==='revealed'?'Пример: '+q[0]:'Проверь порядок слов. Используй весь набор.')}</p>`:''}</div>`;}).join('')}<div class="task-actions"><button class="button secondary" id="check-orders"><i data-lucide="check"></i>Проверить</button><button class="text-button" id="reveal-orders">Показать ответы</button></div></div>`;}
function questionRules(){return `<div class="compare"><section><h3>Прошлое</h3><p>Полина <strong>је добила</strong> поклон.</p><p><strong>Да ли је</strong> Полина добила поклон?</p><p><strong>Је ли</strong> Полина добила поклон?</p><p><strong>Јесте ли</strong> нашли благо?</p><p>Да, <strong>јесмо</strong>. / Не, <strong>нисмо</strong>.</p><p><strong>Када су</strong> нашли благо?</p></section><section><h3>Будущее</h3><p>Полина <strong>ће добити</strong> поклон.</p><p><strong>Да ли ће</strong> Полина добити поклон?</p><p><strong>Хоће ли</strong> Полина добити поклон?</p><p><strong>Хоћете ли</strong> тражити благо?</p><p>Да, <strong>хоћемо</strong>. / Не, <strong>нећемо</strong>.</p><p><strong>Када ће</strong> тражити благо?</p></section></div><p class="note"><strong>Да ли сте…?</strong> = <strong>Јесте ли…?</strong><br><strong>Да ли ћете…?</strong> = <strong>Хоћете ли…?</strong><br>С ли в начале нужны полные формы: јесам, јеси, је, јесмо, јесте, јесу; хоћу, хоћеш, хоће, хоћемо, хоћете, хоће.</p><div class="compare"><section><h3>Отрицательный вопрос</h3><p>Да ли Полина <strong>није добила</strong> поклон?</p><p>Да ли Полина <strong>неће добити</strong> поклон?</p></section><section><h3>Удивление: зар?</h3><p><strong>Зар</strong> Полина није добила поклон?</p><p><strong>Зар</strong> Полина неће добити поклон?</p><p>Разве Полина не получила / не получит подарок?</p></section></div>`;}
function readingHTML(){const c=reading[chapter];return `<div class="reading-tabs" role="tablist" aria-label="Части текста">${reading.map((r,i)=>`<button id="reading-tab-${i}" data-chapter="${i}" role="tab" aria-selected="${chapter===i}" aria-controls="reading-panel" tabindex="${chapter===i?0:-1}">${r[0]}</button>`).join('')}</div><div class="segmented" aria-label="Какое время выделять?">${Object.entries(timeLabels).map(([t,label])=>`<button data-reading-mode="${t}" aria-pressed="${readingMode===t}">${label}</button>`).join('')}</div><p class="task-description">Выбери время и отметь подходящие глагольные формы в каждой части текста.</p><article id="reading-panel" class="reading-text" role="tabpanel" aria-labelledby="reading-tab-${chapter}" lang="sr-Cyrl">${c[1].map((p,j)=>{let index=0;return '<p>'+p.replace(/<v t="\w+">(.*?)<\/v>/g,(_,text)=>{const key=`${chapter}-${j}-${index++}`,mark=saved.marks[key]||'';return `<button class="reading-token" data-reading-key="${key}" data-mark="${mark}" aria-label="${esc(text)}${mark?': '+timeLabels[mark]:''}" aria-pressed="${Boolean(mark)}">${text}</button>`;})+'</p>';}).join('')}</article><div class="task-actions"><button class="button secondary" id="check-reading"><i data-lucide="check"></i>Проверить времена</button><button class="text-button" id="reveal-reading">Показать ответы</button><button class="text-button" id="reset-reading">Снять выделение</button><p id="reading-status" class="task-summary" role="status"></p></div><div class="subsection">${taskHTML('comprehension')}</div><div class="subsection"><h3>Спроси героев</h3><p>Устно составь по одному вопросу о вчерашнем дне и завтрашнем плане. Используй кто, что или когда.</p><textarea class="homework" style="min-height:110px" data-draft="readingQuestions" aria-label="Два вопроса к героям" placeholder="Ко је…? Шта ће…?">${esc(saved.drafts.readingQuestions||'')}</textarea></div>`;}
function giftsHTML(){return `<p class="reading-text" lang="sr-Cyrl">Полина отвара поклоне. Маша јој даје карту Ртња. Коцкослав јој поклања лампу. Ванземаљци јој дају звездану мапу.</p><p class="note"><strong>Дати / давати</strong> — дать / давать. <strong>Поклонити / поклањати</strong> — подарить / дарить.<br>Даём <strong>что?</strong> поклон, мапу, лампу — винительный падеж.<br>Даём <strong>кому?</strong> Полини — дательный: <strong>коме? чему?</strong><br><strong>Јој</strong> = «ей»; пока достаточно понимать эту форму в тексте.</p><ul class="gift-list"><li><strong>Полина → Полини</strong><br>Маша даје Полини поклон.</li><li><strong>Маша → Маши</strong><br>Полина показује Маши мапу.</li><li><strong>Коцкослав → Коцкославу</strong><br>Ванземаљци шаљу Коцкославу поруку.</li><li><strong>Фараон → фараону</strong><br>Полина је послала фараону писмо.</li></ul><p>В прошлом и будущем получатель остаётся тем же: <strong>Маша је дала Полини поклон.</strong> → <strong>Маша ће дати Полини поклон.</strong></p>${taskHTML('dative')}<div class="subsection"><h3>Три подарка</h3><p>Устно расскажи: кто подарил Полине подарок, кто дарит его сейчас и кто подарит завтра.</p><textarea class="homework" style="min-height:130px" data-draft="gifts" aria-label="Три предложения о подарках" placeholder="Маша је дала Полини…">${esc(saved.drafts.gifts||'')}</textarea><p class="note">Лекция 20: дательный падеж — окончания, местоимения и больше практики.</p></div>`;}
function homeworkHTML(){return `<p>Напиши 8–10 предложений: продолжение приключения или рассказ о своём дне рождения.</p><ol class="homework-prompts"><li>Что герои сделали вчера? Не меньше трёх предложений в прошлом.</li><li>Что они будут делать завтра? Не меньше трёх предложений в будущем.</li><li>Добавь вопрос о прошлом и вопрос о будущем.</li><li>Используй одно отрицание и одну фразу с «коме?» — например, Полини.</li></ol><p class="note" lang="sr-Cyrl">Јуче смо… · Полина је… · Сутра ћемо… · Да ли сте…? · Хоћете ли…? · Маша ће дати Полини…</p><label class="writing-label" for="homework-text">Твой текст</label><textarea id="homework-text" class="homework" data-draft="homework" placeholder="Јуче је Полина…">${esc(saved.drafts.homework||'')}</textarea><p id="homework-count" class="writing-counter"></p><div class="task-actions"><button id="review-homework" class="button secondary"><i data-lucide="check"></i>Проверить объём</button><button id="download-homework" class="button"><i data-lucide="download"></i>Скачать текст</button></div><p id="homework-status" role="status"></p><p class="task-description">Окончания, порядок слов и смысл проверь с преподавателем.</p>${saved.finished?'<div class="finish-message"><h3>Урок завершён!</h3><p>Следующая тема — дательный падеж. Черновик и ответы сохранены на этом устройстве.</p><a class="button" href="/lessons">Все уроки</a></div>':''}`;}
function renderActivity(){
  if(current===0)return renderComic();
  const content={1:()=>taskHTML('heroes')+'<p class="note">Перескажи четыре предложения: Полина је… Ванземаљци су…</p>',2:wordConnectionsHTML,3:grammarHTML,4:sortHTML,5:()=>taskHTML('past')+'<div class="subsection">'+taskHTML('future')+'</div>',6:()=>'<div class="note">Гледали смо. → <strong>Нисмо гледали.</strong><br>Гледаћемо. → <strong>Нећемо гледати.</strong><br>Нећу, нећеш, неће, нећемо, нећете пишем слитно.</div>'+taskHTML('negativePast')+'<div class="subsection">'+taskHTML('negativeFuture')+'</div>',7:()=>questionRules()+orderHTML()+'<div class="subsection">'+taskHTML('questionsPast')+'</div><div class="subsection">'+taskHTML('questionsFuture')+'</div><div class="subsection">'+taskHTML('negativeQuestions')+'</div>',8:readingHTML,9:giftsHTML,10:()=>taskHTML('quiz'),11:homeworkHTML}[current];
  activity.innerHTML=content();if(current===2)requestAnimationFrame(drawWordConnections);if(current===3)updateModel();if(current===11)updateHomeworkCount();icons();
}
function renderFeedback(){const key=sections[current][0];document.querySelector('#section-feedback').innerHTML=`<details><summary>Вопрос преподавателю</summary><form id="feedback-form"><label for="feedback-name">Имя</label><input id="feedback-name" data-draft="feedbackName" value="${esc(saved.drafts.feedbackName||'')}" maxlength="80" autocomplete="given-name"><label for="feedback-message">Вопрос или комментарий</label><textarea id="feedback-message" data-draft="feedback-${key}" maxlength="1500" required minlength="2">${esc(saved.drafts[`feedback-${key}`]||'')}</textarea><button class="button" type="submit"><i data-lucide="send"></i>Отправить</button><p id="feedback-status" role="status"></p></form></details>`;}
function sentences(){return (saved.drafts.homework||'').split(/[.!?]+/).map(s=>s.trim()).filter(Boolean);}
function updateHomeworkCount(){document.querySelector('#homework-count').textContent=`Предложений: ${sentences().length}`;}
document.addEventListener('input',e=>{const el=e.target;if(el.dataset.answer){saved.answers[el.dataset.answer]={value:el.value,status:''};const line=el.closest('.question,.match-row');line?.classList.remove('correct','wrong','revealed');line?.querySelector('.feedback')?.remove();progress();}if(el.dataset.draft){saved.drafts[el.dataset.draft]=el.value;if(el.dataset.draft==='homework'){saved.finished=false;updateHomeworkCount();activity.querySelector('.finish-message')?.remove();}progress();}});
document.addEventListener('change',e=>{const el=e.target;if(el.dataset.answer){saved.answers[el.dataset.answer]={value:el.value,status:''};const line=el.closest('.question,.match-row');line?.classList.remove('correct','wrong','revealed');line?.querySelector('.feedback')?.remove();progress();}if(el.id==='model-person'||el.id==='model-gender'){saved.drafts.modelPerson=document.querySelector('#model-person').value;saved.drafts.modelGender=document.querySelector('#model-gender').value;updateModel();persist();}});
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.step!==undefined)return go(Number(b.dataset.step));
  if(b.id==='previous'&&current>0)return go(current-1);
  if(b.id==='next'){if(current===11){const count=sentences().length;if(count<8||count>10){document.querySelector('#navigation-status').textContent='Напиши 8–10 предложений, затем заверши урок.';return;}saved.finished=true;renderActivity();progress();return;}go(current+1);return;}
  if(b.id==='comic-prev'&&frame>0){frame--;renderComic();}if(b.id==='comic-next'&&frame<11){frame++;renderComic();}if(b.id==='translation'){translated=!translated;renderComic();}
  if(b.dataset.wordSide)return selectWordEndpoint(b.dataset.wordSide,Number(b.dataset.wordIndex));
  if(b.dataset.check)checkTask(b.dataset.check);if(b.dataset.reveal)checkTask(b.dataset.reveal,true);if(b.dataset.retry){selectedWord=null;tasks[b.dataset.retry].rows.forEach((_,i)=>delete saved.answers[`${b.dataset.retry}-${i}`]);renderActivity();progress();}
  if(b.dataset.modelTime){modelTime=b.dataset.modelTime;activity.querySelectorAll('[data-model-time]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.modelTime===modelTime)));updateModel();}
  if(b.dataset.sortCard!==undefined){selectedCard=Number(b.dataset.sortCard);renderActivity();}if(b.dataset.sortTime)moveCard(b.dataset.sortTime);if(b.id==='sort-return')moveCard('');
  if(b.id==='check-sort'||b.id==='reveal-sort'){timeline.forEach((r,i)=>{const a=record(`timeline-${i}`);saved.answers[`timeline-${i}`]={value:b.id==='reveal-sort'?r[1]:a.value,status:b.id==='reveal-sort'?'revealed':a.value===r[1]?'correct':'wrong'};});selectedCard=null;renderActivity();progress();}
  if(b.id==='reset-sort'){timeline.forEach((_,i)=>delete saved.answers[`timeline-${i}`]);selectedCard=null;renderActivity();progress();}
  if(b.dataset.tokenAdd!==undefined||b.dataset.tokenRemove!==undefined){const i=Number(b.dataset.tokenAdd??b.dataset.tokenRemove),j=Number(b.dataset.tokenIndex),order=saved.orders[i]||[];saved.orders[i]=b.dataset.tokenAdd!==undefined?(order.includes(j)?order:[...order,j]):order.filter(n=>n!==j);delete saved.answers[`assembled-${i}`];renderActivity();progress();}
  if(b.dataset.orderReset!==undefined){const i=Number(b.dataset.orderReset);delete saved.orders[i];delete saved.answers[`assembled-${i}`];renderActivity();progress();}
  if(b.id==='check-orders'||b.id==='reveal-orders'){assembled.forEach((q,i)=>{const order=saved.orders[i]||[],text=order.map(j=>q[1][j]).join(' ');saved.answers[`assembled-${i}`]={value:text,status:b.id==='reveal-orders'?'revealed':order.length===q[1].length&&normalize(text)===normalize(q[0])?'correct':'wrong'};});renderActivity();progress();}
  if(b.dataset.chapter!==undefined){chapter=Number(b.dataset.chapter);renderActivity();}
  if(b.dataset.readingMode){readingMode=b.dataset.readingMode;activity.querySelectorAll('[data-reading-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.readingMode===readingMode)));}
  if(b.dataset.readingKey){const key=b.dataset.readingKey;if(saved.marks[key]===readingMode)delete saved.marks[key];else saved.marks[key]=readingMode;b.dataset.mark=saved.marks[key]||'';b.setAttribute('aria-pressed',String(Boolean(saved.marks[key])));b.classList.remove('wrong');progress();}
  if(b.id==='check-reading'){let count=0;readingTokens.forEach(t=>{if(saved.marks[t.key]===t.time)count++;});activity.querySelectorAll('[data-reading-key]').forEach(el=>{const t=readingTokens.find(t=>t.key===el.dataset.readingKey);el.classList.toggle('wrong',saved.marks[t.key]!==t.time);});document.querySelector('#reading-status').textContent=`${count} из ${readingTokens.length} форм определено верно. Проверь все три части текста.`;progress();}
  if(b.id==='reveal-reading'){activity.querySelectorAll('[data-reading-key]').forEach(el=>{const t=readingTokens.find(t=>t.key===el.dataset.readingKey);el.dataset.mark=t.time;});document.querySelector('#reading-status').textContent='Ответы показаны для этой части. Отметь формы самостоятельно, чтобы сохранить результат.';}
  if(b.id==='reset-reading'){saved.marks={};renderActivity();progress();}
  if(b.id==='review-homework'){const count=sentences().length;document.querySelector('#homework-status').textContent=count>=8&&count<=10?'Объём подходит. Сверь текст с четырьмя условиями задания.':`Сейчас ${count} предложений. Нужно 8–10.`;}
  if(b.id==='download-homework'){const url=URL.createObjectURL(new Blob([saved.drafts.homework||''],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.target='_self';a.download='ty-serb-lesson19-homework.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
});
document.addEventListener('dragstart',e=>{const card=e.target.closest('[data-sort-card]');if(card){selectedCard=Number(card.dataset.sortCard);e.dataTransfer.setData('text/plain',String(selectedCard));e.dataTransfer.effectAllowed='move';}});
document.addEventListener('dragover',e=>{if(e.target.closest('[data-drop]'))e.preventDefault();});
document.addEventListener('drop',e=>{const col=e.target.closest('[data-drop]');if(!col)return;e.preventDefault();const n=Number(e.dataTransfer.getData('text/plain'));if(!Number.isInteger(n)||n<0||n>=timeline.length)return;selectedCard=n;moveCard(col.dataset.drop);});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('input[data-answer]')){e.preventDefault();checkTask(e.target.dataset.answer.replace(/-\d+$/,''));}if(e.target.matches('[role=tab]')&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();chapter=(chapter+(e.key==='ArrowRight'?1:2))%3;renderActivity();document.querySelector(`#reading-tab-${chapter}`).focus();}});
document.addEventListener('submit',async e=>{if(e.target.id!=='feedback-form')return;e.preventDefault();const section=sections[current][0],form=e.target,button=form.querySelector('button[type=submit]'),status=form.querySelector('#feedback-status');button.disabled=true;status.textContent='Отправляем…';try{const response=await fetch('/api/lesson-feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lessonSlug:'polinin-rodjendan',section:`l19-${section}`,name:form.querySelector('#feedback-name').value,message:form.querySelector('#feedback-message').value})});const data=await response.json();if(!response.ok)throw new Error(data.error||'Не получилось отправить сообщение.');status.textContent='Сообщение отправлено преподавателю.';delete saved.drafts[`feedback-${section}`];form.querySelector('#feedback-message').value='';persist();}catch(error){status.textContent=error.message||'Не получилось отправить сообщение. Попробуй ещё раз.';}finally{button.disabled=false;}});
window.addEventListener('resize',drawWordConnections);
render();
