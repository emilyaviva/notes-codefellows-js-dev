# 16 July 2015
## Simple Express routes
[Express Guide for Routing](http://expressjs.com/guide/routing.html)
### Intoduction to Express

We include and enable Express with:
```javascript
var express = require('express');
var app = express();
```
We can use `app.<some HTTP verb>` to create routes. The first parameter you pass it is the endpoint itself.
```javascript
app.get('/kitten', function(req, res) {
  res.send('hello from a kitten!');
});
```
We didn't have to explicitly call `res.end()`, because Express calls it for you.

Then finally, to get it running:
```javascript
app.listen(3000, function() {
  console.log('Server started');
});
```
We can also see that Express puts in a whole lot of stuff in our response headers for us, like the HTTP status, rather than making us do it manually:
```
$ curl -i localhost:3000/kitten
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 20
ETag: W/"14-/w+Ht1gx7qNm0t7oTk6SmQ"
Date: Thu, 16 Jul 2015 20:37:13 GMT
Connection: keep-alive

hello from a kitten!
```
Typically, servers spew out JSON. But we don't need to set the Content-Type manually and stringify the JSON and all that stuff. In Express, we can just pass in JavaScript objects:
```javascript
app.get('/kitten', function(req, res) {
  res.json({name: 'Fluffy McKitten'});
});
```
Output:
```json
{"name":"Fluffy McKitten"}
```
We can even see this in the header that the Content-Type is now set to JSON:
```
$ curl -i localhost:3000/kitten
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 26
ETag: W/"1a-2bQuZAlkgP4nE7Idbry4bA"
Date: Thu, 16 Jul 2015 20:40:18 GMT
Connection: keep-alive

{"name":"Fluffy McKitten"}
```
### More about RESTful design
Here are some endpoints we might have for a kittens resource:
- `/kittens` — a route to GET all kittens
- `/kittens/:id` — a route to GET some specific kitten
- `/kitten` — a route for POST to create a new kitten

Let's define a schema for our kitten data:
- name (a string)
- cuteness (an integer)
- age (an integer)
- friends (an array of kittens)
A GET request to an arbitrary kitten in this schema might return this JSON object:
```json
{
  "name": "Fluffy",
  "cuteness": 3,
  "age": 5,
  "friends": []
}
```
Let's define a route to get this kitten (since Fluffy is our first kitten, they get the first ID):
```javascript
app.get('/kitten/1', function(req, res) {
  // This is where we talk to our Mongo database, but here we will hard-code
  var kitten = {
    name: 'Fluffy',
    cuteness: 3,
    age: 5,
    friends: []
  };
  res.json(kitten);
});
```
This isn't a very robust solution, because for each and every cat we would end up with a separate route. Instead, Express lets us have a variable in our route, which will be in our request parameters:
```javascript
app.get('/kitten/:id', function(req, res) {
  var id = req.params.id;
  // use this ID to look up specific kitten in database
});
```
Let's add a POST so we can create new kittens. To do this, we need to have some way to get the body of the POST request. Express is a series of middleware calls. We can tell Express to use other middleware by asking it to `app.use` stuff. Here, we'll use BodyParser to parse it. Install with `npm`, then `app.use(bodyParser.<which parser you want>())` to include it in the middleware chain. Here, we want `app.use(bodyParser.json())`. So now, we can get the body of our requests with `req.body`.
```javascript
app.post('/kitten', function(req, res) {
  // Usually we just want them as we want them
  var name = req.body.name;
  var cuteness = req.body.cuteness;
  var age = req.body.age;
  var friends = req.body.friends;
  // create an object of all this data, save it to the database, send a response
  res.json("msg": "The kitten has been saved");
});
```
### Fancier routing with Express
You can do variables with `:`, as we have already seen, as well as wildcards with `*`, `?`, `+`, and `(<characters>)?`. You can also do `app.all()` for every HTTP verb.
```javascript
app.all('*', function(req, res) {
  res.status(404);
  res.json('msg': '404 Not Found');
});
```
(The order you put this in your routing table matters. If you put this first, it will match *every* request you send it.)

This works okay for one resource. But if we had a whole pet emporium, with multiple kinds of animals, our `server.js` file would be getting pretty huge. We can modularize this with Express. One way to do this would be to make a `/routes` directory, and use our `server.js` file to string all our stuff together. We could also organize it by resource: `/kittens`, `/puppies`, etc., and inside each have `/kittens/kittenRoutes.js`, `kittens/kittensModels.js`, etc. etc. (This is more similar to how Rails makes you do it.)

We can create a new Router by calling `express.Router()`. For all intents and purposes, this creates a new Express app. We can then go into the router file and pass in the router. Let's define a RESTful API for all our routes (without actually writing them):
```javascript
//kittenRoutes.js
var bodyParser = require('body-parser');
module.exports = function(router) {
  router.get('/kittens', ...
  router.get('/kitten/:id', ...
  router.post('/kitten', ...
  router.put('/kitten/:id', ...
  router.delete('/kitten/:id', ...
}
```
Gosh, what a coincidence—we now have a route for each of our CRUD actions!

Let's add this back into our `server.js`:

```javascript
var kittenRoutes = express.Router();
require('./routes/kittenRoutes.js')(kittenRoutes);
app.use('/api', kittenRoutes); // this prefixes '/api' to all our routes
```
We could extend this with multiple routes:
```javascript
var puppyRoutes = express.Router();
require('./routes/puppyRoutes.js')(puppyRoutes);
app.use('/api', puppyRoutes);
```
So after you've broken out all your routes into their own files, you will use your `server.js` to initialize your app, load in all the routes, and start the server.

Putting it all together:
```javascript
// routers/kittenRoutes.js
var bodyParser = require('body-parser');

module.exports = function(router) {
  router.use(bodyParser.json());

  router.get('/kitten/:id', function(req, res) {
    var id = req.params.id;
    var kitten = {
      name: 'Fluffy',
      cuteness: 3,
      age: 5,
      friends: []
    };
    res.json(kitten);
  });

  router.post('/kitten', function(req, res) {
    // Usually we just want them as we want them
    var name = req.body.name;
    var cuteness = req.body.cuteness;
    var age = req.body.age;
    var friends = req.body.friends;
    // create an object of all this data, save it to the database, send a response
    res.json({msg: 'The kitten has been saved'});
  });

  router.put('/kitten/:id', function(req, res) {
    var name = req.body.name;
    var cuteness = req.body.cuteness;
    var age = req.body.age;
    var friends = req.body.friends;
    res.json({name: name, cuteness: cuteness, age: age, friends: friends});
  });
}

// server.js
var express = require('express');
var app = express();

var kittenRoutes = express.Router();
require('./routes/kittenRoutes.js')(kittenRoutes);
app.use('/api', kittenRoutes);

app.listen(3000, function() {
  console.log('Server started');
});
```
