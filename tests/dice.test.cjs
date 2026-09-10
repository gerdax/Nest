const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const DiceTest = require('../js/DiceTest.js');
test('four d6 values, inclusive target, and extreme outcomes', () => {
 assert.deepEqual(DiceTest.sample(14, () => 0), {values:[1,1,1,1],total:4,success:false});
 assert.deepEqual(DiceTest.sample(16, () => .9999), {values:[6,6,6,6],total:24,success:true});
 assert.equal(DiceTest.sample(16, () => .5).success, true);
 assert.equal(DiceTest.sample(17, () => .5).success, false);
});
function setup(success, locked = false) {
 class BoxCard {}
 let resolve;
 const sandbox = { BoxCard, DiceTest: class { wait() { return new Promise(r => resolve=r); } }, Math };
 vm.createContext(sandbox);
 vm.runInContext(fs.readFileSync(require.resolve('../js/CardManager.js'),'utf8')+'\nthis.Manager = CardManager;',sandbox);
 const passage = locked ? Object.assign(new BoxCard(),{isLocked:true}) : {cardType:'spatial',id:'start'};
 const box={cardType:'box',id:'box'}, spatial={cardType:'spatial',id:'next'};
 const story = {passages:new Map([['box',box],['next',spatial]]), getNextCard(){return box;}};
 const manager = new sandbox.Manager({parentElement:{querySelector(){return null;}}},null,{},passage,story);
 manager.resetCard=()=>{};
 manager.transitionToChoice=(card)=>{manager.selected=card;};
 return {manager, settle:()=>resolve({success})};
}
test('passage outcomes route to a container or another spatial card', async () => {
 for(const success of [true,false]) {
 const {manager,settle}=setup(success);
 const pending=manager.choose('right'); settle(); await pending;
 assert.equal(manager.selected.cardType,success?'box':'spatial');
 }
});
test('failed locked check does not open loot and cannot be retried on the same card', async()=>{
 const {manager,settle}=setup(false,true);
 const pending=manager.choose('right');
 await manager.choose('right'); // Busy guard must not create another pending roll.
 settle(); await pending;
 assert.equal(manager.selected,undefined);
 assert.equal(manager.lockFailed,true);
 await manager.choose('right');
 assert.equal(manager.busy,false);
 await manager.choose('left');
 assert.ok(manager.selected);
});
test('disposing a manager prevents an awaited roll from navigating',async()=>{
 const {manager,settle}=setup(true);
 const pending=manager.choose('right');manager.disposed=true;settle();await pending;
 assert.equal(manager.selected,undefined);
});
