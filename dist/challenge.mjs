export const RULES = Object.freeze({ size:1024, matches:73, duration:60000 });

let previousTarget = -1;
const hex = values => '#' + values.map(c=>c.toString(16).padStart(2,'0')).join('');

export function createChallenge(now = () => performance.now()) {
  const random = new Uint32Array(RULES.size * 4 + 1);
  crypto.getRandomValues(random);
  // Keep channels away from the edges so nearby shades never need clamping.
  const range = 192;
  let targetIndex = random[RULES.size * 4] % (range ** 3);
  if(targetIndex === previousTarget) targetIndex = (targetIndex + 1) % (range ** 3);
  previousTarget = targetIndex;
  const channels = [0,1,2].map(c=>32 + Math.floor(targetIndex / range ** c) % range);
  const target = hex(channels);
  const indices = Array.from({ length:RULES.size }, (_,i) => i);
  for (let i=indices.length-1;i>0;i--) {
    const j = random[i] % (i+1);
    [indices[i],indices[j]] = [indices[j],indices[i]];
  }
  const targets = new Set(indices.slice(0,RULES.matches));
  const colors = Array.from({length:RULES.size},(_,i)=> {
    if(targets.has(i)) return target;
    const values = channels.map((channel,c)=>channel + random[RULES.size+i*3+c]%7 - 3);
    if(values.every((value,c)=>value===channels[c])) values[2] += 1;
    return hex(values);
  });
  let state='ready',started=0,elapsed=0;
  const selected=new Set();
  const tick=()=> {
    if(state==='active') {
      elapsed=Math.min(RULES.duration,Math.max(0,now()-started));
      if(elapsed>=RULES.duration) state='failed';
    }
    return state;
  };
  return {
    id:crypto.randomUUID(),
    target,
    colors:Object.freeze(colors),
    start(){ if(state!=='ready') return false; started=now(); state='active'; return true; },
    toggle(index){
      tick();
      if(state!=='active'||!Number.isInteger(index)||index<0||index>=RULES.size) return false;
      if(selected.has(index)) selected.delete(index); else selected.add(index);
      if(selected.size===RULES.matches&&[...selected].every(i=>targets.has(i))) state='success';
      return true;
    },
    snapshot(){tick();return {state,elapsed,remaining:Math.max(0,RULES.duration-elapsed),selected:[...selected]};}
  };
}
