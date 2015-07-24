# 23 July 2015
## Authentication

There's a difference between authentication and authorization. Authentication is proving you are who you say you are, and authorization is saying who is allowed to access what. Today we're mostly going to be talking about the former.

In the traditional world, when you log into a site, it starts a *session*, and that persists until you log out or it times out. The session data is usually kept track of in a cookie. But when you do an API call, typically you're not making cookies. Instead, we make API *tokens*, which we send with every request.

We need to generate a token for every user on our app, and have some method for us to process those tokens and perform verification on our users. In Express, we can do this with a middleware: for routes that need verification, we can have the route hit the middleware and perform the verification, then continue on with the route. There is a prepackaged middleware for this called [PassportJS](http://passportjs.org), which provides lots of different strategies for authentication. But today, we will be doing it by hand.

Before we can verify a token, we need to create it. We will create a route that is *not* authenticated so we can create those tokens to allow our users to become authenticated. We will use JSONWebToken for this purpose. The environment variable `secret` is a salt that we can initialize after our database setup in our `server.js` as
```javascript
process.env.secret = process.env.secret || 'testing only! change me';
```
**Keep the salt external to the server files.**

Here is how we route it:
```javascript
// routes/auth-routes.js

var User = require('../models/User')
var jwt = require('jsonwebtoken')

module.exports = function(router) {

  router.post('/auth', function(req, res) {
    // Find the user
    User.findOne({name:req.body.name}, function(err, user) {
      if (err) res.status(500).json({msg: 'server error'});
      // Verify a user was found
      if (!user) res.json({success: false, msg: 'Authentication failed. User not found.'});
      // Verify password matches
      else if (user.password != req.body.password) {
        res.json({success: false, msg: 'Authentication failed. Password does not match.'});
      }
      else {
        // If user and password are correct, create a token
        var token = jwt.sign(user, process.env.secret, {expiresInMinute: 1440});
        res.json({
          success: true,
          msg: 'Authentication successful',
          token: token
        });
      }
    });
  });
};
```
How can we verify the tokens that we create here? We create a middleware function:
```javascript
// middlewares/verify.js

var jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  if (token) {
    jwt.verify(token, process.env.secret, function(err, decoded) {
      if (err) res.json({success: false, msg: 'Failed to authenticate token'});
      else {
        req.decoded = decoded;
        next();
      }
    });
  }
  else res.status(403).send({success: false, msg: 'No token provided'});
};
```
We can set up all our routes as so, in:
```javascript
var apiRouter = express.Router();
['statuses', 'users'].forEach(function(route) {
  require('./routes/' + route + '-routes')(apiRouter);
});
var authRouter = express.Router();
require('./routes/auth-routes')(authRouter)

app.use('/api', require('./middlewares/verify'));
app.use('/api', apiRouter);
app.use('/auth', authRouter);
```
We can pull some of this logic out of our controllers and make it part of our models. Another thing we're going to do is use the `bcrypt` library and add methods to our user schema to generate a has and check the password.
```javascript
// models/user-model.js

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
  name: String,
  password: String,
  statuses: [{type:Schema.Types.ObjectID,ref:'Status'}];
});

userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};

userSchema.methods.checkPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
```
We can then update our POST method on `/users`:
```javascript
// on the /users route...
.post(function(req, res) {
  var user = new User(req.body);
  user.password = user.generateHash(user.password);
  user.save(function(err, data) {
    if (err) res.status(500).json({msg: 'server error'});
    res.json(data);
  });
});
```
We could even abstract this logic back into the user schema, making instance methods (though ES6 will change this kind of thing):
```javascript
userSchema.methods.generateHash = function(password) {
  this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(8));
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
};
```
We could do the same for our `checkPassword` verification route.
```javascript
// verify password matches
else if (user.checkPassword(req.body.password))
```
