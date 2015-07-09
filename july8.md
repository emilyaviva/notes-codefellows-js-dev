# 8 July 2015
## Whiteboarding

Software interviews usually involve doing stuff at a whiteboard. Sometimes it is more design-focussed ("make a tic-tac-toe game"), and sometimes it is more algorithm and computer science-focussed.

## Data Structures

One of the most common data structures is the **array**. Generally, computers represent arrays in RAM as allocating a bunch of RAM into a (finite) number of slots with addresses. For a traditional array, it will start at some point in memory, store the first element there, and then subsequent elements in the array would be stored contiguously (i.e. without breaks). This is why in many programming languages, all elements of arrays are required to be all of the same type, so that the computer knows how much space to allocate to each slot.

Originally, arrays were just basically pointers to location in memory, and then you offset from that. So `array[0]` meant "go to this address", and `array[n]` meant "offset by *n* spaces".

In JavaScript, arrays can contain different types. This is because JavaScript arrays are really just objects with slightly different features.

Another common data structure is the **hash table**. This is a list of key-value pairs, like a JavaScript object. What if we had a hash where all the keys were numbers? This would be more or less like an array in JavaScript. Arrays in JavaScript differ in that they have methods attached to them: `push()` and `unshift()` add data to the array, and `pop()` and `shift()` subtract data from the array.

### Whiteboarding challenge

Write a function that tests an array for duplicates, returning `true` if any duplicate is found, and `false` if no duplicate is found.

(Our group came up with two ways to do this:)

```javascript
function duplicates(arr) {
  for (var i in arr; i < arr.length; i++) {
    if (i in arr.splice(indexOf(i), 1)) return true;
  }
  return false;
}
```
```javascript
function duplicates(arr) {
  for (var i in arr; i < arr.length; i++) {
    for (var j = i + 1; j < arr.length) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}
```
This is similar to a mathematical set (no duplicates allowed). If we iterate through the array, and as we do so, put the numbers into a hash as keys (mapped to some arbitrary value), then we can treat it as a mathematical set. So when we are mapping objects through the array, when we try to create a new key in our hash with the value of an element that already exists, it will return false. This approach requires only one pass through the array, rather than multiple passes, as in the solutions above.
```javascript
function duplicates(arr) {
  var hash = {};
  for (var i in arr; i < arr.length; i++) {
    if (arr[i] in hash) return true;
    else hash[arr[i]] = null;
  }
  return false;
}
```
There's always a tradeoff between speed and size: this solution will run faster, but it will require more memory and space because now have *two* different data structures rather than *one*.

### Big O notation
We will find it useful to talk about how much time an algorithm will take to run.

For an example: take an array of length 5, and we want to extract the third element:

```javascript
a = [1,2,3,4,5];
a[3];
```
This is *one* operation, even though we have five elements. Even if `a` were a million elements long, it would still take only one operation. Therefore, this runs in **constant time**.

Let's say we had this array and code:
```javascript
a = [1,2,3,7,10];
a.forEach(function(x) {
  console.log(x);
});
```
This runs in ***n*** **time** (because for *n* inputs, we have ***n*** operations).

Consider this chunk of code:
```javascript
x = a[5];
x += 20;
console.log(x);
```
For a million elements in `a`, we're going to run this code only once. Regardless of the number of operations that are *within it*, it still only gets run *once*. This is in **constant time**.

When we talk about big-O notation, we are concerned about the worst-case scenario. O(*n*) is something running in *n* time.

### Linear Runtime

Back to the duplicates problem. The best case is that it checks the first element against the second and they're both the same, which takes one operation. The worst is that there are no duplicates, which takes *n* operations. Therefore, we say our solution runs in *n* time.

What if we had a piece of code to find if a value is greater than one? It also runs in O(*n*) time. We can rewrite this as O(*n*)+O(*n*), which can be simplified to O(*n*+*n*). Let's add the operation printing out "Hello" to the end of everything. This runs in O(1) time, so we have O(*n*+*n*+1), which simplifies to O(2*n*+1). Big-O notation really only cares about the biggest exponential power (i.e. the degree of the polynomial). So we can really just simplify this to O(2*n*).

But we're really concerned with how this grows with input—that is to say, in the worst possible case, how quickly will shit get out of hand? How quickly will the runtime go? That's why we just say the function runs in O(*n*) time. When you analyze these in practice, the formalities of the math get dropped in favor of just looking at what's happening in your loop.

Another important runtime is **exponential runtime** (*n*^2). Exponential time tends to come up much less, because you have to be doing some weird stuff to get it. Another is ***n*** **log** ***n*** time, e.g. for sorting, which you (mathematically) cannot perform faster. We will talk about these later.

## Hashing functions

The way a hash table grabs a spot in memory is through something through a **hashing function**. An example is ASCII, which is really a table that have values 0 through 255. Let's say (this isn't true) that the value 127 is "A", 128 is "B", 129 is "C", etc., with the lowercase letters coming after that. A simple hashing function for a string could be to add up the ASCII values of all its individual letters:
```javascript
stringHash('CBA') → 384
```
So in memory, we go to location 384, and store `'CBA'`.

A weakness of this hash function is that `'BAC'`, `'ACB'`, etc. all map to 384. This is called a **collision**. There are various ways around this. You could put an array `['CBA', 'ABC', 'BAC']` at 384, for example, and the look up the string you want. Lots of people have worked on ways so that you can do this very quickly, in linear time.

Hashes are non-contiguous in memory.

### Whiteboarding challenge

Implement a function `unique(arry)` that returns a new array with all the duplicates removed.
