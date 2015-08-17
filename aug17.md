17 August 2015

# React.js
## Conceptual overview

React is a framework for abstracting reusable components into pieces of code that contain other components. We can define a component like `<app>`, which is made up of subordinate components, like `<NavBar>`, `<Footer>`, etc., and then nest them as needed. Each element is a React class in JavaScript, like so:
```javascript
var app = React.CreateComponent({ … });
```
In ES6 we'd say something like
```javascript
class app extends React.CreateComponent
```
Every component must define a function called `render()`:
```javascript
render: function() {
  return (
    <NavBar/>
    <BlogList/>
    <Footer/>
  );
}
```
And then we will do the same process for `<NavBar>`, `<BlogList>`, etc. Eventually the buck will stop and you will hit native DOM elements, like in the `render()` function for our `<NavBar>` we will hit
```javascript
render: function() {
  return (
    <nav>
    <ul>
    <li>
  );
}
```
and so forth, with other atomic HTML tags.
