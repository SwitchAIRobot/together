'use strict';
// ===== CONFIG (edit here) =====
const VOTE={question:'PLACEHOLDER: Should together continue under its current setup?'};
const STRIPE_LINKS={
 // Stripe Dashboard > Payment links > New > Donation: one-time, fixed £5
 donate5Once:'https://buy.stripe.com/PLACEHOLDER_donate5',
 // Payment links > New > recurring price £5/month
 donate5Monthly:'https://buy.stripe.com/PLACEHOLDER_donate5m',
 // Payment links > New > "Customers choose what to pay", preset £10, £25, £50, £100
 donateChoose:'https://buy.stripe.com/PLACEHOLDER_choose',
 // Memberships: one Payment link per row (one-off or recurring price)
 mem:{'Liberate £50 one-off':'https://buy.stripe.com/PLACEHOLDER_m1','Liberate £5 monthly':'https://buy.stripe.com/PLACEHOLDER_m2','Empower £100 one-off':'https://buy.stripe.com/PLACEHOLDER_m3','Empower £10 monthly':'https://buy.stripe.com/PLACEHOLDER_m4','Independence £250 one-off':'https://buy.stripe.com/PLACEHOLDER_m5','Independence £25 monthly':'https://buy.stripe.com/PLACEHOLDER_m6','Liberate concession £30 one-off':'https://buy.stripe.com/PLACEHOLDER_m7','Liberate concession £3 monthly':'https://buy.stripe.com/PLACEHOLDER_m8'},
 // Ticket link per event id: Payment link > product name, date, location in description; enable quantity; QR code is on the link's share panel
 events:{annual2027:'https://buy.stripe.com/PLACEHOLDER_event'},
 // Merch: one Payment link per product (Payment links > New > product with image)
 merch:{'T-Shirt "#together"':'https://buy.stripe.com/PLACEHOLDER_t1','T-Shirt "No to Digital ID"':'https://buy.stripe.com/PLACEHOLDER_t2','"#together" hat':'https://buy.stripe.com/PLACEHOLDER_hat','"#together" tote bag':'https://buy.stripe.com/PLACEHOLDER_tote',Stickers:'https://buy.stripe.com/PLACEHOLDER_st',Leaflets:'https://buy.stripe.com/PLACEHOLDER_lf'}};
// PLACEHOLDER event: date/time/location are NOT real. Edit before launch. Add more objects to add events.
const EVENTS=[{id:'annual2027',title:'Annual event Nov 2027',date:'2027-11-13',start:'10:00',end:'16:00',location:'Not stated',placeholder:true}];
// ===== helpers =====
const $=s=>document.querySelector(s),esc=s=>String(s??'Not stated').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LS={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}};
const S={tab:'About',camp:'Videos',shop:'Membership',q:'',cq:'',data:{videos:[],posts:[],comm:[]}};
const TABS={About:'M12 2a10 10 0 100 20 10 10 0 000-20zM12 8v5M12 16v1',Campaigns:'M3 11v3h3l8 5V6L6 11H3zM17 9a4 4 0 010 6',Community:'M12 21s7-6 7-12a7 7 0 10-14 0c0 6 7 12 7 12zM12 11a2 2 0 100-4',Vote:'M4 13l5 5L20 6',Donate:'M12 21l-8-8a5 5 0 117-7l1 1 1-1a5 5 0 117 7z',Shop:'M5 8h14l-1 12H6zM9 8a3 3 0 016 0'};
const hl=(t,q)=>{t=esc(t);if(!q)return t;const w=q.trim().split(/\s+/).filter(x=>x.length>1).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));return w.length?t.replace(new RegExp('('+w.join('|')+')','gi'),'<mark>$1</mark>'):t};
function search(list,keys,q){if(!q.trim())return list;if(window.Fuse){return new Fuse(list,{keys,threshold:.35,ignoreLocation:true}).search(q).map(r=>r.item)}
 const l=q.toLowerCase();return list.filter(o=>keys.some(k=>String(o[k]??'').toLowerCase().includes(l)))}
