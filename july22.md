# 22 July 2015
## Apps in the real world
Let's talk about a real app. We have a bunch of students in a course, and we want them to be able to submit a reaction to a class: was it good or bad? This app will be a multi-resource app, with a hierarchical relationship between the resources.

### Server
Our main app entry point will be `server.js`, which is most commonly used for four things: creating the actual Express app itself, database connection and setup, mounting routes, and starting the server.

The first big difference is that we're not going to use our own local MongoDB; we'll use a remote server. There are a few big services for this; the one we're going to use here is [MongoLab](http://mongolab.com). However, we usually don't encode "secrets" directly in our application, such as the address of the Mongo database. You can use a key-value service like Vault, or you can use an environment variable. Instead of hard-coding the address in our `server.js`, we can call it down from out `MONGO_URI` or some such variable name. We can then call `mongoose.connect(process.env.MONGO_URI || '<hard-coded-local-mongo-db>')`, so if we are using a local database for production and testing, we can use it instead.

```javascript
// server.js

// Creating the express app
var express = require('express');
var app = express();
var mongoose = require('mongoose');

// Database connection/setup
mongoose.connect(process.env.MONGO_URI || '<hard-coded-local-mongo-db>');

// Mounting routes (from dedicated files)
var apiRouter = express.Router();
require('./routes/user-routes')(apiRouter);
// this is where we will put additional routes
// require('./routes/statuses-routes')(apiRouter);

// Starting the server
var port = process.env.PORT || '3000';
app.listen(port, function() {
  console.log('Server listening on port: ' + port);
});
```
### Routes
We can use Express's neat `.route()` function to create a sequence of RESTful routes and chain them together.
```javascript
// routes/user-routes.js

var User = require('../models/User');
var bodyParser = require('body-parser');

module.exports = function(router) {
  router.use(bodyParser.json());
  router.route('/users')
    .get(function(req, res) {
      User.find({}, function(err, users) {
        if (err) res.status(500).json({msg: 'server error'});
        res.json(users);
      });
    })
    .post(function(req, res) {
      var user = new User(req.body);
      user.save(function(err, user) {
        if (err) res.status(500).json({msg: 'server error'});
        res.json(user);
      });
    });
}
```
### Models
We can make a generic User model:
```javascript
// models/User.js

var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  name: String,
});

module.exports = mongoose.model('User', userSchema);
```
Let's develop another model for a generic Status, and we need to track the owners on the items. One way to do this would be to track it directly on the status objects (in SQL terms, we're encoding a foreign key here):
```javascript
// models/Status.js

var mongoose = require('mongoose');

var statusSchema = mongoose.Schema({
  user: Number,
  date: String,
  time: String,
  content: String
});
```
A MongoDB-specific way to do this is called **populating**, which is sort of similar (but not really) to a SQL `JOIN`.
```javascript
// models/User.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
  name: String,
  statuses: [{Schema.Types.ObjectID, ref: 'Status']
});
  
module.exports = mongoose.model('User', userSchema);
```
```javascript
// models/Status.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statusSchema = Schema({
  user: {Schema.Types.ObjectID, ref: 'User'},
  date: String,
  time: String,
  content: String
});

module.exports = mongoose.model('Status', statusSchema);
```
Here we don't have an explicit pattern of ownership or hierarchy; it's solely implicit. We can make it explicit through usage in out RESTful API routes.
```javascript
// add to routes/user-routes.js

router.route('/users/:id')
  .get(function(req, res) {
    // we do this with .exec() so that we can get a promise,
    // which enables us to populate all the statuses
    User.findByID(req.params.id)
      .populate(statuses)
      .exec(function(err, user) {
        if (err) res.status(500).json({msg: 'server error'});
        res.json(user);
    });
  })
  .post(function(req, res) {
    User.findbyID(req.params.id, function(err, doc) {
      console.log(doc._id);
      var newStatus = new Status({
        user: doc._id,
        content: req.body.content
    });
    newStatus.save(function, err, statusDoc) {
      if (err) res.status(500).json({msg: 'server error'});
      User.update({_id: doc ... });
    });
  })
```
Let's add some routes for our statuses:
```javascript
// routes/status-routes.js

var Status = require('../models/Status');
var bodyParser = require('body-parser');

module.exports = function(router) {
  router.use(bodyParser.json());
  
  router.route('/statuses')
    .get(function(req, res) {
      Status.find({}, function(err, doc) {
        if (err) res.status(500).json({msg: 'server error'});
        res.json(doc);
      })
    })
    .post(function(req, res) {
      Status.create(req.body, function(err, doc) {
        if (err) res.status(500).json({msg: 'server error'});
        res.json(doc);
      });
    })
  
};
```