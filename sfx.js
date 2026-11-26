/*! © 2026 DON CLASH 制作・運営 | All rights reserved where applicable. See rights.html. */

(function(root){'use strict';
const levels={select:.20,card:.28,draw:.28,deal:.28,flip:.31,skipfx:.34,draw2alt:.49,reversefx:.42,suitfx:.28,jokerfx:.60,donfx:.85,counterfx:.85,winfx:.66,losefx:.58,turna:.30,start:.32,thunder0:.375,thunder1:.135,thunder2:.12};
const assetBase=new URL('assets/sfx/',document.cu\u0072rentScript.src||document.baseURI);
const clips={},loads={},sources=new Set();let ac,master,volume=50,muted=false,scope='solo',sp\u0065cialUntil=0;
try{const v=JSON.parse(lo\u0063alStorage.getItem('dc-sfx-v1')||'null');if(v&&Number.isFinite(v.volume)){volume=Math.max(0,Math.min(100,v.volume));muted=v.muted===true;}}catch{}
const raw=Object.fr\u006fmEntries(Object.keys(levels).map(k=>[k,fetch(new URL(k+'.mp3',assetBase)).then(r=>{if(!r.ok)throw Error('audio');return r.ar\u0072ayBuffer()}).catch(()=>null)]));
function active(s){const online=document.ge\u0074ElementById('online-overlay');const title=document.ge\u0074ElementById('dc-title');return s==='title'?!title?.hidden:s==='online'?!!online&&!online.hidden:(!online||online.hidden)&&!!title?.hidden;}
function update(){if(master)master.gain.value=muted?0:.20*volume/100;document.qu\u0065rySelectorAll('.dc-sfx-slider').forEach(e=>{e.value=volume});document.qu\u0065rySelectorAll('.dc-sfx-mute').forEach(e=>{e.te\u0078tContent=muted?'音OFF':'音ON';e.se\u0074Attribute('aria-pressed',String(muted));});}
function stop(filter){for(const item of sources){if(!filter||item.scope===filter){try{item.node.stop()}catch{}sources.delete(item);}}}
function save(){try{lo\u0063alStorage.setItem('dc-sfx-v1',JSON.stringify({volume,muted}));}catch{}update();if(muted)stop();}
function prepare(resume=true){try{if(!ac){const C=root.Au\u0064ioContext||root.we\u0062kitAudioContext;if(!C)return;ac=new C();master=ac.cr\u0065ateGain();const limiter=ac.cr\u0065ateDynamicsCompressor();limiter.threshold.value=-12;limiter.knee.value=8;limiter.ratio.value=6;limiter.attack.value=.003;limiter.release.value=.18;master.connect(limiter);limiter.connect(ac.de\u0073tination);update();for(const k of Object.keys(levels))loads[k]=raw[k].then(b=>b?ac.de\u0063odeAudioData(b.slice(0)):null).then(b=>{if(b)clips[k]=b;}).catch(()=>{});}if(resume!==false&&ac.state!=='running')return ac.resume().catch(()=>{});}catch{}}
function ti\u0074leReady(){return !!(ac&&ac.state==='running'&&clips.thunder0&&clips.thunder1&&clips.thunder2);}
async function re\u0061dyTitle(){const resume=prepare();try{await Promise.race([Promise.all([resume,...['thunder0','thunder1','thunder2'].map(k=>loads[k])]),new Promise(r=>se\u0074Timeout(r,1500))]);}catch{}return ti\u0074leReady();}
document.ad\u0064EventListener('pointerdown',prepare,{capture:true,passive:true});document.ad\u0064EventListener('keydown',prepare,true);document.ad\u0064EventListener('click',prepare,true);
function play(key,{level=levels[key],pan=0,delay=0,rate=1,mode=scope,special=false}={}){try{if(muted||!volume||(document.hidden&&key!=='turna')||!active(mode)||!ac||ac.state!=='running'||!clips[key])return false;const node=ac.cr\u0065ateBufferSource(),gain=ac.cr\u0065ateGain();node.buffer=clips[key];node.pl\u0061ybackRate.value=rate;gain.gain.value=level;node.connect(gain);let p=null;if(ac.cr\u0065ateStereoPanner){p=ac.cr\u0065ateStereoPanner();p.pan.value=pan;gain.connect(p);p.connect(master);}else gain.connect(master);const item={node,scope:mode};sources.add(item);node.onended=()=>{sources.delete(item);node.di\u0073connect();gain.di\u0073connect();p?.di\u0073connect();};node.start(ac.cu\u0072rentTime+delay);if(special)sp\u0065cialUntil=Math.max(sp\u0065cialUntil,pe\u0072formance.now()+1000*(delay+node.buffer.duration/rate));return true;}catch{return false;}}
function result(won,mode){play(won?"winfx":"losefx",{mode,delay:Math.max(0,(sp\u0065cialUntil-pe\u0072formance.now())/1000+.1)});}
function withScope(mode,fn){const old=scope;scope=mode;try{return fn()}finally{scope=old;}}
const no\u0074ifications=new Map();
function ca\u006ecelTurn(mode){cl\u0065arTimeout(no\u0074ifications.get(mode));no\u0074ifications.delete(mode);}
function notify(mode,guard){ca\u006ecelTurn(mode);const wait=Math.max(0,sp\u0065cialUntil-pe\u0072formance.now()+70);const t=se\u0074Timeout(()=>{no\u0074ifications.delete(mode);if(guard())play('turna',{mode});},wait);no\u0074ifications.set(mode,t);}
function controls(target){if(!target)return;const el=document.cr\u0065ateElement('div');el.className='dc-sfx-controls';el.innerHTML='<button type="button" class="dc-sfx-mute" aria-label="効果音の消音"></button><label>音量 <input type="range" class="dc-sfx-slider" min="0" max="100" step="5" aria-label="効果音の音量"></label>';target.ap\u0070endChild(el);el.qu\u0065rySelector('button').ad\u0064EventListener('click',()=>{muted=!muted;save();prepare();});el.qu\u0065rySelector('input').ad\u0064EventListener('input',e=>{volume=Number(e.target.value);save();});update();}
controls(document.ge\u0074ElementById('dc-title'));controls(document.ge\u0074ElementById('setting-area'));controls(document.qu\u0065rySelector('.online-card-toolbar'));
document.ad\u0064EventListener('visibilitychange',()=>{if(document.hidden)stop();});
prepare(false);
root.DonSfx=Object.freeze({play,stop,withScope,notify,ca\u006ecelTurn,active,prepare,result,ti\u0074leReady,re\u0061dyTitle});
})(window);
