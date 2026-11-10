const $=id=>document.getElementById(id);
let gender='boy',score=0,hits=0,remaining=60,runCoins=0,spawnLoop=null,clock=null,active=-1,moleTimeout=null,gameRunning=false,deadline=0;
let coins=Number(localStorage.getItem('zk-coins')||0);
let owned=JSON.parse(localStorage.getItem('zk-owned')||'["basic"]');
const items=[{id:'basic',name:'Základní styl',look:'🧢',price:0},{id:'pink',name:'Růžová lopata',look:'🌸',price:30},{id:'gold',name:'Zlatá lopata',look:'🥇',price:60},{id:'cool',name:'Brýle frajer',look:'😎',price:90},{id:'rainbow',name:'Duhový styl',look:'🌈',price:130}];
function save(){localStorage.setItem('zk-coins',coins);localStorage.setItem('zk-owned',JSON.stringify(owned));$('coins').textContent=coins}save();
document.querySelectorAll('.avatar').forEach(b=>b.onclick=()=>{gender=b.dataset.gender;document.querySelectorAll('.avatar').forEach(x=>x.classList.toggle('selected',x===b))});
function show(id){['home','game','result','shop'].forEach(x=>$(x).classList.toggle('hidden',x!==id))}
function makeHoles(){$('holes').innerHTML='';for(let i=0;i<6;i++){const h=document.createElement('button');h.className='hole';h.setAttribute('aria-label','Díra '+(i+1));h.onclick=()=>whack(i);$('holes').append(h)}}
function spawnMole(){
 if(!gameRunning||active!==-1)return;
 const holes=document.querySelectorAll('.hole');if(!holes.length)return;
 const i=Math.floor(Math.random()*holes.length),m=document.createElement('div');m.className='mole';
 m.innerHTML='<img class="mole-photo" src="assets/mole.jpg" alt="Frajer krtek s čepicí a brýlemi">';
 m.setAttribute('role','button');m.setAttribute('aria-label','Krtek s brýlemi a kšiltovkou');
 m.onclick=e=>{e.stopPropagation();whack(i)};
 holes[i].append(m);active=i;
 moleTimeout=setTimeout(()=>{if(gameRunning&&active===i){m.remove();active=-1;taunt()}},1250);
}
function taunt(){$('toast').textContent='HAHA!';setTimeout(()=>{if($('toast').textContent==='HAHA!')$('toast').textContent=''},650)}
function whack(i){
 if(!gameRunning)return;
 if(active!==i){taunt();return}
 clearTimeout(moleTimeout);const m=document.querySelector('.mole');if(m)m.remove();active=-1;hits++;score+=10;
 $('score').textContent=score;$('hits').textContent='Zásahy: '+hits;
 $('swing').classList.remove('show');void $('swing').offsetWidth;$('swing').classList.add('show');
 $('toast').textContent='BUM! +10';setTimeout(()=>{if($('toast').textContent==='BUM! +10')$('toast').textContent=''},350);
}
function fmt(s){return '00:'+String(s).padStart(2,'0')}
function updateClock(){
 if(!gameRunning)return;
 remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));
 $('time').textContent=fmt(remaining);
 if(Date.now()>=deadline)finish();
}
function start(){
 clearInterval(clock);clearInterval(spawnLoop);clearTimeout(moleTimeout);
 score=0;hits=0;runCoins=0;remaining=60;active=-1;gameRunning=true;deadline=Date.now()+60000;
 $('score').textContent='0';$('runCoins').textContent='0';$('hits').textContent='Zásahy: 0';$('time').textContent='01:00';$('toast').textContent='';
 $('playerStage').classList.toggle('girl',gender==='girl');$('playerStage').querySelector('.player-skin-img').src=gender==='girl'?'assets/girl.jpg':'assets/boy.jpg';
 $('swing').classList.remove('show');makeHoles();show('game');
 spawnMole();spawnLoop=setInterval(spawnMole,700);clock=setInterval(updateClock,100);
}
function finish(){
 if(!gameRunning)return;gameRunning=false;clearInterval(clock);clearInterval(spawnLoop);clearTimeout(moleTimeout);
 document.querySelectorAll('.mole').forEach(m=>m.remove());active=-1;
 const tens=Math.floor(hits/10);runCoins=hits>=30?(tens-2)*10:0;coins+=runCoins;save();
 $('finalScore').textContent=score+' bodů';$('reward').textContent='Zásahy: '+hits+' • Získáváš '+runCoins+' 🪙 mincí!';show('result');
}
function shop(){
 $('shopItems').innerHTML=items.map(it=>{const has=owned.includes(it.id);return '<div class="item"><div class="look">'+it.look+'</div><b>'+it.name+'</b><p>🪙 '+it.price+'</p><button data-id="'+it.id+'">'+(has?'Vlastníš':it.price===0?'ZDARMA':'Koupit')+'</button></div>'}).join('');
 document.querySelectorAll('.item button').forEach(b=>b.onclick=()=>{const it=items.find(x=>x.id===b.dataset.id);if(owned.includes(it.id))return;if(coins>=it.price){coins-=it.price;owned.push(it.id);save();shop()}else alert('Ještě nemáš dost mincí!')});
}
$('start').onclick=start;$('quit').onclick=finish;$('again').onclick=start;$('homeBtn').onclick=()=>show('home');$('shopOpen').onclick=()=>{shop();show('shop')};$('shopBack').onclick=()=>show('home');
