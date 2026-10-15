'use strict';
const KEY='wordquest_v1'; const DAY=86400000; const $=id=>document.getElementById(id);
const SAMPLE=[['achieve','달성하다','동사','You can achieve your dream.'],['opportunity','기회','명사','This is a great opportunity.'],['improve','향상시키다','동사','I want to improve my English.'],['environment','환경','명사','We must protect the environment.'],['challenge','도전','명사','This challenge is difficult.'],['discover','발견하다','동사','They discover a new place.'],['necessary','필요한','형용사','Sleep is necessary for health.'],['experience','경험','명사','It was a good experience.'],['confident','자신감 있는','형용사','She feels confident today.'],['decide','결정하다','동사','I decide to study tonight.']];
const DICT=Object.fromEntries(SAMPLE.map(a=>[a[0],a]));Object.assign(DICT,Object.fromEntries([['important','중요한','형용사'],['beautiful','아름다운','형용사'],['different','다른','형용사'],['because','왜냐하면','접속사'],['however','그러나','부사'],['future','미래','명사'],['remember','기억하다','동사'],['understand','이해하다','동사'],['education','교육','명사'],['knowledge','지식','명사'],['success','성공','명사'],['develop','발전시키다','동사'],['practice','연습하다','동사'],['school','학교','명사'],['student','학생','명사'],['teacher','선생님','명사'],['language','언어','명사'],['English','영어','명사'],['science','과학','명사'],['history','역사','명사'],['question','질문','명사'],['answer','대답','명사'],['example','예시','명사'],['problem','문제','명사'],['solution','해결책','명사'],['prepare','준비하다','동사'],['explain','설명하다','동사'],['imagine','상상하다','동사'],['believe','믿다','동사'],['protect','보호하다','동사'],['respect','존중하다','동사'],['create','창조하다','동사'],['healthy','건강한','형용사'],['energy','에너지','명사'],['culture','문화','명사'],['society','사회','명사'],['nature','자연','명사'],['information','정보','명사'],['computer','컴퓨터','명사'],['technology','기술','명사'],['activity','활동','명사'],['favorite','가장 좋아하는','형용사']].map(a=>[a[0].toLowerCase(),[a[0].toLowerCase(),a[1],a[2],'']])));
const stop=new Set('a an the am is are was were be been being i you he she it we they my your his her our their me him us them this that these those and or but if then than of in on at to for from by with as do does did have has had will would can could should shall not no yes very so just more most much many some any all each every who what where when why how which there here about into over under again also out up down one two three four five ten its s t d ll ve re m'.split(' '));
function today(){return new Date().toLocaleDateString('en-CA')}function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now()+'_'+Math.random().toString(36).slice(2)}function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}function load(){try{let s=JSON.parse(localStorage.getItem(KEY));if(s&&Array.isArray(s.words))return s}catch(e){}return {words:[],xp:0,history:{},settings:{dailyGoal:10},created:Date.now()}}let db=load(),view='home',draft=[],session=null,quiz=null,deckFilter='all';function save(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){toast('저장 공간 부족: 데이터를 내보내세요.')}}function toast(message){let el=$('toast');el.textContent=message;el.classList.remove('hidden');clearTimeout(window._toast);window._toast=setTimeout(()=>el.classList.add('hidden'),3300)}function award(xp){db.xp+=xp;db.history[today()]=(db.history[today()]||0)+xp;save();updateBadge()}
const NAV=[['home','⌂','홈'],['course','📅','800단어'],['deck','▤','단어장'],['study','✦','복습'],['quiz','⚔','퀴즈'],['monsters','◈','도감'],['hero','🛡','용사']];function nav(to){view=to;render();window.scrollTo(0,0)}function updateBadge(){let lv=Math.floor(db.xp/200)+1;$('levelBadge').textContent=`Lv. ${lv} ${lv>=10?'마스터':lv>=5?'탐험가':'루키'}`}
function render(){ensureMonsters();ensureHero();updateBadge();$('pageTitle').textContent=({home:'대시보드',course:'33일 단어 모험',scan:'사진 한 장으로 등록',deck:'나의 단어장',study:'간격 반복 복습',quiz:'단어 배틀',monsters:'몬스터 도감',hero:'나의 용사'})[view];for(let id of ['sidenav','bottomnav'])$(id).innerHTML=NAV.map(([key,ic,label])=>`<button class="${view===key?'on':''}" data-nav="${key}"><b>${ic}</b> ${label}</button>`).join('');$('view').innerHTML=({home:home,course:course,scan:scan,deck:deck,study:study,quiz:quizView,monsters:monstersView,hero:heroView})[view]();document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>nav(b.dataset.nav));bindView()}
function dueWords(){return db.words.filter(w=>(w.reps||0)>0&&(!w.due||w.due<=Date.now())).concat(db.words.filter(w=>w.source!=='elementary800'&&!(w.reps||0)&&(!w.due||w.due<=Date.now())))}function streak(){let n=0,dt=new Date();if(!db.history[today()])dt.setDate(dt.getDate()-1);for(let i=0;i<365;i++){let key=dt.toLocaleDateString('en-CA');if(!db.history[key])break;n++;dt.setDate(dt.getDate()-1)}return n}

