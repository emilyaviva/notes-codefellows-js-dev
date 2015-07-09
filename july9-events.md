# 9 July 2015

## Node events
### What's an event?

Event-based programming means: when some kind of event happens, execute some action. Lots of web stuff works this way ("when I send a GET request to this URL, do some stuff").

Node has an event emitter constructor built in. We make our own so that we're not conflicting with Node's own eventing that it does internally.
```javascript
var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter();
```
You can create your own events with `.on(name, callback)`, which callback can either be defined externally or inline:
```javascript
function sayHello() {
  console.log('hello');
}
ee.on('someEvent', sayHello());
ee.on('anotherEvent', function() {
  console.log('what\'s up');
});
```
We can cause an event to happen with `emit`, which will do something when an event that is listened for is called:
```javascript
ee.emit('someEvent');
```
We can also call events from inside events too:
```javascript
ee.on('insideYetAnotherEvent', function() {
  console.log('inside another event!');
  ee.emit('someEvent');
});
```
The Node event loop is like a queue. Initially, our main code is running, and our event loop is empty. When we call an event, it adds it to the event loop. When we ask it to run that event, it runs that event, and the next event to be run goes to the top of the queue. When the event finishes running, Node will poll the event loop, get the next event, and execute it, until nothing is left in the event loop. This is why we don't run into synchronicity issues here.

You can do other things with events, such as run an event only once, or remove listeners:
```javascript
ee.on('customer', function {
  console.log('welcome customer!');
});
ee.emit('customer');
ee.removeAllListeners();
ee.emit('customer')
```
This is a good way to loosely couple your code, because events that don't get responded to will be harmless. You can remove a particular listener as well with `removeListener()`.

Another example is `once` (say the first customer gets a free drink):
```javascript
ee.once('customer', function() {
  console.log('Welcome first customer! You get a free drink');
});
ee.emit('customer');
ee.emit('customer');
ee.emit('customer');
```
Here, we only offer the first customer a free drink, and the other ones just get welcomed.

You can also have multiple events for the same handler:

```javascript
function showToTable() {
  console.log('This way please');
}
function showMenu() {
  console.log('Here is your menu');
}
ee.on('customerEnters', showToTable());
ee.on('customerEnters', showMenu());
ee.emit('customerEnters'); // will trigger both events
```

By default you can only have ten listeners for any given event; more will cause it to error out. You can override this with `setMaxListeners()`.

### Longer example

```javascript
var EventEmitter = require('events').EventEmitter;
var ee = new EventEmitter();

var kilometers = 0;

ee.once('drive', function() {
  console.log('Starting up the car');
});

ee.on('drive', function(dist) {
  if (dist) {
      console.log('Driving ' + dist + ' km');
      kilometers += dist;
    }
});

ee.on('log', function() {
  console.log(kilometers + ' km driven in total');
});

ee.emit('drive', 10);
ee.emit('drive', 6);
ee.emit('drive', 198);
ee.emit('drive');
ee.emit('log');
ee.removeAllListeners();
ee.emit('drive');
ee.emit('drive', 19);
```
### Callback hell
Events are useful to avoid callback hell. In this example, we will read in one file, print out its contents, then move on to the next file and print out its contents, etc.
```javascript
var fs = require('fs');
fs.readFile('./file1.txt', function(err, data) {
  console.log(data.toString());
  fs.readFile('./file2.txt', function(err, data) {
    console.log(data.toString());
    fs.readFile('./file3.txt' function(err, data) {
      console.log(data.toString());
    });
  });
});
```
As you can see this gets awful really quickly. It's awkward to follow, for one. What if you wanted to change the order of these? Event emitters can get us around these problems by keeping these things all top-level.
```javascript
ee.on('readout', function(file) {
  fs.readFile(file, function(err, data) {
    console.log(data.toString());
  });
};

ee.emit('readout', './file1.txt');
ee.emit('readout', './file2.txt');
ee.emit('readout', './file3.txt');
```
Another solution to this is promises, a feature of ES6, which we will cover next week.

You can modify an event emitter by creating our own constructor function and setting its prototype equal to `events.EventEmitter`:

```javascript
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits; // The util package is builtin to Node
var MyEmitter = function() {};
inherits(MyEmitter, EventEmitter);
var ee = new MyEmitter();
```
