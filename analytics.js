/*! © 2026 DON CLASH 制作・運営 | All rights reserved where applicable. See rights.html. */

(function(){
'use strict';
const me\u0061surement="G-Z7WJSMML2F", canonical="https://5364oni.github.io/don-clash/", en\u0076ironment="solo_public", release="Ver2.0.4";
const key='don-clash-analytics-choice-v1', disabled='ga-disable-'+me\u0061surement;
let pr\u0065ference=null, loaded=false, pageSent=false, so\u006coActive=false, soloEnded=false;
try { const saved=lo\u0063alStorage.getItem(key); if(saved==='yes'||saved==='no')pr\u0065ference=saved; } catch(_){}
const hostOK=location.origin===new URL(canonical).origin && (location.pathname===new URL(canonical).pathname||location.pathname===new URL('index.html',canonical).pathname);
let sa\u0066eReferrer='';try{const ref=new URL(document.referrer);if(ref.protocol==='https:'||ref.protocol==='http:')sa\u0066eReferrer=ref.origin+'/';}catch(_){}
const denied={an\u0061lytics_storage:'denied',ad\u005fstorage:'denied',ad\u005fuser_data:'denied',ad\u005fpersonalization:'denied'};
const granted={...denied,an\u0061lytics_storage:'granted'};
const events={ti\u0074le_start:null,so\u006co_game_start:['solo'],so\u006co_game_end:['solo'],on\u006cine_game_start:['online'],on\u006cine_game_end:['online'],ro\u006fm_create:['online']};
function queue(){window.dataLayer.push(arguments);}
function allowed(){return pr\u0065ference==='yes'&&hostOK&&loaded&&!window[disabled];}
function send(name,mode){try{
if(!allowed()||!Object.prototype.ha\u0073OwnProperty.call(events,name))return;
const modes=events[name]; if(modes?!modes.includes(mode):mode!==undefined)return;
queue('event',name,{send_to:me\u0061surement,pa\u0067e_location:canonical,pa\u0067e_referrer:sa\u0066eReferrer,ga\u006de_environment:en\u0076ironment,ga\u006de_release:release,...(modes?{game_mode:mode}:{})});
}catch(_){} }
function enable(){try{
if(!hostOK)return;
window[disabled]=false;
if(!loaded){
window.dataLayer=window.dataLayer||[];
window.gtag=queue;
queue('consent','default',denied);
queue('consent','update',granted);
queue('js',new Date());
queue('config',me\u0061surement,{se\u006ed_page_view:false,al\u006cow_google_signals:false,al\u006cow_ad_personalization_signals:false,pa\u0067e_location:canonical,pa\u0067e_referrer:sa\u0066eReferrer,ga\u006de_environment:en\u0076ironment,ga\u006de_release:release});
const script=document.cr\u0065ateElement('script');script.async=true;script.re\u0066errerPolicy='no-referrer';script.src='https://www.googletagmanager.com/gtag/js?id='+en\u0063odeURIComponent(me\u0061surement);script.onerror=()=>{};loaded=true;document.head.append(script);
}else queue('consent','update',granted);
if(!pageSent){pageSent=true;queue('event','page_view',{send_to:me\u0061surement,pa\u0067e_location:canonical,pa\u0067e_referrer:sa\u0066eReferrer,ga\u006de_environment:en\u0076ironment,ga\u006de_release:release});}
}catch(_){} }
function disable(){window[disabled]=true;if(loaded){try{queue('consent','update',denied);}catch(_){}}}
window[disabled]=true;
function refresh(){document.qu\u0065rySelectorAll('[data-dc-analytics]').forEach(el=>{el.te\u0078tContent=pr\u0065ference===null?'アクセス解析に協力（任意）':'アクセス解析設定';});}
function choose(value){pr\u0065ference=value;try{lo\u0063alStorage.setItem(key,value);}catch(_){}if(value==='yes')enable();else disable();refresh();}
const panel=document.ge\u0074ElementById('dc-analytics-dialog');
function close(){if(panel.open)panel.close();}
document.qu\u0065rySelectorAll('[data-dc-analytics]').forEach(el=>el.ad\u0064EventListener('click',()=>{try{document.ge\u0074ElementById('dc-analytics-state').te\u0078tContent=pr\u0065ference==='yes'?'現在：許可':pr\u0065ference==='no'?'現在：拒否':'現在：未選択（計測なし）';if(!panel.open)panel.showModal();}catch(_){}}));
document.ge\u0074ElementById('dc-analytics-yes').ad\u0064EventListener('click',()=>{choose('yes');close();});
document.ge\u0074ElementById('dc-analytics-no').ad\u0064EventListener('click',()=>{choose('no');close();});
document.ge\u0074ElementById('dc-analytics-close').ad\u0064EventListener('click',close);
ad\u0064EventListener('storage',e=>{if(e.key===key||e.key===null){let val=null;try{val=lo\u0063alStorage.getItem(key);}catch(_){}pr\u0065ference=val==='yes'||val==='no'?val:null;if(pr\u0065ference==='yes')enable();else disable();refresh();}});
refresh();if(pr\u0065ference==='yes')enable();
window.Do\u006eAnalytics=Object.freeze({
ti\u0074leStart:()=>send('title_start'),
soloReset:()=>{so\u006coActive=false;soloEnded=false;if(en\u0076ironment==='solo_public'){so\u006coActive=true;send('solo_game_start','solo');}},
so\u006coAction:()=>{if(!so\u006coActive&&!soloEnded){so\u006coActive=true;send('solo_game_start','solo');}},
soloEnd:()=>{if(so\u006coActive&&!soloEnded){soloEnded=true;send('solo_game_end','solo');}},
on\u006cineStart:()=>send('online_game_start','online'),onlineEnd:()=>send('online_game_end','online'),ro\u006fmCreate:()=>send('room_create','online')
});
})();
