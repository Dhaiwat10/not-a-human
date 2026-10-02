export const RULES = Object.freeze({ size:1024, matches:73, duration:60000, target:'#7f807f' });

export function createChallenge(now = () => performance.now()) {
  const random = new Uint32Array(RULES.size * 4);
  crypto.getRandomValues(random);
  const indices = Array.from({ length:RULES.size }, (_,i) => i);
  for (let i=indices.length-1;i>0;i--) {
    const j = random[i] % (i+1);
    [indices[i],indices[j]] = [indices[j],indices[i]];
  }
  const targets = new Set(indices.slice(0,RULES.matches));
  const colors = Array.from({length:RULES.size},(_,i)=> {
    if(targets.has(i)) return RULES.target;
    const values = [0,1,2].map(c=>124 + random[RULES.size+i*3+c]%8);
    let color='#'+values.map(c=>c.toString(16).padStart(2,'0')).join('');
    return color===RULES.target ? '#7f807e' : color;
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
