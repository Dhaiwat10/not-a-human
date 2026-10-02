import test from 'node:test';
import assert from 'node:assert/strict';
import {createChallenge,RULES} from '../dist/challenge.mjs';

test('every fresh board has exactly 73 matching tiles',()=>{
  const boards=Array.from({length:20},()=>createChallenge());
  for(const board of boards){
    assert.equal(board.colors.length,1024);
    assert.equal(board.colors.filter(c=>c===board.target).length,73);
    assert.ok(board.colors.every(c=>/^#[0-9a-f]{6}$/.test(c)));
  }
  assert.equal(new Set(boards.map(b=>b.id)).size,20);
  assert.notDeepEqual(boards[0].colors,boards[1].colors);
});
test('only the exact selection passes; removing an extra tile completes verification',()=>{
  let time=0;const board=createChallenge(()=>time);
  assert.equal(board.toggle(0),false);
  board.start();time=400;
  const wrong=board.colors.findIndex(c=>c!==board.target);
  board.toggle(wrong);
  board.colors.forEach((c,i)=>{if(c===board.target)board.toggle(i);});
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
  const targets=board.colors.map((c,i)=>c===board.target?i:-1).filter(i=>i>=0);
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


test('distractors stay within three RGB steps of each randomized target',()=>{
  let previous;
  for(let attempt=0;attempt<100;attempt++){
    const board=createChallenge();
    assert.notEqual(board.target,previous);
    previous=board.target;
    const rgb=color=>color.slice(1).match(/../g).map(c=>parseInt(c,16));
    const target=rgb(board.target);
    assert.ok(target.every(c=>c>=32&&c<=223));
    assert.equal(board.colors.filter(c=>c===board.target).length,RULES.matches);
    for(const color of board.colors){
      assert.ok(rgb(color).every((c,i)=>Math.abs(c-target[i])<=3));
    }
  }
});

test('a repeated random target is changed for the next run',t=>{
  t.mock.method(crypto,'getRandomValues',array=>{array.fill(0);return array;});
  const first=createChallenge(),second=createChallenge();
  assert.notEqual(first.target,second.target);
  for(const board of [first,second]){
    assert.equal(board.colors.filter(c=>c===board.target).length,RULES.matches);
  }
});