// Original fantasy creatures belong to WORD QUEST and are intentionally unrelated to existing franchises.
const SPECIES=[
 ['voltkit','볼키트','번개','#71B9FF','⚡',1],['embercub','엠버큐브','불꽃','#FB9B63','🔥',2],['sproutle','스프라우틀','숲','#6DD9A1','🌿',3],
 ['bubblin','버블린','물','#7BCEF4','💧',4],['stonepup','스톤퍼프','대지','#C5A98D','🪨',5],['glimfox','글림폭스','빛','#EAD17B','✨',6],
 ['mistfin','미스트핀','안개','#B6A3E9','🌫',7],['frostip','프로스팁','얼음','#8FDEF2','❄',8],['thornox','쏜옥스','숲','#70C78F','🍀',9],
 ['sparkray','스파크레이','번개','#A1A8FF','⚡',10],['moonowl','문아울','밤','#A59BDF','🌙',11],['flarehorn','플레어혼','불꽃','#F7A27A','🔥',12]
];
function ensureMonsters(){if(!db.monsters||typeof db.monsters!=='object')db.monsters={owned:[],partner:null,claims:[],wins:{},reviews:{},events:[]};let m=db.monsters;m.owned=Array.isArray(m.owned)?m.owned:[];m.claims=Array.isArray(m.claims)?m.claims:[];m.wins=m.wins||{};m.reviews=m.reviews||{};m.events=Array.isArray(m.events)?m.events:[];if(!m.partner&&m.owned.length)m.partner=m.owned[0].id;}
function monsterArt(id,stage=1){
 const ix=Math.max(0,SPECIES.findIndex(s=>s[0]===id)),sp=SPECIES[ix],c=sp[3],dark='#182841';
 const head=(extra='')=>`<ellipse cx="105" cy="97" rx="46" ry="42" fill="${c}" stroke="${dark}" stroke-width="5"/>${extra}<ellipse cx="89" cy="99" rx="5" ry="8" fill="${dark}"/><ellipse cx="122" cy="99" rx="5" ry="8" fill="${dark}"/><path d="M99 120 Q106 128 113 120" fill="none" stroke="${dark}" stroke-width="3" stroke-linecap="round"/>`;
 const body=`<ellipse cx="106" cy="152" rx="51" ry="36" fill="${c}" stroke="${dark}" stroke-width="5"/><ellipse cx="105" cy="158" rx="28" ry="22" fill="#ffffff" opacity=".25"/><path d="M72 176 L65 190 M139 176 L146 190" stroke="${dark}" stroke-width="9" stroke-linecap="round"/>`;
 const shapes=[
 // wolf: pointed ears, muzzle, lightning tail
 `<path d="M66 78 L62 22 L91 62 M121 61 L157 21 L149 87" fill="${c}" stroke="${dark}" stroke-width="5"/>${body}${head('<path d="M98 111 L106 115 L114 111" stroke="white" fill="white"/>')}<path d="M150 151 L183 112 L170 146 L196 137 L163 185" fill="#fbe476" stroke="${dark}" stroke-width="4"/>`,
 // dragon: wings, horns, long tail
 `<path d="M70 142 Q22 91 26 55 L63 81 L73 48 L97 132 M137 130 L166 51 L177 83 L196 57 Q200 116 147 154" fill="#f67a51" stroke="${dark}" stroke-width="5"/>${body}<path d="M145 170 Q195 208 187 145" fill="none" stroke="${c}" stroke-width="20"/>${head('<path d="M70 62 L77 28 L93 62 M119 63 L137 29 L145 75" fill="#fff0bb" stroke="'+dark+'" stroke-width="4"/>')}`,
 // turtle: huge shell and leafy crown
 `<ellipse cx="107" cy="143" rx="75" ry="53" fill="#2e8866" stroke="${dark}" stroke-width="6"/><path d="M71 104 L106 91 L143 109 L151 150 L107 179 L64 150Z" fill="${c}" stroke="#205c4a" stroke-width="5"/><path d="M106 91 V179 M64 150 L143 109 M71 104 L151 150" stroke="#23684c" stroke-width="3"/>${head('<path d="M100 52 Q70 23 95 14 Q120 24 105 52 M111 48 Q116 16 143 25 Q142 44 111 55" fill="#c9f37f" stroke="'+dark+'" stroke-width="3"/>')}`,
 // axolotl aquatic with gills
 `<path d="M59 94 L28 65 L22 88 L47 105 L23 119 L33 138 L61 119 M151 92 L180 65 L191 86 L163 104 L190 126 L178 143 L150 117" fill="#a3eefa" stroke="${dark}" stroke-width="4"/>${body}${head()}<path d="M88 178 Q104 193 120 178" stroke="#fff" stroke-width="5" fill="none"/>`,
 // stone golem: angular face arms
 `<path d="M35 116 L59 101 L73 132 L56 173 L28 151 M142 127 L161 101 L190 126 L182 156 L157 170" fill="#9a8570" stroke="${dark}" stroke-width="5"/><path d="M73 125 L90 105 L129 108 L157 133 L142 183 L74 185 L54 148Z" fill="${c}" stroke="${dark}" stroke-width="5"/><path d="M64 65 L92 49 L142 52 L159 82 L145 121 L80 124 L56 91Z" fill="#b6a092" stroke="${dark}" stroke-width="5"/><path d="M82 85 L99 90 L93 99 M122 91 L139 83 L136 100" stroke="${dark}" stroke-width="6" fill="none"/>`,
 // light fox, many tails
 `<path d="M135 161 Q203 144 183 89 Q168 126 151 127 Q193 99 164 68 Q145 111 135 132" fill="#ffedaa" stroke="${dark}" stroke-width="5"/>${body}<path d="M62 80 L53 27 L86 61 M121 61 L159 28 L148 88" fill="${c}" stroke="${dark}" stroke-width="5"/>${head('<path d="M95 122 L107 143 L119 122" fill="#fff9e8"/>')}`,
 // fog jelly ghost
 `<path d="M57 86 Q60 33 107 34 Q157 32 162 91 L172 168 L151 156 L134 176 L111 160 L90 181 L69 158 L44 172Z" fill="${c}" stroke="${dark}" stroke-width="5"/><ellipse cx="88" cy="105" rx="9" ry="12" fill="${dark}"/><ellipse cx="129" cy="105" rx="9" ry="12" fill="${dark}"/><path d="M100 125 Q108 132 118 125" stroke="${dark}" stroke-width="4" fill="none"/><circle cx="55" cy="43" r="10" fill="#fff" opacity=".5"/><circle cx="180" cy="57" r="7" fill="#fff" opacity=".4"/>`,
 // ice penguin
 `<path d="M62 95 L39 121 L31 148 L70 130 M149 95 L179 119 L188 151 L145 131" fill="${c}" stroke="${dark}" stroke-width="5"/>${body}${head('<path d="M99 113 L109 126 L119 113Z" fill="#ffbc65" stroke="'+dark+'" stroke-width="2"/>')}<path d="M78 60 L105 20 L132 60" fill="#d0fbff" stroke="${dark}" stroke-width="4"/>`,
 // forest ox/horns
 `<path d="M64 92 Q20 94 34 42 Q53 75 81 68 M136 72 Q168 74 186 36 Q197 99 151 100" fill="#d5e8a3" stroke="${dark}" stroke-width="5"/>${body}${head('<ellipse cx="106" cy="115" rx="18" ry="14" fill="#e5faaf"/><circle cx="100" cy="116" r="3" fill="'+dark+'"/><circle cx="113" cy="116" r="3" fill="'+dark+'"/>')}`,
 // electric manta ray
 `<path d="M106 47 Q70 83 19 103 L53 139 L75 124 L106 182 L138 124 L160 139 L198 103 Q143 80 106 47Z" fill="${c}" stroke="${dark}" stroke-width="5"/><path d="M105 181 L95 195 L115 186" fill="#e5f4ff"/><circle cx="88" cy="107" r="6" fill="${dark}"/><circle cx="124" cy="107" r="6" fill="${dark}"/><path d="M98 122 Q106 128 113 122" fill="none" stroke="${dark}" stroke-width="3"/>`,
 // owl
 `<path d="M63 80 L49 36 L85 59 M129 60 L163 34 L153 91" fill="${c}" stroke="${dark}" stroke-width="5"/>${body}<ellipse cx="105" cy="97" rx="51" ry="52" fill="${c}" stroke="${dark}" stroke-width="5"/><circle cx="86" cy="100" r="20" fill="#fff5d9"/><circle cx="127" cy="100" r="20" fill="#fff5d9"/><circle cx="90" cy="99" r="8" fill="${dark}"/><circle cx="123" cy="99" r="8" fill="${dark}"/><path d="M100 118 L112 118 L106 131Z" fill="#ffbf6e"/>`,
 // fire stag
 `<path d="M70 76 Q43 38 47 16 L65 38 L77 15 L89 67 M128 67 L143 17 L154 40 L173 17 Q181 49 146 79" fill="#ffdf76" stroke="${dark}" stroke-width="5"/>${body}${head()}<path d="M145 164 Q191 173 184 133" fill="none" stroke="#ff9865" stroke-width="12"/>`
 ];
 let power=stage===3?`<path d="M108 17 L119 38 L143 35 L131 54 L139 72 L108 61 L78 72 L88 52 L76 35 L99 38Z" fill="#f7db77" stroke="#fff4be" stroke-width="3" opacity=".9"/>`:stage===2?`<path d="M78 32 L87 43 M129 32 L138 43" stroke="#ffe9a2" stroke-width="6"/>`:'';
 return `<svg viewBox="0 0 220 205" class="creature-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(sp[1])} ${stage}단계"><ellipse cx="108" cy="193" rx="69" ry="9" fill="#000" opacity=".22"/><g ${stage===3?'transform="translate(-10,-15) scale(1.10)"':stage===2?'transform="translate(-5,-7) scale(1.05)"':''}>${shapes[ix]}${power}</g>${stage>=2?`<g fill="#fff0a7"><circle cx="30" cy="35" r="4"/><circle cx="186" cy="45" r="5"/></g>`:''}${stage===3?`<g stroke="#f9ec94" stroke-width="3"><path d="M15 101 L31 97 M185 101 L205 93 M108 9 L108 23"/></g>`:''}</svg>`;
}
function monsterStage(m){return m.reviews>=30&&m.mastered>=8?3:m.reviews>=8&&m.mastered>=3?2:1}
function creatureCard(mon,compact=false){let c=SPECIES.find(x=>x[0]===mon.species)||SPECIES[0],stage=monsterStage(mon);return `<div class="monster-card ${compact?'compact':''}"><div class="monster-picture">${monsterArt(mon.species,stage)}</div><div class="spread"><strong>${esc(mon.nickname||c[1])}</strong><span class="tag">${stage}단계</span></div><p class="muted" style="margin:4px 0">${c[4]} ${c[2]} · 복습 ${mon.reviews||0}회 · 숙련 ${mon.mastered||0}</p><div class="bar"><div style="width:${Math.min(100,stage===3?100:stage===2?Math.min(100,(mon.reviews/30)*100):Math.min(100,(mon.reviews/8)*100))}%"></div></div>${!compact?`<button class="btn small ${db.monsters.partner===mon.id?'success':'secondary'}" style="margin-top:12px;width:100%" data-partner="${esc(mon.id)}">${db.monsters.partner===mon.id?'★ 나의 파트너':'파트너 지정'}</button>`:''}</div>`}
function deckStats(){let names=[...new Set(db.words.map(w=>w.deck))];return names.map(deck=>{let words=db.words.filter(w=>w.deck===deck);let correct=words.filter(w=>w.reps>0).length;return {deck,words,correct,qualifies:words.length>=4&&correct>=Math.min(10,words.length),claimed:db.monsters.claims.includes(deck)}})}
function claimMonster(deck){let item=deckStats().find(d=>d.deck===deck);if(!item||!item.qualifies||item.claimed)return;let ix=db.monsters.owned.length%SPECIES.length,sp=SPECIES[ix];db.monsters.owned.push({id:uid(),species:sp[0],nickname:sp[1],fromDeck:deck,reviews:0,mastered:0,created:Date.now()});db.monsters.claims.push(deck);if(!db.monsters.partner)db.monsters.partner=db.monsters.owned[0].id;save();toast(`🎉 ${sp[1]} 포획 성공!`);render()}
function growMonster(w,grade){ensureMonsters();let mon=db.monsters.owned.find(m=>m.id===db.monsters.partner);if(!mon)return;let k=`${mon.id}:${w.id}`;let log=db.monsters.reviews[k]||{count:0,mastered:false};log.count++;mon.reviews++;if(grade===2&&w.interval>=7&&!log.mastered){log.mastered=true;mon.mastered++}db.monsters.reviews[k]=log;}
function monstersView(){let owned=db.monsters.owned,stats=deckStats();return `<section class="hero game-hero"><div class="tag">◈ 몬스터 연구소</div><h1>배운 단어로 동료를 모아라!</h1><p class="muted">단어장 복습 → 몬스터 포획 → 파트너 육성 → 진화</p><div class="flex"><span class="tag">포획 ${owned.length} / ${SPECIES.length}종</span><span class="tag">현재 파트너 ${esc((SPECIES.find(s=>s[0]===owned.find(m=>m.id===db.monsters.partner)?.species)||['','없음'])[1])}</span></div></section><h3 class="sectiontitle">포획 가능한 단어장</h3><div class="panel">${stats.length?stats.map(d=>`<div class="spread capture-row"><div><strong>${esc(d.deck)}</strong><div class="muted">훈련 완료 단어 ${d.correct}/${Math.min(10,d.words.length)}개 · 단어 ${d.words.length}개</div></div><button class="btn small ${d.claimed?'secondary':'success'}" data-claim="${esc(d.deck)}" ${!d.qualifies||d.claimed?'disabled':''}>${d.claimed?'포획 완료':d.qualifies?'알 부화!':'훈련 필요'}</button></div>`).join(''):'<p class="muted">먼저 사진에서 단어장을 만들어 보세요. 4개 이상 등록하고 복습하면 포획 기회가 열립니다.</p>'}</div><div class="spread"><h3 class="sectiontitle">나의 몬스터 · ${owned.length}마리</h3><span class="muted">3단계까지 성장</span></div>${owned.length?`<div class="monster-grid">${owned.map(m=>creatureCard(m)).join('')}</div>`:'<div class="panel empty">🥚 아직 동료가 없어요. 첫 단어장을 복습하면 몬스터가 나타납니다.</div>'}<h3 class="sectiontitle">몬스터 도감</h3><div class="monster-grid">${SPECIES.map(sp=>{let found=owned.some(m=>m.species===sp[0]);return `<div class="bestiary-slot ${found?'':'locked'}"><div class="monster-picture">${monsterArt(sp[0],1)}</div><strong>${found?esc(sp[1]):'???'}</strong><span class="muted">${found?sp[4]+' '+sp[2]:'미발견'}</span></div>`}).join('')}</div><div class="notice">진화 조건: 2단계는 파트너 복습 8회 + 숙련 단어 3개, 3단계는 복습 30회 + 숙련 단어 8개입니다. 숙련 단어는 7일 이상 복습 간격을 달성한 경우입니다. 포획은 단어장당 1회, 몬스터 도감은 총 12종입니다.</div>`}