// ===== tickets =====
const chosen=()=>LS.get('tg:events',[]);
const toMin=t=>{const[a,b]=t.split(':');return +a*60+ +b};
function overlaps(ids,evs=EVENTS){const c=evs.filter(e=>ids.includes(e.id)),o=[];for(let i=0;i<c.length;i++)for(let j=i+1;j<c.length;j++){const a=c[i],b=c[j];if(a.date===b.date&&toMin(a.start)<toMin(b.end)&&toMin(b.start)<toMin(a.end))o.push([a,b])}return o}
function toggleEv(id){const c=chosen(),i=c.indexOf(id);i<0?c.push(id):c.splice(i,1);LS.set('tg:events',c);render()}
const evBtn=e=>{const on=chosen().includes(e.id);return `<button data-ev="${e.id}" aria-label="${on?'Remove':'Add'} ${esc(e.title)}">${on?'−':'+'}</button>`};
const fold=l=>{let o='';while(l.length>73){o+=l.slice(0,73)+'\r\n ';l=l.slice(73)}return o+l};
function makeICS(ids,evs=EVENTS){const z=s=>s.replace(/[-:]/g,'');const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//together//PWA//EN','CALSCALE:GREGORIAN',
'BEGIN:VTIMEZONE','TZID:Europe/London','BEGIN:DAYLIGHT','TZOFFSETFROM:+0000','TZOFFSETTO:+0100','TZNAME:BST','DTSTART:19700329T010000','RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU','END:DAYLIGHT','BEGIN:STANDARD','TZOFFSETFROM:+0100','TZOFFSETTO:+0000','TZNAME:GMT','DTSTART:19701025T020000','RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU','END:STANDARD','END:VTIMEZONE'];
 const st=new Date().toISOString().replace(/[-:]/g,'').slice(0,15)+'Z';
 evs.filter(e=>ids.includes(e.id)).forEach(e=>{const link=STRIPE_LINKS.events[e.id]||'';L.push('BEGIN:VEVENT','UID:'+e.id+'@together-pwa',  'DTSTAMP:'+st,'DTSTART;TZID=Europe/London:'+z(e.date)+'T'+e.start.replace(':','')+'00','DTEND;TZID=Europe/London:'+z(e.date)+'T'+e.end.replace(':','')+'00','SUMMARY:'+e.title,'LOCATION:'+(e.location==='Not stated'?'':e.location),'DESCRIPTION:Ticket link: '+link);if(link)L.push('URL:'+link);L.push('END:VEVENT')});
 L.push('END:VCALENDAR');return L.map(fold).join('\r\n')+'\r\n'}
