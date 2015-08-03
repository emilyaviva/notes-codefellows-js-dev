3 August 2015
# Angular, Day 1

## The MV* pattern

Angular is a **client-side MV*** framework. Client-side means it lives in the browser and gets executed there, so we are left with the constraints of the browser. "MV*" is used because the "model-view-controller" pattern doesn't really work on the client side.

A **model** gets data from a (RESTful) API that we access through Ajax calls. In Angular, our models are plain old JavaScript objects.

A **view** is the client-facing stuff. In Angular, this will be HTML and "directives" (which are really part of the HTML). Angular does *not* work with a templating language, which the server-side renders into HTML and displays it to the user. Angular works more or less in reverse, by manipulating the HTML itself.

A **controller** is the glue between the model and the view. It determines which views need which models, how the client interacts with it, etc. In JavaScript frameworks this breaks down because the functions of the controller are often distributed. Angular doesn't really have traditional "controllers", which is why we call it "MV*".

## Angular and Webpack

[Learning JavaScript Design Patterns by Addy Osmani](http://addyosmani.com/resources/essentialjsdesignpatterns/book/)

The meat and potatoes of Angular are the controllers, which communicate between the models and the views. Controllers talk to directives, are reusable pieces of code which have both HTML and JavaScript components. Angular **services** are reusable server-side code, which will usually be included by something else.

**Webpack** is a build tool that helps us not do crazy stuff in the DOM. Normally, managing dependencies in the browser is hell: you link to them with `<script>` tags in your HTML. This is a pain in the ass because you have to repeat it in every file, and include them in the right order, and figure out what requires what, and so forth. Webpack allows us to use Common.js (Node-style) dependency tracking, like `require()` and so forth. This allows us to do lazy loading of modules (i.e. loads dependencies only as needed).

The way Webpack works is that our entry file pulls in all our dependencies (from NPM or Bower or wherever). We use the `gulp-webpack` NPM package to get it into our project dev-dependencies. (Everything we do on the client-side will be a dev-dependency in our code, because we are building for the client, and we will minify and uglify everything before we send it to production.)

### Using Webpack with Gulp
We give Webpack a Gulpfile like this:
```javascript
'use strict';

var gulp = require('gulp');
var webpack = require('gulp-webpack');

gulp.task('webpack', function() {
  return gulp.src('app/js/client')
             .pipe(webpack({
               output: {
                 filename: 'bundle.js'
               },
             }))
             .pipe(gulp.dest('build/'));
});
```
The other piece we need is our static assets:
```javascript
gulp.task('copy', function() {
  return gulp.src('app/**/*.html')
             .pipe(gulp.dest('build'));
});
```
And we can add our Gulp task groups:
```javascript
gulp.task('build', ['webpack', 'copy']);
gulp.task('default', ['build']);
```

### Full-stack app architecture
Our entry point will, of course, be `index.html`. This will load up our `bundle.js` on the client side, which will load our dependencies into the DOM. The client will send Ajax requests back to our API, which will figure out what it needs to get from MongoDB, which will send it back to the API, which will send it back to the client.

We require Angular in our `client.js` by doing
```javascript
require('angular/angular');
```
(This is because Angular depends on the global window object. Don't argue with it, don't assign this line to a variable, just do it.)

To invoke Angular in our HTML, we put the following. HTML will ignore this tag but Angular will know this means that it's Angular data:
```html
<body data-ng-app>
...
</body>
```

Angular directives are placed in HTML files. Code is placed within two double-braces: `{{}}`. This tells Angular that the code inside these braces should be interpreted as JavaScript.
```html
<body data-ng-app>
  <h1>{{greeting}}</h1>
  <form action="post">
    <input type="text" data-ng-model="greeting">
  </form>
  <script src="bundle.js"></script>
</body>  
```
This is called a **two-way data binding**. The `<input>` tag is a directive. This means that the input tag will get saved into a variable called `greeting`. Then, inside out `<h1>` tag, we are looking for a variable called `greeting` and inserting it there.

We can also access this in different places:
```html
<button data-ng-click="function(){alert(greeting)}">Greet!</button>
```

Back to `client.js`. We will create an Angular module as follows:
```javascript
var notesApp = angular.module('notesApp', []);
```
This is the pattern than most Angular constructs take. We give it a name, followed by an array that will contain all of our Angular-level dependencies. So now, we can reset in our HTML file, to use this app:
```html
<body data-ng-app="notesApp">
```
The next piece we want to create is a **controller**. Controllers are really there to manage **scope**. All of our models and data will be in plain old JavaScript objects saved to a scope. Almost all the data we need to manipulate will be on a scope object, which we can access both in the view and in the controller.

To create a controller:
```javascript
var notesController = notesApp.controller('notesController', ['$scope', function(#scope) {
  $scope.greeting = 'hello world';
}]);
```
`$scope` is an object that lets us pass data back and forth between the view and the controller. The `$` lets us know that this is defined by Angular itself, and not by the user. Here, we are setting a default value to the `greeting` variable.

Let's update our `index.html`:

```html
<body data-ng-app="notesApp">
  <main data-ng-controller="notesController">
    <h1>{{greeting}}</h1>
    <input type="text" data-ng-model="greeting">
    <button data-ng-click="alertGreeting()">Greet!</button>
  </main>
  <script src="bundle.js"></script>
</body>
```
Oh my, looks like we have asked for a function on the scope object that we haven't defined yet! Let's define it on the controller.
```javascript
var notesController = notesApp.controller('notesController', ['$scope', function($scope) {
  $scope.greeting = 'hello world';
  $scope.alertGreeting = function() {
    alert(this.greeting);
  }
}]);
```
Let's do a nested controller (which does nothing):
```javascript
var anotherController = notesApp.controller('anotherController', ['$scope', function($scope) {

}]);
```
Now, in our `index.html`:
```html
<main data-ng-controller="notesController">
  <h1>{{greeting}}</h1>
  <input type="text" data-ng-model="greeting">
  <button data-ng-click="alertGreeting()">Greet!</button>
</main>
<section data-ng-controller="anotherController">
  <h2>{{greeting}}</h2>
</section>
```
We get an empty block where our next `h2` tag should be! Why? Because the `{{greeting}}` expression is now out of scope.

Let's redefine our other controller:
```javascript
var anotherController = notesApp.controller('anotherController', ['$scope', function($scope) {
  $scope.anotherValue = 'some other value';
}]);
```
And our HTML:
```html
<section data-ng-controller="anotherController">
  <h2>{{greeting}}</h2>
  <h2>{{'inside: ' + anotherValue}}</h2>
</section>
```
The outside will be undefined, but the inside will be "some other value". Scopes go child-up, but not parent-down.
