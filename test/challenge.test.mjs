import test from 'node:test';
import assert from 'node:assert/strict';
import {createChallenge,RULES} from '../dist/challenge.mjs';

test('every fresh board has exactly 73 matching tiles',()=>{
  const boards=Array.from({length:20},()=>createChallenge());
  for(const board of boards){
    assert.equal(board.colors.length,1024);
    assert.equal(board.colors.filter(c=>c===RULES.target).length,73);
    assert.ok(board.colors.every(c=>/^#[0-9a-f]{6}$/.test(c)));
  }
  assert.equal(new Set(boards.map(b=>b.id)).size,20);
  assert.notDeepEqual(boards[0].colors,boards[1].colors);
});
test('only the exact selection passes; removing an extra tile completes verification',()=>{
  let time=0;const board=createChallenge(()=>time);
  assert.equal(board.toggle(0),false);
  board.start();time=400;
  const wrong=board.colors.findIndex(c=>c!==RULES.target);
  board.toggle(wrong);
  board.colors.forEach((c,i)=>{if(c===RULES.target)board.toggle(i);});
  assert.equal(board.snapshot().state,'active');
  board.toggle(wrong);
  assert.equal(board.snapshot().state,'success');
  assert.equal(board.snapshot().elapsed,400);
  time=RULES.duration+9000;
  assert.equal(board.snapshot().state,'success');
  assert.equal(board.snapshot().elapsed,400);
});
test('deadline is enforced on clicks even when rendering timers have not run',()=>{
  let time=0;const board=createChallenge(()=>time);board.start();
  const targets=board.colors.map((c,i)=>c===RULES.target?i:-1).filter(i=>i>=0);
  time=RULES.duration-1;targets.slice(0,-1).forEach(i=>board.toggle(i));
  assert.equal(board.snapshot().state,'active');
  time=RULES.duration;
  assert.equal(board.toggle(targets.at(-1)),false);
  assert.equal(board.snapshot().state,'failed');
  assert.equal(board.snapshot().selected.length,72);
  assert.equal(board.start(),false);
});
test('selection toggles and invalid indices cannot count as tiles',()=>{
  const board=createChallenge(()=>0);board.start();
  for(const i of [-1,1024,1.5,NaN])assert.equal(board.toggle(i),false);
  board.toggle(12);board.toggle(12);
  assert.deepEqual(board.snapshot().selected,[]);
});