/* ====== 초등 필수 800단어 코스 · 기존 OCR 코드와 분리 ====== */
function seed800(){
 db.settings=db.settings||{};if(!Number.isInteger(db.settings.activeDay)||db.settings.activeDay<1||db.settings.activeDay>33)db.settings.activeDay=1;
 const existing=new Set(db.words.filter(w=>w.source==='elementary800').map(w=>String(w.day)+':'+w.order));
 let changed=false;
 WORDS800.forEach((item,i)=>{const k=item.day+':'+i;if(existing.has(k))return;
 db.words.push({id:'e800-'+i,en:item.en,ko:item.ko,pos:'',example:'',deck:item.day===0?'초등800 · 워밍업':item.day===-1?'초등800 · 기능어':`초등800 · DAY ${item.day}`,day:item.day,category:item.category,order:i,source:'elementary800',created:Date.now(),due:null,interval:0,ease:2.5,reps:0,miss:0});changed=true;});
 if(changed)save();
}
function activeDay(){return db.settings?.activeDay||1}
function courseWords(day){return db.words.filter(w=>w.source==='elementary800'&&w.day===day).sort((a,b)=>a.order-b.order)}
function startDay(day){db.settings.activeDay=day;save();let a=courseWords(day);session={ids:a.map(w=>w.id),idx:0,flip:false,kind:'day'};nav('study')}
function startReview(){session={ids:dueWords().map(w=>w.id),idx:0,flip:false,kind:'review'};nav('study')}
function course(){const day=activeDay(),daily=courseWords(day),done=daily.filter(w=>w.reps>0).length, studied=db.words.filter(w=>w.source==='elementary800'&&w.day>0&&w.reps>0).length,due=dueWords().length;
 return `<section class="hero game-hero"><div class="game-hero-copy"><span class="tag">📚 초등 필수 800단어</span><h1>33일 영어 단어 모험</h1><p class="muted">매일 20개씩, 배운 단어는 잊을 때쯤 다시 복습해요.</p><div class="flex"><span class="tag">학습 ${studied}/657</span><span class="tag">오늘 복습 ${due}개</span></div></div><div class="hero-monster">${monsterArt(db.monsters.owned.find(m=>m.id===db.monsters.partner)?.species||'voltkit',1)}</div></section>
 <div class="grid2"><div class="panel"><strong>📅 DAY ${day} · ${esc(daily[0]?.category||'단어 학습')}</strong><p class="muted">이 DAY에서 학습한 단어 ${done}/${daily.length}개</p><div class="bar"><div style="width:${done/daily.length*100}%"></div></div><button class="btn" style="margin-top:14px" data-start-day="${day}">DAY ${day} 학습 시작</button></div><div class="panel"><strong>🧠 오늘의 간격 반복 복습</strong><p class="muted">복습 시간이 된 단어 ${due}개</p><button class="btn secondary" data-start-review>복습 시작 (${due})</button></div></div>
 <h3 class="sectiontitle">DAY 선택</h3><div class="day-grid">${Array.from({length:33},(_,i)=>{const d=i+1,a=courseWords(d),n=a.filter(w=>w.reps>0).length;return `<button class="day-tile ${day===d?'active':''}" data-choose-day="${d}"><strong>DAY ${d}</strong><span>${n}/${a.length} 학습</span><small>${esc(a[0]?.category||'')}</small></button>`}).join('')}</div>
 <h3 class="sectiontitle">추가 단어</h3><div class="grid2"><div class="panel"><strong>🌈 워밍업 · 36개</strong><p class="muted">숫자와 색깔을 가볍게 확인해요.</p><button class="btn secondary small" data-start-day="0">워밍업 학습</button></div><div class="panel"><strong>🔤 기초 기능어 · 107개</strong><p class="muted">문장에서 자주 사용하는 기초 단어예요.</p><button class="btn secondary small" data-start-day="-1">기능어 학습</button></div></div>`;
}
function home(){const day=activeDay(),due=dueWords().length,studied=db.words.filter(w=>w.source==='elementary800'&&w.day>0&&w.reps>0).length,partner=db.monsters.owned.find(m=>m.id===db.monsters.partner),lv=Math.floor(db.xp/200)+1;
 return `<section class="hero game-hero"><div class="game-hero-copy"><span class="tag">⚡ WORD QUEST · 800단어</span><h1>외우고, 포획하고,<br>진화시켜라!</h1><p class="muted">DAY ${day}부터 오늘의 단어 모험을 시작하세요.</p><div class="flex"><button class="btn" data-go="course">📅 오늘의 DAY 학습</button><button class="btn secondary" data-start-review>🧠 복습 ${due}개</button></div></div><div class="hero-monster">${monsterArt(partner?.species||'voltkit',partner?monsterStage(partner):1)}<div class="hero-monster-title">${partner?'나의 파트너 '+esc(partner.nickname):'첫 몬스터를 만나보세요'}</div></div></section>
 <div class="stats"><div class="stat"><span class="muted">📚 DAY 학습</span><strong>${studied}/657</strong></div><div class="stat"><span class="muted">🔥 연속 학습</span><strong>${streak()}일</strong></div><div class="stat"><span class="muted">⚡ 레벨</span><strong>Lv.${lv}</strong></div></div>
 <h3 class="sectiontitle">모험 이어가기</h3><div class="grid2"><div class="panel"><strong>📅 초등 필수 800단어</strong><p class="muted">DAY 1~33, 워밍업, 기초 기능어</p><button class="btn small" data-go="course">DAY 학습 선택</button></div><div class="panel"><strong>🧠 간격 반복 복습</strong><p class="muted">기억 수준에 맞춰 복습일이 자동으로 조정돼요.</p><button class="btn small secondary" data-start-review>오늘 복습 (${due}개)</button></div><div class="panel"><strong>⚔ 단어 배틀</strong><p class="muted">현재 DAY와 학습한 단어로 퀴즈를 풀어보세요.</p><button class="btn small secondary" data-go="quiz">배틀 도전</button></div><div class="panel"><strong>🥚 몬스터 연구소</strong><p class="muted">단어 학습으로 몬스터를 포획하고 성장시켜요.</p><button class="btn small success" data-go="monsters">도감 보기</button></div></div><p class="footer">학습 기록은 현재 브라우저에 보관됩니다. 정기적으로 단어장 메뉴에서 백업해 주세요.</p>`;
}
function oldHome(){let known=db.words.filter(w=>w.interval>=7).length,due=dueWords().length,level=Math.floor(db.xp/200)+1,progress=db.xp%200,partner=db.monsters.owned.find(m=>m.id===db.monsters.partner);return `<section class="hero game-hero"><div class="game-hero-copy"><span class="tag">⚡ 오늘의 퀘스트</span><h1>외우고, 포획하고,<br>진화시켜라!</h1><p class="muted">교과서 속 단어가 몬스터와 만나는 모험.</p><div class="flex"><button class="btn" data-go="scan">📸 단어 수집</button><button class="btn secondary" data-go="study">✦ 단어 훈련 ${due}개</button></div></div><div class="hero-monster">${monsterArt(partner?.species||'voltkit',partner?monsterStage(partner):1)}<div class="hero-monster-title">${partner?'나의 파트너 '+esc(partner.nickname):'첫 동료를 만나보세요'}</div></div></section><div class="stats"><div class="stat"><span class="muted">⚡ 총 XP</span><strong>${db.xp.toLocaleString()}</strong></div><div class="stat"><span class="muted">🔥 연속 학습</span><strong>${streak()}일</strong></div><div class="stat"><span class="muted">◈ 동료 몬스터</span><strong>${db.monsters.owned.length}마리</strong></div></div><h3 class="sectiontitle">레벨과 성장</h3><div class="panel"><div class="spread"><strong>Lv. ${level} → Lv. ${level+1}</strong><span class="muted">${progress}/200 XP</span></div><div class="bar" style="margin:14px 0"><div style="width:${progress/2}%"></div></div><div class="muted">기억한 단어 ${known}개 · 현재 복습 ${due}개 · 전체 단어 ${db.words.length}개</div></div><div class="panel" style="margin-top:16px"><strong>🛡 나의 용사 육성</strong><p class="muted">영단어 훈련과 퀴즈 XP로 용사를 키워보세요.</p><button class="btn secondary small" data-go="hero">용사 성장 확인 →</button></div><h3 class="sectiontitle">오늘의 학습</h3><div class="grid2"><div class="panel"><strong>🧠 오늘의 단어 훈련</strong><p class="muted">새 단어 학습과 반복 훈련으로 성장해요.</p><button class="btn small" data-go="study">훈련 시작</button></div><div class="panel"><strong>⚔ 단어 배틀</strong><p class="muted">시험 대비 4지선다 퀴즈</p><button class="btn small secondary" data-go="quiz">배틀 도전</button></div></div><h3 class="sectiontitle">나의 모험 · 기타</h3><div class="grid2"><div class="panel"><strong>🥚 몬스터 연구소</strong><p class="muted">학습 보상으로 몬스터를 포획하고 육성해요.</p><button class="btn success small" data-go="monsters">연구소 가기</button></div><div class="panel"><strong>🎒 체험용 단어장</strong><p class="muted">테스트용 단어 10개를 추가해 볼 수 있어요.</p><button class="btn small secondary" id="seedDemo" ${db.words.some(w=>w.deck==='체험: 중학 필수단어')?'disabled':''}>연습 데이터 추가</button></div></div><p class="footer">현재 학습 데이터는 이 브라우저에 저장됩니다. PC·스마트폰 간 자동 동기화는 아직 지원하지 않습니다.</p>`}
function seedDemo(){if(db.words.some(w=>w.deck==='체험: 중학 필수단어'))return;SAMPLE.forEach(row=>db.words.push({id:uid(),en:row[0],ko:row[1],pos:row[2],example:row[3],deck:'체험: 중학 필수단어',created:Date.now(),due:Date.now(),interval:0,ease:2.5,reps:0,miss:0}));save();toast('체험 단어장 10개가 생성됐어요!');nav('study')}

