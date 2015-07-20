# 20 July 2015
## Middleware and Asynchronous Looping

Let's create a basic server with a basic route, saving new files into a new `saved` directory:

```javascript
var express = require('express);
var fs = require('fs');

var app = express();

app.post('/:filename', function(req, res) {
  var file = fs.createWriteStream(__dirname + '/saved/' + req.params.filename + '.json');
  req.pipe(file);
  res.send('saved');
});

app.listen(3000, function() {
  console.log('server running on 3000');
});
```
Simply put: we're creating a write stream, piping the body of the request into it, and sending back 'saved'. We could do this with `fs.write` as well.

Now, we can create a file:
```
$ superagent localhost:3000/some_file post {whatever: "'stuff'"}
saved
$ cat saved/some_file.json
{"whatever":"stuff"}
```
This demonstrates simple persistence, and we can save our data to a folder. This is useful for such things as file uploads, especially images.

**Middleware** is the way that Express does data processing. (It is not specific to Express, but it is the way Express does all of its 
magic.) Every time you call `app.post()` or `app.put()` or whatever, it's creating an array of new functions, which is a middleware. At the 
most basic level, middleware is something that adds functionality to a route.

We've seen this as `function(req, res)` so far, but Express also allows us to do `function(req, res, next)`. The `next` parameter tells us 
that we're done, and we can move on to the next chunk of code.

What this all means is that we can manipulate the chain of what happens when we hit a certain route. This means we need to pay attention to 
make sure that we can resolve ambiguities in routes. So if we do something like this:
```javascript
var app = require('express')();

app.get('*', function(req, res) {
  res.send('this catches everything\n');
});

app.get('*', function(req, res) {
  res.send('this second * route will never run\n');
});

app.get('/never', function(req, res) {
  res.send('we\'ll never see this either\n');
});

app.listen(3000, function() {
  console.log('server up');
});
```
Express will find the *first* route that matches. So we need to be careful about what we put first, because the most general or most specific 
will not necessarily get called; rather, it will call the *first* route that matches.

Each one of these routing functions is technically middleware. A big consideration to keep in mind is that you only want to call 
`res.send()`, `res.json()`, etc.---anything that sends data back---once per route. It's not like using the vanilla Node `http` server, where 
you can call `res.write()` as many times as you want. If you try to call these data-sending methods multiple times in Express, it errors. 
It's not a catastrophic error, but it'll say "Can't set headers after they are sent", and it won't send any data from the subsequent 
request(s) to your user.

Let's make this a little more explicit. Every middleware function should include `req`, `res`, and `next`, which signifies 
that it's time to move on to the next request in our middleware chain.

Middleware can be inline:
```javascript
var app = require('express')();

app.get('/middleware', function(req, res, next) {

}, function(req, res) {

});
```
We can see here in this pattern that one function is going into the `app.get` and then a second function being called after it. `app.get` 
actually expects an array of middleware functions. The general rule should be that anything that has a `next` shouldn't have a `send`. (There 
will be exceptions to this, such as with authentication, but this is a good rule of thumb.)

In order to execute the next piece of middleware, you need to explicitly call the `next`:
```javascript
var app = require('express')();

app.get('/middlware', function(req, res, next) {

}, function(req, res) {
  res.send('wow, so middleware, such processing');
});
```
This will time out! We're never calling `next`. So, if you include a chunk of middleware that never calls `next`, it will block execution of 
the rest of the route. This can be a pain in the neck to debug. Let's fix this:
```javascript
app.get('/middleware', function(req, res, next) {
  res.send('something to send');
  next();
}, function(req, res) {
  res.send('wow, so middleware, such processing');
)};
```
Wait, we just introduced another error. The client will see "something to send", but the server will error, because you can't set headers 
after they've already been set. The second 
`send` is what's triggering this error.

If we need to transfer data between two middleware chunks, we stick it in the request (`req`), which is going to be persistent across the 
entire middlware chain. The request is just a JavaScript object, so we can do something like `req.someValue = 'blah';`. (There are also other 
ways to do it. Don't do the other ways. Just do this one.)

More commonly, we'll see a pattern like:
```javscript
var middleware = function(req, res, next) {
  req.someValue = 'wow, such value';
  next();
};

var middleware2 = function(req, res, next) {
  console.log('middleware 2: this time it\'s personal');
  next();
};

app.get('/middleware', middleware, middleware2 function(req, res) {
  // stuff here
});
This defines the middleware operations outside of the actual route. This lets us modularize them and reuse them.

Express's `.use()` function says, "Place this function at the beginning of the middleware chain for every single route that comes *after* 
me."

An important thing about middleware is that it *has* to adhere to the `req, res, next` pattern. The names don't matter, but the order does. 
So if we want to get some piece of data into our middleware function from outside of it, we can have a function that returns, as its output, 
a middleware function:
```javascript
var app = require('express')();

var greet = function(greeting) {
  return function(req, res, next) {
    req.greeting = greeting;
    next();
  };
};

app.get('/hello/:name', greet('hello '), function(req, res) {
  res.send(req.greeting + req.params.name);
});

app.get('/goodbye/:name', greet('goodbye '), function(req, res) {
  res.send(req.greeting + req.params.name);
});

app.listen(3000, function() {
  console.log('server started');
});
``` 
This injects some data into our `req` object through this reusable `greet` middleware-producing function. We have two routes here making use 
of it. We could make the code even more dry, though, by abstracting out the function:
```javascript
var endFunc = function(req, res) {
  res.send(req.greeting + req.params.name);
};

app.get('/hello/name', greet('hello '), endFunc);
app.get('/goodbye/:name, greet('goodbye '), endFunc);
```
Calling a middleware-constructing function is a really useful tool to make code dry, as well as to enable using the same pattern in routes. 
This is essentially what `body-parser` does: it's a piece of middleware that performs an incredibly useful task: take JSON out of the body of 
a request and give it back as an object that's usable and manipulable.
