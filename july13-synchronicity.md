# 13 July 2015
## The Node event loop and `nextTick`
The Node event loop is a queue; it does not run asynchronously. Whenever you specify a method to run as asynchronous (whch is is the default for many methods), the method will take a callback function, and it will place that callback in the event loop. It will not actually execute that function until it comes to the top of the queue.

`process.nextTick(callback)` is the manual device that underlies the event loop, i.e. the device that actually puts the callback onto the event queue.
```javascript
function one() {
  console.log('From function one');
}
process.nextTick(one);
console.log('here');
```
When executed, this will print "here" before "From function one". When we get to line 4, we add `one()` to the event loop. When we get to line 5, Node executes that code, which is a synchronous function. Then we go back to the event loop, get the top item on the queue, which is the function `one()`, execute it, and we're done.

Conceptually this is the same as the asynchronous function call:
```javascript
setTimeout(function() {
  one();
}, 0);
```
which just adds the `one()` function onto the event loop, telling it to run as immediately as possible.

Asynchronous events on the event loop are actually run not when the current function call finishes running, but when the current function *call stack* is done. For example:

```javascript
function one() {
  console.log('From function one');
}
function two() {
  console.log('From function two');
}
function myCallStackOne() {
  console.log('From call stack One');
  process.nextTick(one);
  myCallStackTwo();
}
function myCallStackTwo() {
  console.log('From call stack Two');
  process.nextTick(two);
}

myCallStackOne();
console.log('hello');
```
Outputs:
```
From call stack One
From call stack One
hello
From function one
From function two
```
But even though this is a queue, you should not rely on it directly, because you can never be absolutely certain what order your I/O is going to do asynchronous function calls. So you should be using more abstract asynchronous function calls.


## Testing
### Asynchronous testing and `done()`
```javascript
var expect = require('chai').expect;

describe('some sort of program', function() {
  it('some asynchronous task', function() {
    setTimeout(function() {
      expect(true).to.eql(false);
    }, 1000);
  });
});
```
This will pass! Why?

All of this follows all the same synchonicity code. When we're inside the `it()` function, it will put the code in `setTimeout()` (wait 1000 seconds) and then put the anonymous function on the event loop. But then it will keep on running, and if an `it()` block runs all the way to the end without an error, it passes. So we have created a false positive.

This is conceptually the exact same as
```javascript
it('some asynchronous task', function() {

});
```
which will also pass! Node never even saw the expectation in the first example. Even though later on it will (maybe) pop that anonymous function off the event later and (maybe) run it (if Node hasn't just exited), our testing code doesn't care because it will never run it.

The way around this is to use the `done()` function. We pass the `done` parameter (you can call this anything, but convention calls it `done`) to our callback function, and then call `done()` after the callback:

```javascript
var expect = require('chai').expect;

describe('a program', function() {
  it('will try and say true === false', function(done) {
    setTimeout(function() {
      expect(true).to.eql(false);
      done();
    }, 1000);
  });
});
```
This time it will fail.

What is `done()` doing differently? Whenever you pass a parameter to the callback function of your `it()` function in Mocha, the `it()` block will not finish running until either the `done()` function is called, or the event in the `it()` block finishes running. (So if you have two asynchronous functions to test, run two separate tests, because one of them won't get run once `done()` is called. However, you may still have multiple expectations in an `it()` block when you're testing an asynchronous function.)

Weird things can happen if you leave out `done()`:
```javascript
describe('a program with numbers', function() {
  it('an async call', function() {
    setTimeout(function() {
      expect(3).to.eql(4);
    }, 1000);
  });

  it('another async call with booleans', function(done) {
    setTimeout(function() {
      expect(true).to.eql.(true);
      done();
    }, 1000);
  });
});
```
This will pass with a false positive for the first test (true = false), and a false negative for the second (true = true). What gives?

We're getting some bleed-through here. The failure in the first `it()` block has bubbled down to the second `it()` block. Mocha will dump out the error:
```
Uncaught AssertionError: expected 3 to deeply equal 4
```
This is because we've screwed up our event queue. The second `it()` is pulling the asynchronous function we set up in the first `it()` block and running it, which is why the assertion that true = true failed with the error that 3 ≠ 4.

Moral of the story: if you have an asynchronous function that you're testing, pass in `done` as an argument to the anonymous function callback in your `it()` block, and make sure you call `done()` at the end.

The benefit of this, from a TDD standpoint: it's good to see your tests fail, then leave the tests alone, and implement your functions to pass the tests. Write a test and make sure you can make it fail.