let pendingImage=null;
let captureDeck='영어 단어 '+today(), captureLast=[],captureTotal=0,capturePhotos=0,captureStatus='',scanBusy=false;
function scan(){
 const dubious=db.words.filter(w=>w.deck===captureDeck&&w.needsReview).length;
 return `<section class="hero"><span class="tag">📷 v0.5 · 연속 촬영</span><h1>찍으면 단어장 완성!</h1><p class="muted">사진 찍기, 파일 선택, 복사한 이미지 붙여넣기(Ctrl+V) · 모두 무료</p>
<label for="deckname">모으고 있는 단어장</label><input id="deckname" value="${esc(captureDeck)}" placeholder="예: 중1 영어 3과">
<div class="scan-actions"><button class="btn" id="cameraBtn">📸 사진 찍기</button><button class="btn secondary" id="uploadBtn">🖼 사진 여러 장 선택</button></div>
<input class="hidden" type="file" id="cameraInput" accept="image/*" capture="environment"><input class="hidden" type="file" id="uploadInput" accept="image/*" multiple>
<div id="dropZone" class="drop-zone" tabindex="0">📋 복사한 사진 붙여넣기 · 파일 드래그<small>PC: Ctrl+V / Mac: ⌘V</small></div>
<div id="previewArea" class="${captureStatus?'':'hidden'}"><p class="muted" id="ocrStatus" aria-live="polite">${esc(captureStatus)}</p></div>
${lastOcrText?`<details class="panel" style="margin-bottom:15px"><summary style="cursor:pointer">🔍 인식 원문 보기 (마지막 사진)</summary><pre style="white-space:pre-wrap;font-size:12px;color:#c8d9f8;max-height:260px;overflow:auto;margin:10px 0 0">${esc(lastOcrText)}</pre></details>`:''}
<div class="panel"><strong>📚 이번 단어장: ${esc(captureDeck)}</strong><p class="muted">이번 촬영 ${capturePhotos}장 · 추가된 단어 ${captureTotal}개 · ⚠ 확인 필요 ${dubious}개</p><div class="flex"><button class="btn success" id="trainNow" ${!db.words.length?'disabled':''}>✦ 단어 훈련 시작</button><button class="btn secondary small" id="seeDeck">단어장 보기</button><button class="btn secondary small" id="undoCapture" ${!captureLast.length?'disabled':''}>↶ 마지막 등록 취소</button></div></div>
<div class="notice">단어와 뜻이 나란히 있는 사진을 우선 지원합니다. 한 페이지씩, 정면에서, 그림자 없이 찍으면 인식률이 올라가요. 확실하지 않은 글자는 ⚠ 표시하고, 잘못 읽힌 결과는 수정할 수 있습니다. 초기 OCR 엔진 다운로드에는 인터넷이 필요하며 API 사용료는 없습니다.</div>
<div class="flex"><button class="btn secondary small" id="demoBtn">예시 단어 추가</button><button class="btn secondary small" id="pasteTextToggle">텍스트 붙여넣기</button></div><div id="manualText" class="hidden" style="margin-top:12px"><textarea id="sourceText" placeholder="apple 사과&#10;book 책"></textarea><button class="btn" id="textImportBtn">같은 단어장에 추가</button></div></section>`;
}

/* ================= OCR v0.5 ================= */
// 가로줄 단위로 읽기. 결과가 나쁘면 '4'(열 단위)나 '3'(자동)으로 바꿔 비교해 보세요.
const OCR_PSM='6';
let lastOcrText='',ocrWorkerPromise=null;
const KO=/[가-힣]/;

function cleanMeaning(t){
 return String(t||'')
  .replace(/\[[^\]가-힣]*\]/g,' ')                    // [발음기호]
  .replace(/\/[^\/가-힣]*\//g,' ')                    // /발음기호/ (한글이 들어 있으면 보존)
  .replace(/[□■●◯◌✓☑]+/g,' ')
  .replace(/^\s*\d{1,3}[.)]\s*/,'')
  .replace(/^\s*(?:n|v|adj|adv|prep|conj|pron|int)\.\s*/i,'')
  .replace(/^\s*[\[(〈【<]\s*[명동형부전접대감]\s*[\])〉】>]\s*/,'') // [명] (동) 같은 박스 품사
  .replace(/^\s*[명동형부전접대감](?:[.)]\s*|\s+)/,'')              // 맨 앞 단독 품사: "동 달성하다"
  .replace(/\s+/g,' ')
  .replace(/^[\s:：,·-]+|[\s:：,·-]+$/g,'')
  .slice(0,75);
}

