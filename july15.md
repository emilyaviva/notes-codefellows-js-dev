# 15 July 2015
## Lexical versus dynamic scoping
### `call()`, `bind()`, and `apply()`
Let's say we have a simple function:
```javascript
function add(x, y) {
  return x + y;
}
```
Then we end up doing `add(4, 10)`, `add(4, 20)`, `add(4, -827)`. Gee, it would be really nice to have some kind of function where that 4 variable was set in place. We could define an `add4(y)` function but that's repetitive code. What we can do instead is use `bind()` to bind one of those variables.
```javascript
var add4 = add.bind(null, 4);
```
The `bind()` operation sets the value of `this` to its first parameter. In this case, we don't care what `this` is, so we just set it to `null`. After that, the arguments correspond to the order of parameters in the original function, so `x` is now set to `4` in our `add4()` function.

Let's see a more complicated example:
```javascript
function accumulator(x) {
  var z = 7;
  return function(y) {
    return x + y + z;
  }
}
var add4 = accumulator(4);
```
Line-by-line: All that's getting returned is the internal anonymous function, but when we call the wrapping function it will still have access to each of the variables. This is a **closure**. When you return a function in JavaScript, you are also returning its scope with it. This style of scoping is **lexical scoping** because the scoping is based on the order that you read it, rather than in terms of how the code actually runs. **Dynamic scoping** looks instead at what called it, rather than how it was written.

In JavaScript, the `this` keyword is dynamically scoped.
```javascript
function Person(name) {
  this.name = name;
}
Person.prototype.logName = function() {
  console.log(this.name);
}
```
What if, in this pattern, `this` were scoped like any other variable? It would loko inside the function for `this`, and since `this` is not defined anywhere in this function, it would look in the global scope. But JavaScript does not do that: it tests for `this` based on *execution order*. When we actually run the function, it will determine `this` based on dynamic, rather than lexical, scoping.
```javascript
var p = new Person('george');
p.logName();
```
The `p` object actually calls the function `logName`, so `this` now refers to `p`.

We can explicitly bind `this` to whatever we want with `call()`, `bind()`, or `apply()`. Consider:
```javascript
var nameLogger = p.logName;
nameLogger();
```
The `nameLogger` function will then have its `this` set to the global object, or if you're in strict mode, `undefined`. So let's set it explicitly:
```javascript
nameLogger().bind(p);
```
This will bind `this` to the object `p`. The `bind` function enables us to simulate lexical scoping for `this`.

The difference between `bind()`, `call()`, and `apply()` is that `call()` and `apply()` actually call the argument rather than simply binding its `this`.

## ECMAScript 6 with Babel
[BabelJS](https://babeljs.io)

Babel is a tool (available in npm) for compiling ES6 to ES5. You can run ES6 code directly on the command line with `babel-node`. It is useful for testing out ES6 directly. If you run `babel` directly, it will compile the ES6 input file to ES5.

Babel has a Gulp plugin: `gulp-babel`. We can use it in a Gulpfile as so:
```javascript
var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('build', function() {
  return gulp.src('src/*.js')
             .pipe(babel())
             .pipe(gulp.dest('built'));
});
```
And use it as so:
```javascript
// src/index.js
let x = 4;
```
This will create the `/built` directory and there will be an `index.js` file in it:
```
// built/index.js
"use strict";

var x = 4;
```
The `let` keyword allows us to bind variables to the block they're in, rather than to the global object. Babel will use `var` when it compiles but it will cleverly rename it so it will not interfere with other variables in the global scope.

### Constants

Another feature of ES6 is constants: we can declare a constant as so:
```javascript
const PI = 3.14159265358979;
```
In ES6 this is a read-only (that is to say, un-reassignable) variable. But you can still change it (so "constant" is a little bit of a misnomer).
```javascript
const myArray = [1,2,3,4,5];
myArray.push(6);
console.log(myArray);
// -> [1,2,3,4,5,6]
myArray = [1,2,3,4,5,6,7,8,9];
// -> error!
```

### Template strings
We can put string concatenation in-line. Inside a string using backticks instead of quotes, you can use `${}` to interpolate any JavaScript expression you want.

```javascript
let name = 'John';
console.log(`How are you ${name}`);
// -> How are you John
function gimmieString() {
  return 'a really complicated computed value';
}
console.log(`first result ${gimmieString()} there you go ${name}`);
// -> first result a really complicated computed value there you go John
console.log(`${2 + 2}`);
// -> 4
```

### Arrow functions
This is a way to help with writing anonymous functions.
```javascript
// ES5
var adder = function(x, y) {
  return x + y;
};
// ES6
var adderArrow = (x, y) => {
  return x + y;
};
```
These arrows have the benefit of preserving lexical `this`. The actual equivalent ES5 version of the `adder` function above is:
```javascript
var adder = function(x, y) {
  return x + y;
}.bind(this);
```
(But Babel will only include that `bind(this)` if it affects the function's execution, which in this case it doesn't.)

This works for expressions, statements, and it can be used on literals. If it's one line, you can omit the `return` since it will just return the result of the expression:
```javascript
// Literal
[1, 2, 3].map(n => n * 2);
// or more preceisely
[1, 2, 3].map( (n) => n * 2);
// Expression bodies
var odds = evens.map(x => x + 1);
var nums = evens.map((x, i) => x + 1);
// Statement bodies
var multiplesOfFive = [];
nums = [1, 2, 5, 15, 25, 32];
nums.forEach(v => {
  if (v % 5 === 0)
    multiplesOfFive.push(v);
});
// the ES5 equivalent of the above:
nums.forEach(function(v) {
  if (v % 5 === 0) {
    fives.push(v);
  }
}, this);
```
### Classes
[ES6 classes at MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
Classes are sugar over the normal prototype-based inheritance of JavaScript. They can have static methods that are called without instantiating their class.
```javascript
class Polygon {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }

  get area() {
    return this.calcArea()
  }

  calcArea() {
    return this.height * this.width;
  }

  static distance(a, b) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;

      return Math.sqrt(dx*dx + dy*dy);
  }
}
```
### Default arguments
```javascript
function greet(name, greeting='hello') {
  console.log(`${greeting} ${name}`);
}
greet('emily');
// -> hello emily
greet('john', 'hola');
// -> hola john
```
### Spread operator

You can collect your arguments for a function in an array.
```javascript
function foodPurchases(name, food, price) {
  console.log(`${name} purchased ${food} for ${price}`);
}
let myArray = ['janet', 'bagels', 'twelve dollars'];

// ES6 spread operator
foodPurchase(...myArray);
// -> janet purchased bagels for twelve dollars

// ES5 way to do this:
foodPurchase.apply(null, myArray);
```

### Promises
```javascript
var p = new Promises((resolve, reject) => {
  <stuff goes here!>
});

p.then(STUFF).catch(STUFF);
```
We will write some asynchronous callbacks for `resolve` and `reject` inside our promise. When `then` is called, if the promise resolves, the stuff in `then` will be executed. If it is rejected, the stuff in `catch` will be executed.
```javascript
// promises.js
let fs = require('fs');

var p = new Promise((resolve, reject) => {
  fs.readFile('./promises.js', (err, data) => {
    err ? reject(err) : resolve(data.toString());
  });
});

p.then((data) => {
  console.log(data);
}).catch((err) => {
  console.log('Error!!');
});
```
This will output its own code! (Woohoo quines! Even though technically speaking this is a cheating quine because it takes some input.)
