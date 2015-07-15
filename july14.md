# 14 July 2015
## More data structures

### Linked lists
A **linked list** is a type of **tree**, which is a type of **graph**. A linked list is a data structure of ordered items, with each element pointing to the next element, creating a series. You can approach these with iterative or recursive operations. Operations on linked lists are also mutable or immutable. Each element (node) has two characteristics: a "value" value (i.e. what it contains) and a "next" value that points to the next node. `head` is a variable that points to the first list node, and the last node has `null` as its "next" value.

Here's a JavaScript implementation of a simple linked list:
```javascript
var head = null;
var nodeA = {value: 'a', next: null};
var nodeB = {value: 'b', next: null};
var nodeC = {value: 'c', next: null};
head = nodeA;
nodeA.next = nodeB;
nodeB.next = nodeC;
```
It is crucial to understand that the variable `head` just points to `nodeA`, rather than making a new object that is a copy of `nodeA`. Furthermore, `nodeA` *also* points to the same object. So therefore they are just both representations of the *exact same object*.

The only way we can tell when we're all done with a linked list is when "next" is `null`. Initially, we have three one-element linked lists! So we chain them together by setting the `next` properties on the objects, and we are left with one that doesn't point anywhere. More typically, we might see a linked list built up like this:
```javascript
var head = {data: 4, next: null};
head.next = {data: 10, next: null};
```
We can infer that the computational complexity of adding to the beginning of a linked list is constant time, while that of adding to the end is linear time, since it requires iterating over the entire list to get to the end, since lists are unidirectional.

### Recursion
We could write a "print every element in a linked list" function in a recursive style:
```javascript
function log(node) {
  if (!node) return;
  console.log(node.data);
  log(node.next);
}
```
This is instead of iterating over the list and doing a print operation on each node, until the `node.next` property is `null`. We return out of the algorithm when there is no `node`, that is to say, when the linked list is over.

What about appending something to a linked list?
```javascript
function append(node, data) {
  if (!node.next) return;
  node.next = {data: data, next: null};
  return;
}
```
These algorithms are mutable; they are changing the node. We could change the recursive `append` function to be immutable if we returned a completely new list object. One way to do this, in JavaScript, is that we can exploit the fact that JavaScript doesn't necessarily require all the parameters of a function, so we can call a function recursively with an extra parameter we only use internally.
```javascript
function append(listOne, data, listTwoStart, listTwoCurr) {
  // base case
  if (!listOne.next) {
    var newNode = {data: data, next: null};
    var curr = listTwo;
    while (!curr.next) {
      curr = curr.next;
    }
    curr.next = newNode;
    return listTwo;
  } else {
    // recursive case
    append(listOne.next, data, listTwo);
  }
}
```
Another solution, the more "computer science-y" version, would be to create a helper function. This also helps us to create an immutable function.
```javascript
function copy(list) {
  function copy_helper(next, copy) {
    if (!next) return;
    copy.next = {data: next.data, next: null};
    copy_helper(next.next, copy.next);
  }
  var copy = {data: list.data, next: null};
  copy_helper(list.next, copy);
  return copy;
}
```