function rowCandidates(raw){
 const result=[];
 const lines=String(raw||'').replace(/\r/g,'').split('\n').map(x=>x.trim()).filter(Boolean);
 for(let line of lines){
  line=line.replace(/^[□■☐☑✓●○\s]+/,'').replace(/^\s*\d{1,3}[.)]?\s*/,'');
  if(!KO.test(line))continue;
  // "1 apple 사과  26 bird 새"처럼 한 줄에 여러 항목이 있으면 번호 기준으로 분리
  const chunks=line.split(/(?=\s+\d{1,3}[.)]?\s+[A-Za-z])/g);
  for(let chunk of chunks){
   chunk=chunk.trim().replace(/^\d{1,3}[.)]?\s*/,'').replace(/^([A-Za-z][A-Za-z'’/-]*(?:\s+[A-Za-z][A-Za-z'’/-]*){0,2})\s+(?:v|n|adj|adv)\.\s+(?=[가-힣])/,'$1 ');
   const m=chunk.match(/^([A-Za-z][A-Za-z'’/-]*(?:\s+[A-Za-z][A-Za-z'’/-]*){0,2})\s*(?:[:：=–—-]\s*)?([\s\S]*[가-힣][\s\S]*)$/);
   if(!m)continue;
   const en=m[1].trim().toLowerCase().replace(/\s+/g,' '),ko=cleanMeaning(m[2]);
   if(en.length>28||!ko||en.split(' ').some(x=>x.length===1&&!['a','i'].includes(x)))continue;
   if(/^(i|you|he|she|they|we|this|that|where|there|tell|do you|have you)\s/i.test(en)&&en.includes(' '))continue;
   if(ko.length>55)continue;
   result.push({en,ko,uncertain:ko.length>37});
  }
 }
 return result;
}

function lineText(line){return line.text||((line.words||[]).map(w=>w.text).join(' '))||''}
function bbox(line){return line.bbox||{x0:0,x1:0,y0:0,y1:0}}

// 영어만 있는 줄 → 같은 높이에서 오른쪽에 있는 가장 가까운 한글 줄과 연결
// (Tesseract가 영어 열과 한글 열을 따로 읽었을 때를 위한 처리)
function pairByRow(lines){
 const HEAD=/^\s*(?:\d{1,3}[.)]?\s*)?([A-Za-z][A-Za-z'’-]*(?:\s+[A-Za-z][A-Za-z'’-]*){0,2})\s*$/;
 const heads=[],kos=[];
 for(const l of lines){
  if(KO.test(l.text)){kos.push(l);continue}
  const m=l.text.match(HEAD);
  if(m&&m[1].length>=2&&m[1].length<=28)heads.push({...l,en:m[1].toLowerCase()});
 }
 const mid=b=>(b.y0+b.y1)/2,out=[];
 for(const e of heads){
  const tol=Math.max(8,e.box.y1-e.box.y0)*0.7,ec=mid(e.box);
  const sameRow=b=>Math.abs(mid(b)-ec)<=tol;
  let best=null,bestDx=Infinity;
  for(const k of kos){
   if(k.box.x0<e.box.x1-5||!sameRow(k.box))continue;
   const dx=k.box.x0-e.box.x1;
   if(dx>=bestDx)continue;
   // 사이에 다른 영어 단어가 있으면 그 단어의 뜻이므로 건너뜀
   if(heads.some(o=>o!==e&&sameRow(o.box)&&o.box.x0>=e.box.x1&&o.box.x1<=k.box.x0))continue;
   best=k;bestDx=dx;
  }
  if(!best)continue;
  const ko=cleanMeaning(best.text.split(/\s+\d{1,3}[.)]?\s+[A-Za-z]/)[0]);
  if(ko)out.push({en:e.en,ko,uncertain:Math.min(e.conf,best.conf)<60});
 }
 return out;
}

function structuredCandidates(data){
 const lines=(data?.lines||[]).map(l=>({text:lineText(l).trim(),box:bbox(l),conf:l.confidence??100})).filter(l=>l.text);
 if(!lines.length)return rowCandidates(data?.text||'');
 const candidates=[...pairByRow(lines)];
 // 두 단으로 된 시트는 물리적 열로 나눈 뒤, 가까운 영어/한글끼리만 연결
 const xmax=Math.max(...lines.map(l=>l.box.x1||0)),xmin=Math.min(...lines.map(l=>l.box.x0||0)),half=(xmin+xmax)/2;
 const groups=xmax>0?[lines.filter(l=>(l.box.x0+l.box.x1)/2<half),lines.filter(l=>(l.box.x0+l.box.x1)/2>=half)]:[lines];
 for(const group of groups){
  const sorted=[...group].sort((a,b)=>a.box.y0-b.box.y0||a.box.x0-b.box.x0);
  for(let i=0;i<sorted.length;i++){
   const l=sorted[i],direct=rowCandidates(l.text);
   if(direct.length){candidates.push(...direct);continue}
   const em=l.text.match(/^\s*(?:\d{1,3}[.)]?\s*)?([A-Za-z][A-Za-z'’/-]*(?:\s+[A-Za-z][A-Za-z'’/-]*){0,2})\s*$/);
   if(!em)continue;
   const en=em[1].toLowerCase();if(en.length>28)continue;
   const k=sorted.slice(i+1,i+3).find(next=>KO.test(next.text)&&next.box.y0-l.box.y1<Math.max(45,(l.box.y1-l.box.y0)*2.2)&&next.box.y0>=l.box.y0-6);
   if(k)candidates.push({en,ko:cleanMeaning(k.text),uncertain:true});
  }
 }
 return candidates.length?candidates:rowCandidates(data.text||'');
}

function importCandidates(candidates,deck){
 const created=[],unique=new Set();let uncertain=0;
 for(const c of candidates){
  const en=c.en?.trim().toLowerCase();
  if(!en||en.length>35||!/[a-z]{2}/.test(en)||unique.has(en)||db.words.some(w=>w.deck===deck&&w.en===en))continue;
  unique.add(en);
  let ko=cleanMeaning(c.ko),pos=c.pos||'',fromDict=false;
  // 뜻 인식에 실패했지만 내장 사전에 있는 단어면 사전 뜻으로 채움
  if(!ko&&DICT[en]){ko=DICT[en][1];pos=pos||DICT[en][2]||'';fromDict=true}
  const needsReview=!ko||(!!c.uncertain&&!fromDict);
  if(needsReview)uncertain++;
  const w={id:uid(),en,ko:ko||'⚠ 뜻 확인 필요',needsReview,pos,example:'',deck,created:Date.now(),due:Date.now(),interval:0,ease:2.5,reps:0,miss:0};
  db.words.push(w);created.push(w.id);
 }
 save();captureLast=created;captureTotal+=created.length;
 captureStatus=`${created.length}개 추가 · ${uncertain}개 확인 필요. 다음 사진을 추가하거나 바로 공부하세요.`;toast(captureStatus);
 return created.length;
}

function importRecognized(text,deck){const candidates=rowCandidates(text);if(!candidates.length){toast('단어+뜻이 있는 줄을 찾지 못했어요.');return}importCandidates(candidates,deck);render()}

