# 16 July 2015
## Express + Mongo
Mongo is a NoSQL database. It is fast and non-relational. Data is stored as JavaScript objects.

You can deploy a Mongo database to [MongoLab](http://mongolab.com), so you can connect to a remote URL.

Pairing this with Express, we can make a `/models` directory for our Express models. We can then define our own database schemas, because Mongo is schemaless. Let's update our Express routes:

```javascript
// models/kittenModel.js
var mongoose = require('mongoose');

var kittenSchema = mongoose.schema({
  name: String,
  cuteness: Number,
  age: Number,
});

module.exports = mongoose.model('Kitten', kittenSchema);

// routes/kittenRoutes.js
var Kitten = require('../models/kittenModel.js');

...

router.get('/kittens', function(req, res) {
  Kitten.find({<mongo query>}, function(err, data) {
    if (err) {
      res.status(400);
      res.json({msg: err});
    }
    res.json(data);
  }
});

router.get('/kitten/:id', function(req, res) {
  Kitten.find({id: req.body.id}, function(err, data) {
    if (err) {
      res.status(400);
      res.json({msg: 'error'});
    }
    res.json(data);
  });
});

router.post('/kitten', function(req, res) {
  var kitten = new Kitten(req.body);
  kitten.save(function(err, data) {
    if (err) {
      res.status(400);
      res.json({msg: 'failed to save'});
    } else {
      res.json({msg: 'Kitten saved'});
    }
  });
});
```
