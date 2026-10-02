import { createChallenge, RULES } from './challenge.mjs';

const $=selector=>document.querySelector(selector);
const surface=$('.experiment'), field=$('#field'), entry=$('#entry'), panel=$('#challenge-panel');
const startButton=$('#start'), hint=$('#entry-hint'), announcement=$('#announcement');
const timer=$('#timer'), clock=$('.clock'), count=$('#selection-count'), fill=$('#time-fill');
let challenge=null, frame=0, finished=false, tiles=[];

function start(){
  if(surface.dataset.state==='success'||challenge?.snapshot().state==='active')return;
  cancelAnimationFrame(frame);finished=false;challenge=createChallenge();
  const fragment=document.createDocumentFragment();
  tiles=challenge.colors.map((color,i)=>{
    const tile=document.createElement('button');tile.className='tile';
    tile.type='button';tile.dataset.index=i;tile.dataset.color=color;
    tile.style.setProperty('--tile-color',color);
    tile.setAttribute('aria-label',`Square ${i+1}, color ${color.toUpperCase()}`);
    tile.setAttribute('aria-pressed','false');
    tile.tabIndex=i===0?0:-1;fragment.append(tile);return tile;
  });
  field.replaceChildren(fragment);field.dataset.challengeId=challenge.id;
  field.dataset.target=challenge.target;
  $('#target-color').textContent=challenge.target.toUpperCase();
  $('.swatch').style.backgroundColor=challenge.target;field.dataset.duration=RULES.duration;
  hint.hidden=true;entry.hidden=true;panel.hidden=false;
  startButton.setAttribute('aria-checked','false');
  startButton.removeAttribute('aria-disabled');
  startButton.removeAttribute('aria-describedby');
  surface.dataset.state='active';delete surface.dataset.elapsed;
  fill.style.transform='scaleX(1)';
  count.innerHTML='0 <span class="muted">/ 73</span>';
  timer.textContent=(RULES.duration/1000).toFixed(3);
  announcement.textContent='Select all 73 matching squares. You have 60 seconds.';
  challenge.start();clock.setAttribute('aria-label','60-second challenge running');
  $('#challenge-title').focus({preventScroll:true});
  frame=requestAnimationFrame(update);
}

function update(){
  if(finished)return;
  const data=challenge.snapshot();
  timer.textContent=(data.remaining/1000).toFixed(3);
  fill.style.transform=`scaleX(${data.remaining/RULES.duration})`;
  if(data.state!=='active'){finish(data);return;}
  frame=requestAnimationFrame(update);
}

function finish(data){
  if(finished)return;finished=true;cancelAnimationFrame(frame);
  const success=data.state==='success';
  surface.dataset.state=data.state;
  surface.dataset.elapsed=(data.elapsed/1000).toFixed(3);
  panel.hidden=true;entry.hidden=false;
  field.replaceChildren();tiles=[];
  startButton.setAttribute('aria-checked',String(success));
  if(success){
    startButton.setAttribute('aria-disabled','true');
    startButton.removeAttribute('aria-describedby');
  }else{
    startButton.removeAttribute('aria-disabled');
    startButton.setAttribute('aria-describedby','entry-hint');
  }
  hint.hidden=success;
  announcement.textContent=success?'Verified.':'Not verified. Try again.';
  startButton.focus({preventScroll:true});
}

function select(tile){
  if(!challenge||finished)return;
  const index=Number(tile.dataset.index);
  if(!challenge.toggle(index)){
    const data=challenge.snapshot();
    if(data.state==='failed')finish(data);
    return;
  }
  const data=challenge.snapshot();
  tile.setAttribute('aria-pressed',String(data.selected.includes(index)));
  count.innerHTML=`${data.selected.length} <span class="muted">/ 73</span>`;
  if(data.state!=='active')finish(data);
}

field.addEventListener('click',e=>{
  const tile=e.target.closest('button.tile');
  if(tile)select(tile);
});
field.addEventListener('keydown',e=>{
  const tile=e.target.closest('button.tile');if(!tile||finished)return;
  const offsets={ArrowRight:1,ArrowLeft:-1,ArrowDown:32,ArrowUp:-32};
  if(!(e.key in offsets))return;e.preventDefault();
  const next=Math.max(0,Math.min(RULES.size-1,Number(tile.dataset.index)+offsets[e.key]));
  tile.tabIndex=-1;tiles[next].tabIndex=0;tiles[next].focus({preventScroll:true});
});
startButton.addEventListener('click',start);