function exportICS(){const b=new Blob([makeICS(chosen())],{type:'text/calendar'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='together-events.ics';a.click()}
function tickets(){const c=chosen(),dates=[...new Set(EVENTS.map(e=>e.date))].sort(),h0=Math.floor(Math.min(...EVENTS.map(e=>toMin(e.start)))/60),h1=Math.ceil(Math.max(...EVENTS.map(e=>toMin(e.end)))/60);
 let g=`<div class="grid" role="region" aria-label="Event grid" tabindex="0" style="--cols:${dates.length}"><div class="pin top">Time</div>`+dates.map(d=>`<div class="top">${esc(d)}</div>`).join('');
 for(let h=h0;h<h1;h++){g+=`<div class="pin">${String(h).padStart(2,'0')}:00</div>`;dates.forEach(d=>{const e=EVENTS.find(e=>e.date===d&&Math.floor(toMin(e.start)/60)===h);g+=e?`<div class="ev" style="grid-row:span ${Math.ceil((toMin(e.end)-toMin(e.start))/60)}">${esc(e.title)}<br>${e.start}–${e.end}<br>${evBtn(e)}</div>`:(EVENTS.some(e=>e.date===d&&toMin(e.start)<h*60&&toMin(e.end)>h*60)?'':'<div></div>')})}
 g+='</div>';
 const mine=EVENTS.filter(e=>c.includes(e.id)).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
 return g+EVENTS.map(e=>`<div class="card"><h3>${esc(e.title)} ${e.placeholder?'<small>(PLACEHOLDER details)</small>':''}</h3><p>${esc(e.date)} ${e.start}–${e.end}<br>Location: ${esc(e.location)}</p>${evBtn(e)}<a class="btn" href="${STRIPE_LINKS.events[e.id]}" rel="noopener">Buy ticket</a></div>`).join('')+
 `<h2>My events</h2>`+overlaps(c).map(([a,b])=>`<div class="warn" role="alert">Warning: "${esc(a.title)}" overlaps "${esc(b.title)}" on ${esc(a.date)}.</div>`).join('')+
 (mine.length?mine.map(e=>`<div class="card">${esc(e.date)} ${e.start} ${esc(e.title)} ${evBtn(e)}</div>`).join('')+'<button id="ics">Add to phone calendar</button>':'<p>No events chosen.</p>')}
// ===== views =====
const linkBtns=(o,t)=>Object.entries(o).map(([k,v])=>`<a class="btn" href="${v}" rel="noopener">${esc(k)}</a>`).join('');
function vid(v,q){return `<article class="card"><a href="${esc(v.url)}" rel="noopener"><img class="thumb" loading="lazy" referrerpolicy="no-referrer" alt="" src="${esc(v.thumb)}" onerror="this.removeAttribute('src')"><h3>${hl(v.title,q)}</h3></a><small>${esc(v.date)} · ${hl(v.campaign,q)}</small><p>${hl(v.summary,q)}</p></article>`}
function campaigns(){const q=S.cq,today=new Date().toISOString().slice(0,10);
 let h=`<div class="seg"><button aria-pressed="${S.camp==='Videos'}" data-camp="Videos">Videos</button><button aria-pressed="${S.camp==='Posts'}" data-camp="Posts">Posts</button></div><label class="muted" for="s" style="color:#fff">Search</label><input id="s" type="search" value="${esc(S.cq)}" placeholder="Search…">`;
 if(S.camp==='Videos'){const v=search(S.data.videos,['title','summary','campaign'],q),up=v.filter(x=>x.date>=today).sort((a,b)=>a.date.localeCompare(b.date)),past=v.filter(x=>!(x.date>=today)).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
  h+=(up.length?'<h2>Upcoming</h2>'+up.map(x=>vid(x,q)).join(''):'')+'<h2>Past</h2>'+past.map(x=>vid(x,q)).join('');
  const ev=q?search(EVENTS,['title','date','start','end','location'],q):[];if(ev.length)h+='<h2>Tickets</h2>'+ev.map(e=>`<div class="card">${hl(e.title,q)} · ${hl(e.date,q)} ${hl(e.start,q)}–${hl(e.end,q)} ${evBtn(e)}</div>`).join('')}
 else h+=search(S.data.posts,['title','summary','campaign'],q).map(p=>`<article class="card"><h3><a href="${esc(p.url)}" rel="noopener">${hl(p.title,q)}</a></h3><small>${esc(p.date)}</small><p>${hl(p.summary,q)}</p></article>`).join('');
 return h}
let map;
function community(){const q=S.q;return `<label for="s" style="color:#fff">Search postcode, type or region</label><input id="s" type="search" value="${esc(q)}"><div id="map" role="region" aria-label="Map of supporter areas"></div><div id="list"></div><p class="muted" style="color:#fff">Aggregated by postcode district. Venue names: Not stated.</p>`}
function drawMap(){const q=S.q,items=search(S.data.comm,['postcode','type','region'],q);
 if(!window.L||!L.map){$('#map').remove();$('#list').innerHTML=items.slice(0,150).map(i=>`<div class="card">${hl(i.postcode,q)} · ${hl(i.type,q)} · count ${esc(i.count)} · region ${esc(i.region)}</div>`).join('')+(items.length>150?'<p>First 150 shown. Add leaflet.js for the map.</p>':'');return}
 if(map)map.remove();map=L.map('map').setView([54,-2.5],5);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap contributors',maxZoom:18}).addTo(map);
 const by={};items.forEach(i=>(by[i.postcode]??=[]).push(i));const r=L.canvas();
 Object.values(by).forEach(g=>{const a=g[0],hub=g.some(x=>x.hub),n=g.reduce((s,x)=>s+(x.count||0),0);
  L.circleMarker([a.lat,a.lng],{renderer:r,radius:hub?10:3+Math.min(8,n/2),color:hub?'#D10D0D':'#595959',fillColor:hub?'#D10D0D':'#595959',fillOpacity:.8}).addTo(map).bindPopup(`<b>${esc(a.postcode)}</b>${hub?' (Local hub)':''}<br>Venue: Not stated<br>Region: ${esc(a.region)}<br>`+g.map(x=>`${esc(x.type)}: ${esc(x.count)}`).join('<br>'))})}
function vote(){const v=LS.get('tg:vote',null),t=LS.get('tg:tally',{yes:0,no:0}),n=t.yes+t.no||1;
 return `<div class="card"><h2>${esc(VOTE.question)}</h2>${v?'':'<button data-v="yes">Yes</button><button data-v="no">No</button>'}${v?`<p>You voted ${v}.</p><button data-v="reset">Clear my answer</button>`:''}<div class="bar" style="width:${t.yes/n*100}%;min-width:50px">Yes ${Math.round(t.yes/n*100)}%</div><div class="bar" style="width:${t.no/n*100}%;min-width:50px">No ${Math.round(t.no/n*100)}%</div><p class="muted">Results are stored on this device only (no backend).</p></div>`}<div class="bar" style="width:${t.yes/n*100}%;min-width:50px">Yes ${Math.round(t.yes/n*100)}%</div><div class="bar" style="width:${t.no/n*100}%;min-width:50px">No ${Math.round(t.no/n*100)}%</div><p class="muted">Results are stored on this device only (no backend).</p></div>`}
function shop(){const s=S.shop;return `<div class="seg">${['Membership','Tickets','Merch'].map(x=>`<button data-shop="${x}" aria-pressed="${s===x}">${x}</button>`).join('')}</div>`+(s==='Membership'?`<div class="card">${linkBtns(STRIPE_LINKS.mem)}</div>`:s==='Tickets'?tickets():`<div class="card">${linkBtns(STRIPE_LINKS.merch)}</div>`)}
const VIEWS={About:()=>`<div class="card"><h2>About</h2><p>A campaign group that works with the public and amplifies their voice. </p><p>We stand for individual freedoms, autonomy, privacy and push back on state overreach.</p><p>We fight for the everyday person, their freedom of speech, choice and individual rights.</p></div>`,Campaigns:campaigns,Community:community,Vote:vote,
 Donate:()=>`<div class="card"><h2>Donate</h2><a class="btn" href="${STRIPE_LINKS.donate5Once}">£5 one-off</a><a class="btn" href="${STRIPE_LINKS.donate5Monthly}">£5 monthly</a><a class="btn" href="${STRIPE_LINKS.donateChoose}">Choose your amount (£10 / £25 / £50 / £100)</a></div>`,Shop:shop};
function render(){const a=$('#app');a.innerHTML=VIEWS[S.tab]();if(S.tab==='Community')drawMap();
 $('#nav').innerHTML=Object.entries(TABS).map(([k,d])=>`<button data-tab="${k}" ${k===S.tab?'aria-current="page"':''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>${k}</button>`).join('');
 const s=$('#s');if(s&&S.focus){s.focus();s.setSelectionRange(1e3,1e3);S.focus=0}}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.tab){S.tab=d.tab;render()}else if(d.camp){S.camp=d.camp;render()}else if(d.shop){S.shop=d.shop;render()}else if(d.ev)toggleEv(d.ev);
 else if(d.v){const t=LS.get('tg:tally',{yes:0,no:0});if(!LS.get('tg:vote',null)){t[d.v]++;LS.set('tg:tally',t);LS.set('tg:vote',d.v)}render()}else if(b.id==='ics')exportICS()});
document.addEventListener('input',e=>{if(e.target.id!=='s')return;if(S.tab==='Community'){S.q=e.target.value;drawMap()}else{S.cq=e.target.value;S.focus=1;render()}});
Promise.all(['videos','socialmedia','community'].map(f=>fetch(f+'.json').then(r=>r.json()).catch(()=>[]))).then(([v,p,c])=>{S.data={videos:v,posts:p,comm:c};render()});
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');render();
if(typeof module!=='undefined')module.exports={overlaps,makeICS};
