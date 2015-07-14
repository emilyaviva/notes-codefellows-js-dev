## Full stack app architecture
### Back-end
Traditionally, your client is a web browser, but today it might be an iPhone, or a program, or something else that's sending requests to a server and expecting to get data back from it. The client talks to the **back-end**, which will talk back to the client.

Your server will typically have a construct of **routes** inside the server. Everything that comes after the address (e.g. `codefellows.org`) is a route. The base route is called `/`, for the root. Another route might be `/student-success-stories`. We also refer to these as **endpoints**. The server routes those endpoints to various actions. In the case of `codefellows.org/student-success-stories`, the backend is returning HTML. More commonly, we will be telling our code to return JSON.

A route will defer to a controller to run some function, or it will just run its function itself that will act as a controller. The controller talks to a database (type agnostic). CRUD (*infra*) takes place between your database and your controllers, and REST (*infra*) takes place between your clients and your server.

### REST and front-end

**REST** stands for Representational State Transfer. A key concept of this is **resources**, which break the data down into separate chunks that can be passed around. Your GitHub user is a resource, which has its own resources (repositories, for example, your pull requests). Each of these resources is represented somehow, typically as JSON objects. So we could have:
```json
{
  "name": "GitHub User",
  "repositories": [
    {
      "repo_1": "whatever",
      "url": "whatever"
    },
    {
      "repo_2": "whatever",
      "url": "whatever"
    }
  ],
  "date_joined": "whenever"
}
```
On a single-page app (like Facebook), the **front-end** responds to the client with HTML or Angular (or whatever). The iPhone app can talk directly to the back-end, and send and receive JSON objects directly.

For each of our routes, we have HTTP methods:
- GET
- POST
- PUT/PATCH
- DELETE

We also see the acronym CRUD for database operations, which stands for:
- CREATE
- READ
- UPDATE
- DESTROY

A route can have at most one of each of these methods. You won't always define every method for every route: some will be read-only, for example. And these methods are purely semantic: there's no reason you can't have a posting function on your DELETE route. But this is where CRUD comes in: for every resource, we should have a way to get, read, change, and delete that resource. This is what defines a RESTful API.

If done RESTfully:
- GET (READ) is idempotent (i.e. it returns the same value over and over) and immutable (its data cannot be changed). This corresponds to our Read function in CRUD.
- POST (CREATE) is idempotent (it should have the same result every time), but mutable.
- PUT/PATCH (UPDATE) is mutable. Its idempotency is actually somewhat tricky (depending on how it's implemented) but most people regard UPDATE it as not idempotent, because it depends on the state of the server before you got there.
- DELETE (DESTROY) is idempotent (every time it will do the same thing), and mutable.

## Basic Node servers

The underlying protocol of the Internet is called IP (Internet Protocol), which runs over TCP (Transfer Connect Protocol). An HTTP server is therefore also a TCP/IP server. Node allows us to create these at the most basic level (TCP only), HTTP (over TCP/IP), and with something friendly like ExpressJS.

### Basic TCP server
TCP works through the Node built-in `net` module. Here's a basic TCP server:
```javascript
var net = require('net');

var server = net.createServer(function(connection) {
  connection.on('data', function(data) {
    console.log(data.toString());
  });

  connection.on('end', function() {
    console.log('end');
  });
});

var port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log('server started');
});
```
When a TCP server is created, we call the asynchronous callback function `net.createServer()`. The `connection` object is actually an event emitter. Whenever `'data'` is received (i.e. a `data` event), it will log what was passed to it (which is a Node buffer, so we use `toString()`). When `'end'` is received, it will log that. (Remember to close your connections! (ExpressJS does this for you.))

We can access this on our command line with cURL via `curl http://localhost:3000`, which will output this into our server's console log:
```
GET / HTTP/1.1
User-Agent: curl/7.38.0
Host: localhost:3000
Accept: */*
```
This connection, however, is going to run forever, since we didn't pass it an `end` request.

If we do it from our browser, we get a completely different User-Agent field. We'll also get a completely different "Accept". Firefox says something like "I'll accept an HTML or an XHTML response". cURL's "Accept" means that it'll accept any kind of data as a response.

### Basic HTTP server
Node has a built-in `http` module for HTTP servers (obviously):
```javascript
var http = require('http');
var server = http.createServer(function(req, res) {
  console.log(req.headers);
  res.writeHeader(200, {
    'Content-type': 'application/json'
  });
  res.write(JSON.stringify({saying: 'a bird in the hand'}));
  res.end();
});

var port = process.env.PORT || 3000;
server.listen(port, function() {
  console.log('server started');
})
```
The difference here is that the TCP connection just takes a raw stream. Here in HTTP-land, though, we're operating on a higher level with requests and responses. Instead of modifying the stream directly, we can modify the response object for our clients' consumption.

Each request and response has two components: the headers and the body. When we `console.log` our `req.headers`, we will see that it is a JSON object. Here, we say we're going to write to our header the status code 200 (OK), with the content-type being JSON. (Here it's easy to use `JSON.stringify()` so that we can just pass it a normal JavaScript object.) We might also set the content-type to `text/html` and have `res.write()` take some raw HTML.

This isn't a very interesting server because it only has one route. Most apps will have more than one, to say the least. Typically, when you're writing production-level code, you won't do this; you'll use something like ExpressJS. But you can delve into it at these levels, writing our own routes with something like a `switch` statement to execute whatever code we wanted at arbitrary routes. We can also dive into those routes and check `req.method` to do different things on GET, POST, etc.

There's a tool called `superagent-cli` (written by our Tyler!) to help test JSON APIs on the command line (so you don't need to remember what all the cURL options are).

### `chai-http`

When testing these servers, a logical way to set it out, is: for a given endpoint, test every method it responds to (GET, POST, etc.). For RESTful APIs, we can use `chai.request(url)` for an asynchronous operation with a series of `expect`s that are relevant to that request. We use `chai.end` for running an asynchronous callback when our `chai.request` has finished loading whatever it's loading.
```javascript
var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;

chai.use(chaiHttp);

require('../server');

describe('our server', function() {
  it('should respond to a GET request', function(done) {
    chai.request('localhost:3000')
        .get('/hello')
        .end(function(err, res) {
          expect(err).to.eql(null);
          expect(res.status).to.eql(200);
          expect(res.body.msg).to.eql('hello world');
          done();
        });
  });
});
```
For our data, we're posting it in JSON format.
```javascript
it('should greet by name for post requests', function(done) {
  chai.request('localhost:3000')
      .post('/hello')
      .send({name: 'test'})
      .end(function(err, res) {
        expect(err).to.eql(null);
        expect(res.body.msg).to.eql('hello test');
        done();
      });
});
```
We can similarly write tests to check a nonexistent route returns 404, and so on and so forth.
