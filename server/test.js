var a = 'jairo';
var b = a;
console.log(b);
var a = 'odie';
console.log(b);

var x = {name: 'jairo'};
var y = x;
console.log(y);
var x = {name: 'odie'};
console.log(y);

/**
jairo
jairo
{ name: 'jairo' }
{ name: 'jairo' }
*/

var todo = 'test';
var obj1 = {todo};
console.log(obj1);
console.log({obj1});
console.log('----');
var {obj1} = {todo};
console.log(obj1);
console.log({obj1});
console.log('----');
var {obj2} = {obj2: 'jairo'}; // obj2 has to match on both sides
console.log(obj2);
console.log({obj2});
/**
jairo
jairo
{ name: 'jairo' }
{ name: 'jairo' }
{ todo: 'test' }
{ obj1: { todo: 'test' } }
----
undefined
{ obj1: undefined }
----
jairo
{ obj2: 'jairo' }
 */