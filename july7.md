# Notes for 7 July 2015

## Review: `exports` and `module.exports`

`exports` is an alias for `module.exports`.

```javascript
// These two will work the same

exports.helloOne = function(name) {
  return 'Hello ' + name;
};

module.exports.helloTwo = function(anme) {
  return 'Hello ' + name;
}
```
However:
```javascript
// These two are NOT equivalent!

module.exports = function() {
  console.log('foo');
}

exports = function() {
  console.log('foo');
}
```

## `package.json`

Usually, you want to explicitly list your dependencies in a project. We do that in JavaScript in our `package.json` file.

We initialize a new Git repository as follows:

```
$ git init
```
This will give you an interactive prompt, so you can fill out a bunch of information. It will dump out a file called `package.json`, which is a JavaScript object (in JSON format) containing all our package metadata.

You can programatically change your dependencies with the `npm` commands.

```
$ npm install --save-dev chai
```
adds to your JSON file
```json
"devDependencies": {
  "chai": "^3.0.0",
  "mocha": "^2.2.5"
},
```
Note the differences between `--save` and `--save-dev`. You should keep your (regular) dependencies separate from those that are only needed for development.

In addition, even if you have something installed globally on your own system, it's good practice to install it with `--save(-dev)` into your project, so that your project is self-contained and can be ported by others without depending on something that they may or may not have on their own system.

### Tests

You can add tests into your `package.json` file, to run when you do tests:

```json
"scripts": {
  "test": "mocha"
},
```
This is where you can call all your testing frameworks, or even just arbitrary commands.

The gold standard for getting test suites up and running is:

```
$ git clone && npm install && npm test
```
`npm test` is agnostic as to what test framework you're actually using (Mocha, Gulp, etc.). You specify it in your `package.json`. The benefit of this is that sometimes your `mocha` command (or whatever) isn't so simple, or you're using a different error reporter, or whatever it is.

Another thing you might want to do is only test files that end in `test.js` or some such. You might have a subsidiary file in your `test/` directory or wherever, and you don't want it to actually run. You could do this by running
```
$ mocha test/*test.js
```
but that's really ugly and hard to remember and inelegant, and what if you just type `mocha`? That'll just break all your tests, because it'll try to run all the files.

We can edit our `package.json`:
```json
"scripts": {
  "test": "mocha test/*test.js"
},
```
so when we run `npm test` it'll run that particular command on that line. This means that you will enable yourself and your users to just go ahead and run `npm test` rather than having to second-guess what your testing situation is.

## Gulp

[Gulp introduction slides](http://slides.com/contra/gulp#/)
[Gulp versus Grunt](http://markdalgleish.github.io/presentation-build-wars-gulp-vs-grunt/#2)

Gulp is a stream building system that can be used as a task runner. Because it uses streams, you can pipe the output from one to be the input of another.

There are five basic Gulp functions:

- `gulp.task(name, callback)`
 - Registers the function with a name. You can optionally specify some dependencies if other tasks need to run first.
- `gulp.run(tasks...)`
 - Runs all tasks with maximum concurrency
- `gulp.watch(glob, callback)`
 - Runs a function when a file that matches the glob changes. This is included in the core for simplicity. (Globs are very simple regular expressions, e.g. the wildcard `*`.)
- `gulp.src(glob)`
 - Returns a readable stream from a system file.
- `gulp.dest(folder)`
 - Returns a writable stream, saving file objects piped to this to the filesystem.

### Gulp, NPM, and package.json
We install gulp to our project dependencies, as well as globally, so we have the command available everywhere, and in the project specifically. Gulp talks to Mocha through a plugin.
```
$ npm install -g gulp
$ npm install --save-dev gulp
$ npm install --save-dev gulp-mocha
```
New file for configuration and execution of Gulp, `gulpfile.js`, in the root of your project.
```javascript
// gulpfile.js
var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('test', function() {
  return gulp
    .src('test/*.js')
    .pipe(mocha());
});
```
**Crucial reminder:** you need to `require('gulp')` inside your `gulpfile.js`.
This code says: read things from our `test/` directory that end in `.js`, and then pipe the output to `mocha`.

Since we have this Gulpfile, and we're using Gulp as our task runner, you don't need to lay out a giant command in your `package.json` under `"scripts"`, except:
```json
"scripts": {
  "test": "gulp test"
},
```
Another convention is to have a Gulp task called `default`, so that you can run it when you just type `gulp`, perhaps something like:
```javascript
gulp.task('default', ['test'], function() {});
```
So now, when we run `npm test`, Node will run the `gulpfile.js` with Gulp.

Let's add in JSHint. Notice we have to tell it what reporter to use too, because JSHint doesn't "go" anywhere—we can send it to the console, or a file, or whatever. Notice for Mocha that's not the case, because Mocha has its own reporter built-in, but there are also other ones available to do other kinds of reporting tasks.

```javascript
// gulpfile.js
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');

gulp.task('test', function() {
  return gulp
    .src('test/*.js')
    .pipe(mocha());
});

gulp.task('lint', function() {
  return gulp
    .src('*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});
```
We could add a default to add in both of these tasks:
```javascript
gulp.task('default'), ['test', 'lint'], function() {});
```