// 저해상도에서 한국어 인식이 실패해도 영어 표제어는 살림
function headwordCandidates(data){
 const lines=(data?.lines||[]).map(l=>({text:lineText(l).trim(),box:bbox(l),confidence:l.confidence??50})).filter(l=>l.text);
 if(!lines.length)return [];
 const found=[];
 for(const l of lines){
  const m=l.text.match(/^\s*(?:[□☐○●]\s*)?([a-zA-Z][a-zA-Z'-]{1,23})(?=\s|$|[^a-zA-Z])/);
  if(!m)continue;
  const en=m[1].toLowerCase();
  if(/^(the|this|that|your|there|where|write|example|lesson|english|word|name|page|unit|v|n|adj)$/.test(en))continue;
  const korean=l.text.slice(m[0].length).replace(/^[^가-힣]+/,'');
  const meaning=(korean.match(/[가-힣][가-힣\s,./~·-]*/)||[])[0]||'';
  found.push({en,ko:cleanMeaning(meaning),uncertain:!meaning||l.confidence<65});
 }
 return found;
}

function mergeCandidates(primary,extra){
 const map=new Map();
 for(const x of [...primary,...extra]){
  if(!x.en||!/^[a-z][a-z\s'-]{1,34}$/i.test(x.en))continue;
  const en=x.en.toLowerCase().trim(),old=map.get(en);
  if(!old||(!old.ko&&x.ko)||((x.ko||'').length>(old.ko||'').length&&x.ko&&!x.uncertain))map.set(en,x);
 }
 return [...map.values()];
}

// 크기와 상관없이 항상 흑백 + 자동 대비 보정 (폰 사진에도 적용)
async function preparedImage(file){
 let img;
 try{img=await createImageBitmap(file,{imageOrientation:'from-image'})}catch(e){img=await createImageBitmap(file)}
 const long=Math.max(img.width,img.height);
 const scale=long<1600?Math.min(3,2000/long):long>3000?3000/long:1;
 const canvas=document.createElement('canvas');
 canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);
 const ctx=canvas.getContext('2d',{willReadFrequently:true});
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 ctx.drawImage(img,0,0,canvas.width,canvas.height);
 const px=ctx.getImageData(0,0,canvas.width,canvas.height),d=px.data;
 const hist=new Uint32Array(256),gray=new Uint8Array(d.length/4);
 for(let i=0,j=0;i<d.length;i+=4,j++){const v=(.299*d[i]+.587*d[i+1]+.114*d[i+2])|0;gray[j]=v;hist[v]++}
 // 어두운 쪽·밝은 쪽 2%를 잘라내고 그 사이를 0~255로 늘림
 const cut=gray.length*.02;let lo=0,hi=255,acc=0;
 while(lo<254&&(acc+=hist[lo])<cut)lo++;
 acc=0;while(hi>lo+1&&(acc+=hist[hi])<cut)hi--;
 const range=hi-lo;
 for(let i=0,j=0;i<d.length;i+=4,j++){const v=(gray[j]-lo)*255/range;d[i]=d[i+1]=d[i+2]=v}
 ctx.putImageData(px,0,0);img.close?.();
 return canvas;
}

// 워커를 한 번만 만들고 재사용 (연속 촬영 시 훨씬 빠름)
function ocrProgress(m){
 const s=$('ocrStatus');if(!s)return;
 const pct=Math.round((m.progress||0)*100);
 if(m.status==='recognizing text')s.textContent=`글자 인식 ${pct}%`;
 else if(/loading|initializ/.test(m.status||''))s.textContent=`OCR 엔진 준비 중... ${pct}% (처음 한 번은 시간이 걸려요)`;
}
function getOcrWorker(){
 if(!ocrWorkerPromise){
  ocrWorkerPromise=(async()=>{
   if(!window.Tesseract)await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js');
   const worker=await Tesseract.createWorker('eng+kor',1,{logger:ocrProgress});
   await worker.setParameters({tessedit_pageseg_mode:OCR_PSM,preserve_interword_spaces:'1'});
   return worker;
  })().catch(e=>{ocrWorkerPromise=null;throw e});
 }
 return ocrWorkerPromise;
}
async function resetOcrWorker(){const p=ocrWorkerPromise;ocrWorkerPromise=null;try{(await p)?.terminate()}catch(e){}}

function setOcrStatus(msg){captureStatus=msg;const s=$('ocrStatus');if(s){s.textContent=msg;$('previewArea')?.classList.remove('hidden')}}

async function recognizeImage(file){
 if(!file||scanBusy)return;
 if(!file.type.startsWith('image/')){toast('이미지 파일만 사용할 수 있어요.');return}
 scanBusy=true;captureDeck=$('deckname')?.value.trim()||captureDeck;
 setOcrStatus('사진의 영어·한국어를 분석하는 중...');
 try{
  const [worker,photo]=await Promise.all([getOcrWorker(),preparedImage(file)]);
  const r=await worker.recognize(photo);
  lastOcrText=(r.data.text||'').trim();
  console.log('[WORD QUEST OCR 원문]\n'+lastOcrText);
  const candidates=mergeCandidates(structuredCandidates(r.data),headwordCandidates(r.data));
  if(!candidates.length){captureStatus='읽은 단어가 없어요. 더 가까이 촬영해 주세요. (한 페이지씩 권장)';toast(captureStatus)}
  else{const n=importCandidates(candidates,captureDeck);capturePhotos++;if(n===0)captureStatus='이미 등록된 단어이거나 인식 가능한 단어가 없어요.'}
 }catch(e){
  captureStatus='OCR를 실행할 수 없어요. 인터넷 연결과 이미지 형식을 확인해 주세요.';toast(captureStatus);console.error('WORD QUEST OCR',e);
  await resetOcrWorker();
 }finally{scanBusy=false;render()}
}
async function recognizeImages(files){const arr=[...files].filter(f=>f?.type?.startsWith('image/'));if(!arr.length)return;for(const f of arr){await recognizeImage(f)}}
/* ================= /OCR v0.5 ================= */

function tokenize(txt,min){const words=txt.match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g)||[];return [...new Set(words.map(w=>w.toLowerCase().replace(/['’](s|re|ve|ll|d|t|m)$/,'')).filter(w=>w.length>=min&&!stop.has(w)))].slice(0,120)}function deck(){let names=['all',...new Set(db.words.map(w=>w.deck))];let words=deckFilter==='all'?db.words:db.words.filter(w=>w.deck===deckFilter);return `<div class="spread"><p class="muted">단어를 눌러 뜻·품사·예문을 수정할 수 있습니다.</p><div class="flex"><button class="btn secondary small" id="exportBtn">⬇ 백업</button><button class="btn secondary small" id="importBtn">⬆ 가져오기</button><button class="btn danger small" id="deleteAllDecks" ${db.words.length?"":"disabled"}>🗑 전체 단어장 삭제</button><input class="hidden" type="file" id="importFile" accept=".json,application/json"></div></div><div class="panel"><div class="spread"><div style="min-width:180px"><label>단어장 선택</label><select id="deckFilter">${names.map(n=>`<option value="${esc(n)}" ${n===deckFilter?'selected':''}>${n==='all'?'전체 단어장':esc(n)}</option>`).join('')}</select></div><strong>${words.length}개 단어</strong></div><hr>${words.length?words.map(w=>`<div class="worditem"><div><strong>${esc(w.en)}</strong> <span class="pill">${esc(w.pos)}</span><div class="muted">${esc(w.ko)} ${w.needsReview?'<span style="color:#ffbc65">⚠ 확인</span>':''} · ${esc(w.deck)}</div></div><div class="flex"><button class="btn secondary small" data-speak="${esc(w.id)}" aria-label="발음 듣기">🔊</button><button class="btn secondary small" data-edit="${esc(w.id)}">편집</button><button class="btn danger small" data-delete="${esc(w.id)}">삭제</button></div></div>`).join(''):'<div class="empty">아직 등록한 단어가 없어요.<br>사진에서 영어 단어를 수집해 보세요!</div>'}</div>`}
function speak(w){if(!('speechSynthesis'in window)){toast('이 브라우저는 발음을 지원하지 않아요.');return}speechSynthesis.cancel();let u=new SpeechSynthesisUtterance(w.en);u.lang='en-US';u.rate=.85;speechSynthesis.speak(u)}
function study(){if(!session)session={ids:dueWords().map(w=>w.id),idx:0,flip:false,answered:0,kind:'review'};let w=db.words.find(a=>a.id===session.ids[session.idx]);if(!w)return `<div class="panel empty"><h2>🎉 이번 학습 완료!</h2><p>오늘 훈련할 새 단어와 복습 단어가 없습니다. 새로운 단어를 추가하거나 배틀에 도전하세요.</p><div class="flex" style="justify-content:center"><button class="btn" data-go="course">DAY 학습 선택</button><button class="btn secondary" id="restartStudy">전체 다시 학습</button></div></div>`;return `<div class="spread"><span class="tag">🧠 기억력 훈련</span><span class="muted">${session.idx+1} / ${session.ids.length}</span></div><div class="bar" style="margin:14px 0 20px"><div style="width:${session.idx/session.ids.length*100}%"></div></div><div class="cardstudy" id="flipCard" role="button" tabindex="0"><div class="muted">${session.flip?'단어 뜻 · 예문':'이 단어의 뜻을 떠올려 보세요'}</div><h2>${esc(w.en)}</h2>${session.flip?`<p style="font-size:25px;font-weight:700">${esc(w.ko)}</p><p class="muted">${esc(w.example)}</p>`:'<p class="muted">화면을 탭하면 정답이 보입니다</p>'}</div><div class="flex" style="justify-content:center;margin-top:18px"><button class="btn secondary small" id="speakStudy">🔊 발음</button>${!session.flip?'<button class="btn" id="showAnswer">정답 확인</button>':''}</div>${session.flip?`<div class="rating-grid" style="margin-top:16px"><button class="btn danger" data-rate="0">😵 다시</button><button class="btn secondary" data-rate="1">🤔 어려움</button><button class="btn success" data-rate="2">🙂 알겠어</button><button class="btn secondary" data-rate="3">😎 쉬워!</button></div><p class="muted">정직하게 평가해야 복습 시점을 정확히 추천합니다.</p>`:''}`}
function review(w,grade){
 const previous=w.interval||0;w.reps=(w.reps||0)+1;const now=Date.now();
 if(grade===0){w.interval=0;w.miss=(w.miss||0)+1;w.ease=Math.max(1.3,(w.ease||2.5)-.2);w.due=now+10*60000;award(2)}
 else if(grade===1){w.interval=1;w.ease=Math.max(1.3,(w.ease||2.5)-.12);w.due=now+DAY;award(5)}
 else if(grade===2){w.interval=previous===0?1:previous===1?3:Math.max(4,Math.round(previous*(w.ease||2.5)));w.due=now+w.interval*DAY;w.ease=Math.min(3.1,(w.ease||2.5)+.05);award(10)}
 else{w.interval=previous===0?3:previous===1?5:Math.max(7,Math.round(previous*(w.ease||2.5)*1.3));w.due=now+w.interval*DAY;w.ease=Math.min(3.1,(w.ease||2.5)+.1);award(12)}
 growMonster(w,grade>=2?2:grade);
 // 틀린 단어는 같은 회차 마지막에 한 번 더 등장합니다.
 if(grade===0&&!session.ids.slice(session.idx+1).includes(w.id)&&session.ids.filter(id=>id===w.id).length<2)session.ids.push(w.id);
 save();session.idx++;session.flip=false;render();
}
function beginQuiz(){let pool=db.words.filter(w=>w.ko&&!w.ko.startsWith('(')&&(w.source!=='elementary800'||w.day===activeDay()||(w.reps||0)>0));if(pool.length<4){toast('뜻이 입력된 단어가 최소 4개 필요합니다.');nav('deck');return}let randomized=[...pool].sort(()=>Math.random()-.5).slice(0,10);quiz={questions:randomized.map(w=>{let wrong=pool.filter(a=>a.ko!==w.ko).sort(()=>Math.random()-.5).slice(0,3).map(a=>a.ko);let opts=[w.ko,...wrong].sort(()=>Math.random()-.5);return{en:w.en,correct:w.ko,opts}}),idx:0,selected:null,points:0,wrong:[]};render()}
function quizView(){if(!quiz)return `<div class="panel empty"><h2>⚔ 단어 배틀</h2><p>뜻을 맞힐 때마다 20 XP! 틀린 단어는 다시 복습할 수 있어요.</p><p>최소 4개의 뜻이 입력된 단어가 필요합니다.</p><button class="btn" id="startQuiz">배틀 시작하기</button></div>`;let q=quiz.questions[quiz.idx];if(!q)return `<div class="panel empty"><h2>🏆 배틀 클리어!</h2><h1>${quiz.points} / ${quiz.questions.length}</h1><p>획득 XP: ${quiz.points*20}</p>${quiz.wrong.length?`<div class="notice">다시 공부할 단어: ${quiz.wrong.map(esc).join(', ')}</div>`:'<p>완벽해요! 모든 문제 정답!</p>'}<button class="btn" id="startQuiz">한 번 더 도전</button></div>`;return `<div class="spread"><span class="tag">⚔ Stage 1</span><span class="tag">${quiz.idx+1}/${quiz.questions.length} · ⭐ ${quiz.points*20} XP</span></div><div class="bar" style="margin:14px 0 20px"><div style="width:${quiz.idx/quiz.questions.length*100}%"></div></div><div class="cardstudy" style="cursor:default;min-height:170px"><div class="muted">영어 단어의 뜻은?</div><h2>${esc(q.en)}</h2></div><div class="choices" style="margin-top:14px">${q.opts.map((opt,i)=>`<button class="choice ${quiz.selected===null?'':opt===q.correct?'right':quiz.selected===i?'wrong':''}" data-choice="${i}" ${quiz.selected!==null?'disabled':''}>${i+1}. ${esc(opt)}</button>`).join('')}</div>${quiz.selected!==null?`<div class="results" style="margin-top:12px">${q.opts[quiz.selected]===q.correct?'✅ 정답! +20 XP':'❌ 정답: '+esc(q.correct)}</div><button class="btn" id="nextQuiz" style="margin-top:14px;width:100%">${quiz.idx===quiz.questions.length-1?'결과 확인':'다음 문제 →'}</button>`:''}`}

const EQUIPMENT=[{id:'wood',name:'훈련용 목검',level:1,job:'all',power:2,icon:'🗡️'},{id:'bronze',name:'청동 검',level:3,job:'all',power:5,icon:'⚔️'},{id:'staff',name:'수련 지팡이',level:10,job:'mage',power:13,icon:'🪄'},{id:'longbow',name:'바람 장궁',level:10,job:'archer',power:13,icon:'🏹'},{id:'saber',name:'기사의 장검',level:10,job:'warrior',power:13,icon:'🗡️'},{id:'legendmage',name:'별빛 지팡이',level:30,job:'mage',power:33,icon:'✨'},{id:'legendarcher',name:'폭풍의 활',level:30,job:'archer',power:33,icon:'🏹'},{id:'legendwarrior',name:'용기사의 검',level:30,job:'warrior',power:33,icon:'⚡'}];
function ensureHero(){if(!db.hero||typeof db.hero!=='object')db.hero={job:null,weapon:'wood',name:'나의 용사'};}
function heroLevel(){return Math.floor(db.xp/200)+1}
function heroArt(){let job=db.hero.job||'novice',lv=heroLevel(),armor=lv>=30?'#efbd64':lv>=10?'#4e9eed':'#879cb8',weapon=EQUIPMENT.find(e=>e.id===db.hero.weapon)||EQUIPMENT[0];return `<svg viewBox="0 0 240 290" xmlns="http://www.w3.org/2000/svg" style="max-width:220px;width:100%;filter:drop-shadow(0 12px 15px #0006)" role="img" aria-label="나의 용사"><ellipse cx="120" cy="269" rx="67" ry="12" fill="#000" opacity=".3"/><path d="M99 202 L92 254 L118 257 L126 204 M129 204 L142 256 L166 254 L148 202" fill="#304a72" stroke="#172641" stroke-width="6"/><path d="M90 255 L119 255 M141 255 L168 255" stroke="#94afd2" stroke-width="13" stroke-linecap="round"/><path d="M81 112 L152 112 L169 211 L73 211Z" fill="${armor}" stroke="#162840" stroke-width="7"/><path d="M100 128 L129 145 L149 127" fill="none" stroke="#fff1b8" stroke-width="7"/><path d="M82 122 L51 171 L63 186 L99 150 M152 126 L190 172 L177 188 L143 150" fill="${armor}" stroke="#162840" stroke-width="7"/><circle cx="120" cy="72" r="46" fill="#f2c49a" stroke="#162840" stroke-width="6"/><path d="M72 74 Q55 8 127 13 Q181 16 165 76 L151 49 Q114 68 79 54Z" fill="${job==='mage'?'#6557b8':'#29354e'}" stroke="#162840" stroke-width="5"/><circle cx="104" cy="79" r="5" fill="#172641"/><circle cx="136" cy="79" r="5" fill="#172641"/><path d="M111 97 Q120 102 128 97" stroke="#984f48" stroke-width="3" fill="none"/>${job==='mage'?'<path d="M65 46 L116 -9 L166 45" fill="#6350a8" stroke="#172641" stroke-width="7"/><path d="M110 10 L119 25 L134 25 L122 35" stroke="#f9dd8c" stroke-width="4"/>':job==='archer'?'<path d="M78 32 Q120 14 163 32" fill="none" stroke="#80d2a6" stroke-width="12"/>':job==='warrior'?'<path d="M76 51 L89 10 L154 10 L167 51" fill="#718eac" stroke="#172641" stroke-width="5"/>':''}<g transform="translate(187 160) rotate(12)">${job==='archer'?'<path d="M0 -71 Q55 0 0 73 M0 -71 L0 73" fill="none" stroke="#e1a86d" stroke-width="7"/><path d="M0 -70 L0 70" stroke="white" stroke-width="2"/>':job==='mage'?'<path d="M0 -75 L0 73" stroke="#cba365" stroke-width="10"/><circle cx="0" cy="-81" r="16" fill="#94e7e9" stroke="white" stroke-width="4"/>':'<path d="M0 -90 L12 -65 L9 40 L-9 40 L-12 -65Z" fill="#d9e6fb" stroke="#273b5d" stroke-width="4"/><path d="M-26 40 L26 40 M0 40 L0 78" stroke="#ffd780" stroke-width="9"/>'}</g>${lv>=30?'<circle cx="121" cy="155" r="15" fill="#f7dc86" stroke="white" stroke-width="3"/>':''}</svg>`}
function heroView(){ensureHero();let lv=heroLevel(),equipped=EQUIPMENT.find(e=>e.id===db.hero.weapon)||EQUIPMENT[0],jobName={novice:'견습 모험가',warrior:lv>=30?'드래곤 나이트':'전사',archer:lv>=30?'폭풍 사냥꾼':'궁수',mage:lv>=30?'대마법사':'마법사'}[db.hero.job||'novice'];let options=EQUIPMENT.filter(x=>x.job==='all'||x.job===db.hero.job);return `<section class="hero game-hero"><div class="game-hero-copy"><span class="tag">🛡 나만의 용사</span><h1>Lv. ${lv} ${jobName}</h1><p class="muted">영어 단어를 기억할수록 용사가 성장합니다.</p><span class="tag">⚔ 장비 ${esc(equipped.name)} · 공격력 ${equipped.power}</span><p class="muted" style="margin-top:15px">XP ${db.xp.toLocaleString()} · 다음 레벨까지 ${200-db.xp%200} XP</p><div class="bar"><div style="width:${db.xp%200/2}%"></div></div></div><div class="hero-monster">${heroArt()}</div></section><div class="grid2"><div class="panel"><h3>⚔ 직업 선택</h3><p class="muted">Lv.10에 개방 · 언제든 직업 변경 가능</p><div class="flex">${[['warrior','🛡 전사'],['archer','🏹 궁수'],['mage','🔮 마법사']].map(([id,n])=>`<button class="btn small ${db.hero.job===id?'success':'secondary'}" data-class="${id}" ${lv<10?'disabled':''}>${n}</button>`).join('')}</div>${lv<10?`<p class="notice">레벨 ${10-lv}개만 더 올리면 직업 선택!</p>`:''}</div><div class="panel"><h3>🎒 무기고</h3><p class="muted">레벨과 직업에 따라 장비 해금 · 유료 결제 없음</p>${options.map(item=>`<div class="spread capture-row"><span>${item.icon} ${esc(item.name)} <small>Lv.${item.level} · 공격력 ${item.power}</small></span><button class="btn small ${db.hero.weapon===item.id?'success':'secondary'}" data-equip="${item.id}" ${lv<item.level?'disabled':''}>${lv<item.level?'잠김':db.hero.weapon===item.id?'장착 중':'장착'}</button></div>`).join('')}</div></div><div class="notice">직업별 장비 외형과 성장 시스템을 비교하는 초기 시제품입니다. 공격력은 향후 보스 배틀에 적용할 수 있도록 저장하며, 현재 퀴즈 정답률에는 영향을 주지 않습니다.</div><div class="flex"><button class="btn" data-go="study">✦ 단어 훈련으로 XP 얻기</button><button class="btn secondary" data-go="quiz">⚔ 퀴즈로 XP 얻기</button></div>`}

function bindView(){document.querySelectorAll('[data-choose-day]').forEach(b=>b.onclick=()=>{db.settings.activeDay=Number(b.dataset.chooseDay);session=null;save();render()});document.querySelectorAll('[data-start-day]').forEach(b=>b.onclick=()=>startDay(Number(b.dataset.startDay)));document.querySelectorAll('[data-start-review]').forEach(b=>b.onclick=startReview);document.querySelectorAll('[data-class]').forEach(b=>b.onclick=()=>{ensureHero();if(heroLevel()<10)return toast('Lv.10에 직업이 해금됩니다.');db.hero.job=b.dataset.class;save();render()});document.querySelectorAll('[data-equip]').forEach(b=>b.onclick=()=>{ensureHero();const item=EQUIPMENT.find(x=>x.id===b.dataset.equip);if(!item||heroLevel()<item.level||item.job!=='all'&&item.job!==db.hero.job)return;db.hero.weapon=item.id;save();render()});document.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>claimMonster(b.dataset.claim));document.querySelectorAll('[data-partner]').forEach(b=>b.onclick=()=>{db.monsters.partner=b.dataset.partner;save();toast('파트너를 변경했어요!');render()});$('seedDemo')?.addEventListener('click',seedDemo);document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>nav(b.dataset.go));if(view==='scan'){$('deckname').onchange=e=>{captureDeck=e.target.value.trim()||captureDeck;render()};$('cameraBtn').onclick=()=>$('cameraInput').click();$('uploadBtn').onclick=()=>$('uploadInput').click();for(let id of ['cameraInput','uploadInput'])$(id).onchange=e=>recognizeImages(e.target.files||[]);$('trainNow').onclick=()=>{session={ids:db.words.filter(w=>w.deck===captureDeck).map(w=>w.id),idx:0,flip:false};if(!session.ids.length)session=null;nav('study')};$('seeDeck').onclick=()=>{deckFilter=captureDeck;nav('deck')};$('undoCapture').onclick=()=>{if(!captureLast.length)return;let ids=new Set(captureLast);db.words=db.words.filter(w=>!ids.has(w.id));captureTotal=Math.max(0,captureTotal-ids.size);captureLast=[];captureStatus='마지막으로 추가한 단어를 취소했어요.';save();render()};$('pasteTextToggle').onclick=()=>$('manualText').classList.toggle('hidden');$('textImportBtn').onclick=()=>{let t=$('sourceText').value.trim();captureDeck=$('deckname').value.trim()||captureDeck;if(t)importRecognized(t,captureDeck)};$('demoBtn').onclick=()=>importRecognized('achieve 달성하다\nopportunity 기회\nimprove 향상시키다\nenvironment 환경'.replace(/\n/g,'\n'),captureDeck);let zone=$('dropZone');zone.ondragover=e=>{e.preventDefault();zone.classList.add('hover')};zone.ondragleave=()=>zone.classList.remove('hover');zone.ondrop=e=>{e.preventDefault();zone.classList.remove('hover');recognizeImages(e.dataTransfer.files)};zone.onclick=()=>$('uploadInput').click()}if(view==='deck'){$('deckFilter').onchange=e=>{deckFilter=e.target.value;render()};document.querySelectorAll('[data-speak]').forEach(b=>b.onclick=()=>speak(db.words.find(w=>w.id===b.dataset.speak)));document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>{let w=db.words.find(w=>w.id===b.dataset.edit);let ko=prompt(`${w.en} - 한국어 뜻`,w.ko);if(ko===null)return;w.ko=ko.trim()||w.ko;w.needsReview=!ko.trim()||ko.includes("뜻 확인 필요");let ex=prompt('예문 (취소하면 유지)',w.example||'');if(ex!==null)w.example=ex.trim();save();render()});document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{if(!confirm('이 단어를 삭제할까요?'))return;db.words=db.words.filter(w=>w.id!==b.dataset.delete);save();render()});$('deleteAllDecks').onclick=()=>{
 const count=db.words.length;
 if(!count)return;
 const answer=prompt(`등록된 모든 단어장과 단어 ${count}개를 영구 삭제합니다.\n학습 단어의 복습 기록도 함께 사라집니다.\n몬스터, XP, 레벨은 유지됩니다.\n\n삭제하려면 '전체삭제'를 입력하세요.`);
 if(answer!=='전체삭제'){if(answer!==null)toast('삭제가 취소되었습니다.');return;}
 db.words=[];deckFilter='all';session=null;quiz=null;draft=[];captureLast=[];captureTotal=0;
 save();render();toast(`${count}개 단어를 삭제했습니다. 몬스터와 XP는 유지됩니다.`);
};$('exportBtn').onclick=downloadBackup;$('importBtn').onclick=()=>$('importFile').click();$('importFile').onchange=importBackup}if(view==='study'){$('restartStudy')?.addEventListener('click',()=>{session={ids:dueWords().map(w=>w.id),idx:0,flip:false,kind:'review'};render()});let flip=()=>{session.flip=!session.flip;render()};if($('flipCard')){$('flipCard').onclick=flip;$('flipCard').onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip()}}}$('showAnswer')?.addEventListener('click',flip);$('speakStudy')?.addEventListener('click',()=>speak(db.words.find(w=>w.id===session.ids[session.idx])));document.querySelectorAll('[data-rate]').forEach(b=>b.onclick=()=>review(db.words.find(w=>w.id===session.ids[session.idx]),Number(b.dataset.rate)))}if(view==='quiz'){$('startQuiz')?.addEventListener('click',beginQuiz);document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{if(quiz.selected!==null)return;quiz.selected=+b.dataset.choice;let q=quiz.questions[quiz.idx];if(q.opts[quiz.selected]===q.correct){quiz.points++;award(20)}else{quiz.wrong.push(q.en);let w=db.words.find(w=>w.en===q.en);if(w){w.due=Date.now();w.miss=(w.miss||0)+1;save()}}render()});$('nextQuiz')?.addEventListener('click',()=>{quiz.idx++;quiz.selected=null;render()})}}
function loadScript(src){return new Promise((resolve,reject)=>{let s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}function downloadBackup(){let a=document.createElement('a'),blob=new Blob([JSON.stringify(db,null,2)],{type:'application/json'});let url=URL.createObjectURL(blob);a.href=url;a.download=`wordquest-backup-${today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),3000)}async function importBackup(e){let f=e.target.files?.[0];if(!f)return;try{let obj=JSON.parse(await f.text());if(!Array.isArray(obj.words)||!obj.words.every(w=>typeof w.en==='string'&&typeof w.ko==='string'))throw Error();if(!confirm(`기존 데이터를 대체하고 ${obj.words.length}개 단어를 가져올까요?`))return;db={words:obj.words,xp:Number(obj.xp)||0,history:obj.history||{},settings:obj.settings||{dailyGoal:10},created:obj.created||Date.now(),monsters:obj.monsters||null,hero:obj.hero||null};ensureMonsters();ensureHero();save();session=null;quiz=null;toast('백업을 불러왔어요.');render()}catch(err){toast('유효한 WORD QUEST 백업 파일이 아닙니다.')}}
window.addEventListener('storage',e=>{if(e.key===KEY){db=load();seed800();session=null;render()}});seed800();render();if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});

window.addEventListener('paste',e=>{if(view!=='scan')return;let file=[...(e.clipboardData?.items||[])].find(x=>x.type.startsWith('image/'))?.getAsFile();if(file){e.preventDefault();recognizeImage(file)}});
