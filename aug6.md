6 August 2015

# Testing with Angular

Review the two kinds of testing:

- **Unit testing** is testing very small parts of code: individual actions, individual functions, maybe even API calls. This is very common on server-side testing.
- **Integration testing** is testing behaviors: clients doing certain things and expecting certain actions. (This is the origin of behavior-driven development.) However, the caution is that it is very brittle: it's very easy for the functionality to stay the same while your expected behavior changes (like putting a new arbitrary label on an input field). We have already seen this kind of testing with `chai-http`.

## Useful software and setup

In order to run tests on our Angular code, we need to make a test bundle that we can get into the browser. 90% of the time Angular will be using a testing framework called [Jasmine](https://jasmine.github.io). It is very similar to Mocha/Chai but syntactically it differs in some places. (You can, actually, use Mocha/Chai for BDD testing in the browser, but it's a little unusual.)

Another useful piece of software is [Travis CI](https://travis-ci.org): continuous integration is a way to run tests every time you build. (It is also linked to GitHub so that you can see it update everything and run tests when a pull request is submitted, etc.)

[Karma](https://karma-runner.github.io) is a library to spin up a fake (or real) browser, run our tests, and report back on the command line. This is, needless to say, much faster than doing it on the graphical web browser. We can use it with [PhantomJS](http://phantomjs.org), which is a "headless" browser.

Install to your app:
```
npm install --save-dev karma karma-phantomjs-launcher karma-jasmine
```
Globally install `karma` so we can have its binary command available:
```
npm install -g karma
```
We will put our tests under our `tests` directory, but under a different subdirectory, so that it's very easy to distinguish between which tests should be run with Mocha/Chai and which should be run with Karma/Jasmine.

Edit our Gulpfile:
```javascript
gulp.task('webpack:test', function() {
  return gulp.src('test/karma-tests/entry.js')
    .pipe(webpack({
      output: {
        filename: 'test-bundle.js'
      }
    }))
    .pipe(gulp.dest('test/karma-tests/'));
});

gulp.task('karmatest', function(done) {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js'
  }, done).start();
});
```
Run `karma init` to set up. This creates a file `karma.conf.js` in the root level of your project. Karma is a client-server pattern. We set `singleRun` to `true` at the end of the configuration so it will run the tests and exit out of its server. (You can run Karma in continuous integration mode by disabling this option.)

Edit `test/karma-tests/entry.js` to require in all the tests we want:
```javascript
require(__dirname + '/notes-controller-tests');
```
Now create `test/karma-tests/notes-controller-tests.js` and keep it super-simple right now to make sure our test setup is running correctly (note well the Jasmine style):
```javascript
'use strict';

describe('notes controller', function() {
  it('should be true', function() {
    expect(true).toBe(true);
  });
});
```
Let's add a new macro to our Gulpfile and then make sure that our tests are running before we build.
```javascript
gulp.task('clienttest', ['webpack:test', 'karmatest']);
gulp.task('default', ['clienttest', 'build']);
```

## Some actually useful testing

We can test just *our* code (and not Angular's built-in) with the `angular-mocks` package to provide us substitutes without having to load all the Angular garbage in:
```
npm install --save-dev angular-mocks
```
Let's write some test code:
```javascript
// test/karma-tests/notes-controller-tests.js
'use strict';
require('../../app/js/client.js');
require('angular-mocks');

describe('notes controller', function() {
  var $ControllerConstructor; // the constructor for a generic controller
  var $httpBackend;           // makes REST requests from the $http service
  var $scope;                 // instantiates a scope object

  beforeEach(angular.mock.module('notesApp'));

  beforeEach(angular.mock.inject(function($rootScope, $controller) {
    $scope = $rootScope.$new();
    $ControllerConstructor = $controller;
  }));

  it('should be able to create a new controller', function() {
    var notesController = $ControllerConstructor('notesController', {$scope: $scope});
    expect(typeof notesController).toBe('object');
    expect(typeof $scope.getAll).toBe('function');
    expect(Array.isArray($scope.notes)).toBe(true);
  });
});
```
