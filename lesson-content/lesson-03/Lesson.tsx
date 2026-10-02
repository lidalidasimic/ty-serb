"use client";
import { Fragment, useEffect, useRef, useState } from "react";
import { Check, RotateCcw, ArrowRight, Volume2, CircleCheck } from "lucide-react";
import { sections, tracks, comic, taxi, nations, moreNations, vocabulary, exercises, countrySentences, homework, type Question } from "./content";
import { transcripts } from "./transcripts";

function shuffled<T>(values:T[], seed:number) {
  const result=[...values];
  for(let i=result.length-1;i>0;i--) { seed=(seed*9301+49297)%233280; const j=seed%(i+1); [result[i],result[j]]=[result[j],result[i]]; }
  return result;
}
const latin="a b v g d đ e ž z i j k l lj m n nj o p r s t ć u f h c č dž š".split(" ");
const cyrillic="а б в г д ђ е ж з и ј к л љ м н њ о п р с т ћ у ф х ц ч џ ш".split(" ");
function normalize(value:string) {
  return value.toLowerCase().normalize("NFC").replace(/dž|lj|nj|[a-zđžćčš]/g, letter=>cyrillic[latin.indexOf(letter)]??letter).replace(/[.,!?]/g,"").trim().replace(/\s+/g," ");
}
function Audio({id,base}:{id:string;base:string}) {
  const ref=useRef<HTMLAudioElement>(null);
  const [speed,setSpeed]=useState("1");
  const [error,setError]=useState(false);
  const src=`${base}/audio/${id}.m4a`;
  return <div className="narration">
    <div className="audio"><h3><Volume2 size={19} aria-hidden/>{tracks[id]}</h3>
      <audio ref={ref} controls preload="none" aria-label={tracks[id]} src={src} onError={()=>setError(true)}
        onPlay={()=>{setError(false); document.querySelectorAll("audio").forEach(other=>{if(other!==ref.current)other.pause();});}}/>
      <label className="audio-speed">Скорость <select aria-label={`Скорость: ${tracks[id]}`} value={speed} onChange={event=>{setSpeed(event.target.value);if(ref.current)ref.current.playbackRate=Number(event.target.value);}}>
        <option value="0.75">0,75×</option><option value="1">1×</option><option value="1.25">1,25×</option><option value="1.5">1,5×</option>
      </select></label>
      {error&&<p role="alert">Не удалось загрузить аудио. <a href={src}>Открыть запись</a></p>}
    </div>
    {transcripts[id]&&<div className="transcript"><p className="eyebrow">ТЕКСТ АУДИО</p><p>{transcripts[id]}</p></div>}
  </div>;
}
function Exercise({id,title,rows,mode="select",onComplete}:{id:string;title:string;rows:Question[];mode?:"select"|"input"|"choice";onComplete?:(done:boolean)=>void}) {
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [checked,setChecked]=useState(false);
  const [round,setRound]=useState(0);
  const correct=rows.reduce((sum,row,i)=>sum+row.answers.filter((answer,j)=>normalize(answers[`${i}-${j}`]||"")===normalize(answer)).length,0);
  const total=rows.reduce((sum,row)=>sum+row.answers.length,0);
  const update=(key:string,value:string)=>{setAnswers({...answers,[key]:value});setChecked(false);onComplete?.(false);};
  return <div className="exercise" id={`exercise-${id}`}><h3>{title}</h3>
    {rows.map((row,i)=><div className="question" key={i}>
      <div className="question-line"><span className="question-number">{i+1}.</span><div className="sentence">
        {row.text.split("___").map((part,j)=><Fragment key={j}>{part}{j<row.answers.length&&mode!=="choice"&&(()=>{
          const key=`${i}-${j}`; const isCorrect=normalize(answers[key]||"")===normalize(row.answers[j]);
          const className=checked?(isCorrect?"ok":"bad"):"";
          return mode==="input"?<input aria-label={`${title}, ${row.text.replaceAll("___","пропуск")}, ответ ${j+1}`} autoComplete="off" spellCheck={false} className={className} value={answers[key]||""} onChange={e=>update(key,e.target.value)}/>:<select aria-label={`${title}, строка ${i+1}, ответ ${j+1}`} className={className} value={answers[key]||""} onChange={e=>update(key,e.target.value)}><option value="">Выбери</option>{shuffled(row.choices?.[j]||[...new Set(rows.flatMap(r=>r.answers))],i*31+j*7+round+11).map(value=><option key={value} value={value}>{value}</option>)}</select>;
        })()}{j<row.answers.length&&mode==="choice"&&<span className="blank">{answers[`${i}-${j}`]||"…"}</span>}</Fragment>)}
      </div></div>
      {mode==="choice"&&<div className="choices" role="group" aria-label={`${title}, строка ${i+1}`}>{shuffled(row.choices?.[0]||row.answers,i*31+round+11).map(value=><button key={value} type="button" aria-pressed={answers[`${i}-0`]===value} className={answers[`${i}-0`]===value?(checked?(value===row.answers[0]?"ok":"bad"):"selected"):""} onClick={()=>update(`${i}-0`,value)}>{value}</button>)}</div>}
      {checked&&<p className={row.answers.every((a,j)=>normalize(answers[`${i}-${j}`]||"")===normalize(a))?"feedback correct":"feedback incorrect"}>{row.answers.every((a,j)=>normalize(answers[`${i}-${j}`]||"")===normalize(a))?"Тачно!":`Тачно: ${row.answers.join(" · ")}`}</p>}
    </div>)}
    <div className="actions"><button onClick={()=>{setChecked(true);onComplete?.(correct===total);}}><Check size={18} aria-hidden/>Проверить</button><button onClick={()=>{setAnswers({});setChecked(false);setRound(round+1);onComplete?.(false);}}><RotateCcw size={18} aria-hidden/>Повторить</button></div>
    {checked&&<p className="score" role="status">Результат: <b>{correct} / {total}</b>{correct===total?" · Браво!":" · Исправь ошибки и попробуй ещё раз."}</p>}
  </div>;
}
function WordOrder({id,title,items}:{id:string;title:string;items:{label:string;words:string[]}[]}) {
  const [answers,setAnswers]=useState<Record<number,number[]>>({});
  const [checked,setChecked]=useState(false);
  const [round,setRound]=useState(0);
  const correct=(i:number)=>normalize((answers[i]||[]).map(index=>items[i].words[index]).join(" "))===normalize(items[i].words.join(" "));
  return <div className="exercise" id={`exercise-${id}`}><h3>{title}</h3>{items.map((item,i)=><div className="question" key={item.label}>
    <p className="prompt">{i+1}. {item.label}</p>
    <div className={`answer-bank ${checked?(correct(i)?"ok":"bad"):""}`} aria-label={`Предложение ${i+1}`}>
      {(answers[i]||[]).length===0?<span className="empty-answer">…</span>:(answers[i]||[]).map((index,j)=><button key={index} title="Убрать слово" aria-label={`Убрать слово ${item.words[index]}`} onClick={()=>{setAnswers({...answers,[i]:(answers[i]||[]).filter((_,k)=>k!==j)});setChecked(false);}}>{item.words[index]}</button>)}
    </div>
    <div className="word-bank" role="group" aria-label={`Слова для предложения ${i+1}`}>{shuffled(item.words.map((word,index)=>({word,index})),i*13+round+17).map(({word,index})=><button key={index} disabled={(answers[i]||[]).includes(index)} onClick={()=>{setAnswers({...answers,[i]:[...(answers[i]||[]),index]});setChecked(false);}}>{word}</button>)}</div>
    {checked&&<p className={correct(i)?"feedback correct":"feedback incorrect"}>{correct(i)?"Тачно!":item.words.join(" ")}</p>}
  </div>)}<div className="actions"><button onClick={()=>setChecked(true)}><Check size={18} aria-hidden/>Проверить</button><button onClick={()=>{setAnswers({});setChecked(false);setRound(round+1);}}><RotateCcw size={18} aria-hidden/>Повторить</button></div>{checked&&<p role="status" className="score">Результат: <b>{items.filter((_,i)=>correct(i)).length} / {items.length}</b></p>}</div>;
}
function Dialogue({lines}:{lines:string[][]}) {
  const [translation,setTranslation]=useState(false);
  return <div className="reading"><div className="reading-toolbar"><button aria-pressed={translation} onClick={()=>setTranslation(!translation)}>{translation?"Скрыть перевод":"Русский перевод"}</button></div>
    <div className="dialogue" lang="sr">{lines.map(([speaker,text,ru],i)=><div key={i}><p><b>{speaker}:</b> {text}</p>{translation&&<p className="translation" lang="ru">{ru}</p>}</div>)}</div>
  </div>;
}
function GrammarTable({title,headers,rows}:{title:string;headers:string[];rows:string[][]}) {
  return <div className="table-wrap"><table><caption>{title}</caption><thead><tr>{headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>j===0?<th key={j} scope="row">{cell}</th>:<td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>;
}
function LearningApp({id,title}:{id:string;title:string}) {
  const url=`https://learningapps.org/watch?v=${id}`;
  return <details className="extra"><summary>{title} · LearningApps</summary><iframe src={url} title={title} loading="lazy" allowFullScreen/><a href={url} target="_blank" rel="noreferrer">Открыть отдельно</a></details>;
}
export default function Lesson({base="/lesson-03"}:{base?:string}) {
  const [active,setActive]=useState("intro");
  const [visited,setVisited]=useState<string[]>([]);
  const [checks,setChecks]=useState<boolean[]>([false,false,false,false]);
  const [testDone,setTestDone]=useState(false);
  const [finished,setFinished]=useState(false);
  const progressRef=useRef<HTMLElement>(null);
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){setActive(entry.target.id);setVisited(prev=>prev.includes(entry.target.id)?prev:[...prev,entry.target.id]);}});},{rootMargin:"-130px 0px -55% 0px"});
    sections.forEach(([id])=>{const element=document.getElementById(id);if(element)observer.observe(element);});
    const onScroll=()=>{const height=document.documentElement.scrollHeight-innerHeight;if(progressRef.current)progressRef.current.style.width=`${height>0?Math.min(100,scrollY/height*100):0}%`;};
    addEventListener("scroll",onScroll,{passive:true});onScroll();return()=>{observer.disconnect();removeEventListener("scroll",onScroll);};
  },[]);
  const audio=(id:string)=><Audio id={id} base={base}/>;
  const quiz=(id:string,title:string,mode:"select"|"input"|"choice"="select")=><Exercise id={id} title={title} rows={exercises[id]} mode={mode}/>;
  return <main className="lesson-three">
    <div className="reading-progress" aria-hidden><i ref={progressRef}/></div>
    <nav className="lesson-navigation" aria-label="Разделы лекции"><div className="wrap brandbar"><a href="https://ty-serb.vercel.app/lessons" target="_top">TY <span>SERB</span></a><b>ЛЕКЦИЯ 03</b><span>A1</span></div><div className="wrap">
      <div className="lesson-rail">{sections.map(([id,title],i)=><a key={id} href={`#${id}`} title={title} aria-label={`${i+1}. ${title}`} aria-current={active===id?"location":undefined} className={`${active===id?"active":""} ${visited.includes(id)?"visited":""}`}>{String(i+1).padStart(2,"0")}</a>)}</div><p className="rail-caption">{sections.find(([id])=>id===active)?.[1]}</p>
    </div></nav>
    <div className="wrap">
      <header id="intro"><p className="eyebrow">ЛЕКЦИЯ 03 · A1</p><h1>Национальности.<br/><em>Множественное число.</em></h1><p className="lead">Земље и људи · Множина именица · Присвојне заменице</p>{audio("00-intro")}</header>
      <section id="comic"><p className="eyebrow">01 · ЧИТАЕМ И СЛУШАЕМ</p><h2>Је ли ово неки виц?</h2>{audio("01-comic")}<figure className="comic"><a href={`${base}/comic.png`} target="_blank" rel="noreferrer"><img src={`${base}/comic.png`} alt="Гости из разных стран знакомятся с официантом в белградском кафе" width="1055" height="1485"/></a></figure><h3>Текст комикса</h3><Dialogue lines={comic}/>{audio("02-comic-translation")}</section>
      <section id="countries"><p className="eyebrow">02 · ЗЕМЉЕ И ЉУДИ</p><h2>Земље и националности</h2><GrammarTable title="Ко је одакле?" headers={["Земља","Он","Она","Они","Језик"]} rows={nations.map(n=>n.slice(0,5))}/>
        <aside>Названия стран и национальностей пишем с большой буквы: <b>Русија, Рус, Рускиња</b>. Названия языков и прилагательные — с маленькой: <b>руски језик, српска књига</b>.</aside>
        {audio("03-countries-instruction")}{quiz("match","Соедини страну, людей и язык")}
        <LearningApp id="p94zapbya26" title="Националности"/>
        <h3>Ещё несколько стран</h3>{audio("04-more-countries")}<GrammarTable title="Новые национальности" headers={["Земља","Он","Она","Прилагательное"]} rows={moreNations.map(([country,man,woman,adj])=>[country,man,woman,`${adj} / ${adj.slice(0,-1)}а / ${adj.slice(0,-1)}о`])}/>
        <h3>Как использовать?</h3>{audio("05-usage")}<div className="examples"><p><b>Ја сам из Русије.</b><br/><span>Я из России.</span></p><p><b>Она је из Немачке.</b><br/><span>Она из Германии.</span></p><p><b>Он је Србин. Она је Српкиња.</b><br/><span>Он серб. Она сербка.</span></p><p><b>Да ли сте Ви Рускиња?</b><br/><span>Вы русская?</span></p></div>
        <aside>После <b>из</b> меняется название страны: Србија → <b>из Србије</b>, Немачка → <b>из Немачке</b>, Јапан → <b>из Јапана</b>.</aside>
        <WordOrder id="countries" title="Упражнение 1. Ответь по образцу" items={countrySentences}/>
        {audio("06-nationalities-instruction")}{quiz("nationality","Упражнение 2. Скажи национальность","choice")}
      </section>
      <section id="taxi"><p className="eyebrow">03 · НОВЫЙ ДИАЛОГ</p><h2>Мачкослав и Јасмина у Скадарлији</h2>{audio("07-plural-intro")}{audio("08-taxi-dialogue")}<Dialogue lines={taxi}/>{audio("09-taxi-translation")}{quiz("understanding","Понимаешь ли ты диалог?","choice")}</section>
      <section id="plural"><p className="eyebrow">04 · МНОЖИНА ИМЕНИЦА</p><h2>Один мост. Много мостов.</h2>{audio("10-plural-explanation")}<p>В именительном падеже окончания зависят от рода и строения слова. Учи новую форму вместе со словом: <b>мост — мостови</b>, <b>улица — улице</b>, <b>место — места</b>.</p><aside>Уточнение к аудио: <b>чорбе, сира, кајмака</b> после <b>има</b> — родительный падеж единственного числа. Множина в диалоге: <b>мостови, улице, певачи, кафане, мишеви</b>.</aside>
        <h3>Мушки род · Мужской род</h3>{audio("11-masculine")}<GrammarTable title="Мужской род: основные модели" headers={["Модель","Једнина","Множина"]} rows={[["Согласная + -и","студент / певач","студенти / певачи"],["Короткие слова: часто -ови","мост / град / парк","мостови / градови / паркови"],["У ряда слов: -еви","миш / нож","мишеви / ножеви"],["Чередование к → ц","речник / ученик","речници / ученици"],["Выпадает а","Немац / странац","Немци / странци"],["Мужской род на -а","колега","колеге"],["Особая форма","човек","људи"]]}/><p>Окончания <b>-ови / -еви</b> нельзя выбирать только по длине слова: есть исключения. Запоминай пару целиком. Колега — мужской род, хотя слово оканчивается на -а.</p>
        <h3>Женски род · Женский род</h3>{audio("12-feminine")}<GrammarTable title="Женский род: -е и -и" headers={["Модель","Једнина","Множина"]} rows={[["-а → -е","улица / књига / тврђава","улице / књиге / тврђаве"],["Согласная + -и","ствар / реч / ноћ","ствари / речи / ноћи"]]}/>
        <h3>Средњи род · Средний род</h3>{audio("13-neuter")}<GrammarTable title="Средний род: -а и особые формы" headers={["Модель","Једнина","Множина"]} rows={[["-о → -а","место / село","места / села"],["-е → -а","море / поље / питање","мора / поља / питања"],["Основа расширяется","име / време","имена / времена"],["Особая форма","дете","деца"]]}/><aside><b>Деца</b> — особая форма. В предложении: <b>Деца су ту.</b> Не образуем форму «дети».</aside>
        <GrammarTable title="Ещё несколько важных форм" headers={["Једнина","Множина"]} rows={[["дан","дани"],["ђак","ђаци"],["дијалог","дијалози"],["орах","ораси"],["презиме","презимена"]]}/><p>Слова <b>наочаре</b> (очки), <b>маказе</b> (ножницы), <b>панталоне</b> (брюки) обычно употребляются только во множественном числе. Их нельзя механически вернуть в единственное число.</p>
        {audio("14-plural-practice")}{quiz("plural","Вежба 1. Напиши множественное число","input")}{quiz("singular","Вежба 2. Верни единственное число","input")}{quiz("number","Вежба 3. Једнина или множина?","choice")}
      </section>
      <section id="words"><p className="eyebrow">05 · НОВЕ РЕЧИ</p><h2>Слова из диалога</h2><dl className="word-list">{vocabulary.map(([sr,ru])=><div key={sr}><dt lang="sr">{sr}</dt><dd>{ru}</dd></div>)}</dl>{quiz("words","Соедини слова с переводом")}<LearningApp id="pm0khj7yj26" title="Нове речи"/></section>
      <section id="possessives"><p className="eyebrow">06 · ПРИСВОЈНЕ ЗАМЕНИЦЕ</p><h2>Чији? Чија? Чије?</h2><p>Притяжательное местоимение согласуется с предметом, о котором говорим. <b>Мој брат, моја сестра, моје дете</b> — владелец один и тот же, но формы разные.</p>{audio("15-possessive-singular")}
        <GrammarTable title="Једнина · Единственное число" headers={["Владелец","Чији? · м. р.","Чија? · ж. р.","Чије? · ср. р."]} rows={[["ја","мој брат","моја сестра","моје дете"],["ти","твој брат","твоја сестра","твоје дете"],["ми","наш брат","наша сестра","наше дете"],["ви","ваш брат","ваша сестра","ваше дете"]]}/>
        {quiz("possessiveSingular","Вежбање 1.1. Чей это предмет?","choice")}
        {audio("16-possessive-plural")}<GrammarTable title="Множина · Множественное число" headers={["Владелец","Чији? · м. р.","Чије? · ж. р.","Чија? · ср. р."]} rows={[["ја","моји другари","моје књиге","моја места"],["ти","твоји другари","твоје књиге","твоја места"],["ми","наши другари","наше књиге","наша места"],["ви","ваши другари","ваше књиге","ваша места"]]}/>
        <aside>Во множественном числе: <b>-и</b> для мужского рода, <b>-е</b> для женского, <b>-а</b> для среднего. Сравни: <b>моја сестра</b> — одна сестра, <b>моја места</b> — несколько мест.</aside>{quiz("possessivePlural","Вежбање 2.2. Кому принадлежат эти вещи?","choice")}
      </section>
      <section id="practice"><p className="eyebrow">07 · ПРАКТИКА</p><h2>Знакомимся и разговариваем</h2>{quiz("biti","Упражнение 1. Вставь глагол бити")}{quiz("nationalityBiti","Упражнение 2. Бити и национальность")}<p>В строках с <b>ја</b> и <b>ми</b> здесь говорим от лица мужчины и смешанной группы.</p>
        <h3>Упражнение 3. Два знакомства</h3>{quiz("dialogueA","А. Стефан и Мајкл")}<p lang="sr">— Тако је. Ја сам из Србије. Драго ми је.<br/>— Драго ми је.</p>{quiz("dialogueB","Б. Добар дан!")}<p lang="sr">— Извињавам се, довиђења!</p>
        <h3>Упражнение 4. Продолжи диалоги</h3><p lang="sr">— Добар дан! Пасош, молим вас.<br/>— Изволите.</p>{quiz("passport","А. На паспортном контроле")}<p lang="sr">— Добро, изволите. Довиђења!</p><p lang="sr">— Добар дан!<br/>— Добар дан!</p>{quiz("classroom","Б. В новой группе")}
        <div className="writing"><label htmlFor="own-dialogue">Твой диалог знакомства</label><textarea id="own-dialogue" rows={5} placeholder="— Ћао! Ја сам…"/></div>
      </section>
      <section id="homework"><p className="eyebrow">08 · ДОМАЋИ ЗАДАТАК</p><h2>Теперь твоя очередь</h2><WordOrder id="homework" title="1. Переведи на сербский: собери предложения" items={homework}/><Exercise id="homework-number" title="2. Једнина или множина?" rows={exercises.number} mode="choice"/><LearningApp id="p47euoumk26" title="Једнина или множина?"/><p className="music">Для самостоятельного прослушивания: <b>Bajaga — Moji drugovi</b>. Обрати внимание на форму <b>моји другови</b>.</p></section>
      <section id="recap"><p className="eyebrow">09 · ИТОГИ</p><h2>Шта сада умем?</h2><Exercise id="final" title="Мини-тест" rows={exercises.final} mode="choice" onComplete={done=>{setTestDone(done);if(!done)setFinished(false);}}/><div className="checklist">{["Могу сказать, откуда я и какой я национальности.","Умею образовать основные формы множественного числа.","Выбираю мој, твој, наш и ваш по роду и числу.","Заполняю диалог формами глагола бити."].map((text,i)=><label key={text}><input type="checkbox" checked={checks[i]} onChange={e=>{setChecks(checks.map((v,j)=>j===i?e.target.checked:v));setFinished(false);}}/><span>{text}</span></label>)}</div>
        <button className="finish" disabled={!testDone||!checks.every(Boolean)} onClick={()=>setFinished(true)}><CircleCheck size={20} aria-hidden/>Завершить лекцию</button>{finished&&<p className="completion" role="status">Браво! Лекција 3 је завршена.</p>}<a className="next-lesson" href="https://ty-serb.vercel.app/lessons/prilagatelnye" target="_top">Следующая лекция<ArrowRight size={18} aria-hidden/></a>
      </section><footer><b>TY SERB</b><span>ЛЕКЦИЯ 03 · Лидија Симић</span></footer>
    </div>
  </main>;
}
