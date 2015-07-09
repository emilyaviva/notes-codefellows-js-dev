# July 6
## Test-driven development

### Mocha and Chai

[Chai API documentation](http://chaijs.com/api/bdd/)

The Mocha framework lets us run tests that are in our `test` directory. It is agnostic to what testing framework you're actually using. In our examples, we are using Chai.

`describe()` and `it()` take a name for the sequence of tests they're running, and a callback function that sets out the expectations for what you want your code to be doing. (Technically, you don't need `describe()`; it's there to improve readability.)

Chai provides several different styles for saying what you want: `should`, `assert`, and `expect`. Today, we're going to stick to `expect`.

```javascript
// test/greet-test.js
var greet = require('../greet');
var expect = require('chai').expect;

describe('greet.js', function() {
  it('should say \'Hello Emily\' when passed \'Emily\'', function() {
    expect(greet('Emily').to.eql('Hello Emily');
  });
});
```
(Mocha has lots of chaining options, so you can make it fairly readable. The `.to()` chained method is really just there to make it easier to read.)

`eql()` is shorthand for "deeply equal".

Let's break this test intentionally:

```javascript
// greet.js
modules.exports = function(name) {
  return 'Hello' + name;
}
```

Oh no! We missed the space, and Mocha spat out a fail on the test! Remove the space, and the code will pass. Then, you can go on and write more tests, and then go on to write more code.

### Always test first?

Sometimes this programming style (test first, write code to pass the tests) is appropriate, and other times you just don't know enough about your domain or what you want to do to make that work.

Let's add another function before we add the test and its expectation:

```javascript
// greet.js
exports.hello = function(name) {
  return 'Hello ' + name;
}

exports.bye = function(name) {
  return 'Goodbye ' + name;
}
```
Now, we can write the tests:

```javascript
// test/greet-test.js
var greet = require('../greet');
var expect = require('chai').expect;

describe('greet.js', function() {

  it('should say \'Hello Emily\' when passed \'Emily\'', function() {
    expect(greet.hello('Emily')).to.eql('Hello Emily');
  });

  it('should say \'Goodbye Emily\' when passed \'Emily\'', function() {
    expect(greet.bye('Emily')).to.eql('Goodbye Emily');
  });

});
```
Yay! It works!

```
$ mocha

  greet.js
    ✓ should say 'Hello Emily' when passed 'Emily'
    ✓ should say 'Goodbye Emily' when passed 'Emily'

  2 passing (8ms)
```

### Before and after tests
Let's say there's some setup to do before and after. We can use `before()` and `after()` to run before and after the `it()` functions in some particular `describe()` block. (This is the functional use of `describe()`: when you need some kind of initialization or destruction after.)
