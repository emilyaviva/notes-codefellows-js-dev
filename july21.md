# 20 July 2015
## Stacks and Queues

The basic operations of a **stack** are `push` and `pop`, and those of a **queue** are `shift` and `unshift`. We can simulate stacks and 
queues in JavaScript with arrays. More generally, we could simulate them with **linked lists**. To simulate a queue, we could treat the head 
of a linked list with a `prepend` operation, and not have an `append` operation for it, and vice versa for simulating a stack.

### Abstract stack data type
We need abstract stack for:
- `push` (which adds a value to the stack)
- `pop` (which gets a value off the stack *and deletes it*
- sometimes `peek` (you can look in, without removing)
Use cases for stacks:
- scoping
- reverse
- syntax checking
- recursion

We can implement a `Stack` object in JavaScript like so:
```javascript
function Stack() {
  var array = [];
  this.push = array.push.bind(array);
  this.pop = array.pop.bind(array);
  this.peek = function() { return array[array.length - 1]; };
}
```
#### Reverse
We can implement a `reverse` function that takes an array and outputs its reverse, using a stack as its internal data type:
```javascript
function reverse(arr) {
  var stack = new Stack();
  var newArr = [];
  for (var i = 0; i < arr.length; i++) {
    stack.push(arr[i]);
  }
  for (var i = 0; i < arr.length; i++) {
    newArr[i] = stack.pop();
  }
  return newArr;
}
```
This is, therefore, a linear time operation, because we have two non-nested `for` loops.
#### Syntax checking
We could implement a checker to make sure that every `{` was matched with a `}`, every `(` matched with a `)`, etc., and that the ordering was preserved. We don't use a hash, because we don't care simply if we've encountered them, but also about the ordering: this is a last-in, first-out operation, so a stack is an appropriate data structure.
```javascript
function matching(string) {
  for (var i = 0; i < string.length; i++) {
    if (string[i] in ['{', ')'] stack.push(string[i]);
    if (x === '}') {
      if (stack.pop !== '{') return false;
    }
    if (x === ')') {
      if (stack.pop !== '(') return false;
    }
  }
  return true;
}      
```

### Queues
Queues differ from stacks in that they're first-in, first-out.
- `enqueue`
- `dequeue`
- sometimes `hasNext`
Use cases:
- scheduling (it preserves order 'fairly')
- communication (events, messages)

