# Notes 6 July 2015

## Modules for Noobs

[Slides for today](http://darrenderidder.github.io/talks/ModulePatterns/#/)

- NodeJS: a CommonJS Module Implementation
- Your code uses `require` to include modules.
- Modules use `exports` to make things available

### IFFE (immediately invoked function expression)

The only thing that creates a scope in JavaScript is a function:

```javascript
if (true) {
  var x = 4;
}
console.log(x); // will know the value of x!
```

To restrict it, you'd have to wrap your entire file in its own function.

Node is a little different. In Node, you can pretend that this is what's happening. (This doesn't hold true for browsers and so forth: this is Node-only.)

Node provides two globals: `require` and `module.exports`. These are used to handle the operations of making things available and using them in.

### Export an anonymous function

```javascript
// greetOne.js
module.exports = function(name) {
  return name + 'hello!';
};

// consumeGreetOne.js
var greet = require('./greetOne'); // Node automatically adds .js if not given
```

Each module returns a `module.exports` object. This object is what is imported when you do `require`.

### Export a named function

Instead of `modules.export`, we use `exports.` instead. This also changes how we consume it.

```javascript
// multiGreet.js
exports.hello = function(name) {
  return 'hello ' + name + '!';
}

exports.bye = function(name) {
  return 'bye ' + name + '!';
}
```

We can consume it one of two ways:

1. We can pull out specific functions (and assign them whatever names want, etc.)

```javascript
//consumeMultiGreet.js
var sayHello = require('./multiGreet').hello;
var sayGoodbye = require('./multiGreet').bye;
sayHello();
sayGoodbye();
```

2. We can refer to the module as a whole, and then refer to its specific properties:

```javascript
//consumeMultiGreet.js
var multiGreet = require('./multiGreet');
multiGreet.hello();
multiGreet.bye();
```
The second option preserves **namespacing**, showing the specificity of where everything has come from. This reduces the risk that some other name will clobber something from your module.

### Exporting a anonymous object

Instead of creating some type of function, we are going to export the object. Create the constructor function, change its prototype, whatever, and then you can export that.

This pattern is sometimes called a *factory*.

```javascript
// animal.js
var Animal = function(name) {
  this.name = name;
}

Animal.prototype.printName = function() {
  console.log('This Animal has the name ' + this.name);
}

module.exports = new Animal;
```

(Remember, it is generally preferred to use the prototype method definition that we are using here, instead of saying something like `this.log = function() { ... }` in the function definition, because the latter would create lots of copies of that function in memory afterwards for each subsequent object created.)

### Export a named object

```javascript
// add to animal.js
exports.betty = new Animal('betty');
exports.johnny = new Animal('johnny');
```

Now, clients requiring this code can get these objects.

### Other patterns
- Export named prototype: one module, many exported things
- Export anonymous prototype: much simpler client interface

### One more pattern

As seen inside the `fs` module (built in to Node):

```javascript
var fs = exports = modules.exports;
fs.ReadFile = function() { ... };
fs.WriteFile = function() { ... };
```

You don't see this as often, but you'll see it sometimes in other people's code.

## `module.exports` vs. `exports`

`module.exports` and `exports` both initially point to `{}` (i.e., an empty object). They, therefore, both refer to the *same object*.

So, why can't we use them interchangeably?

Because: `modules.exports = function() { ... };` — and now, `exports` no longer points to the same thing as `modules.exports`.

```javascript
// maybeBroken.js
exports = function() {
  console.log('Will I work??');
};

modules.exports.name = function() {
  console.log('How about me?');
};
```
The former won't work, but the latter will.
