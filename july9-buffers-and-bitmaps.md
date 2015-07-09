# 9 July 2015
## `.call()` and Duck Typing

Let's declare the following function to print the first element of an array:
```javascript
function printFirst() {
  console.log(this[0]);
}
```
When you call a method by using the dot notation, `this` is set to the object you called it on. In general JavaScript is lexically scoped, but `this` is *dynamically* scoped; i.e. it depends on the execution order.

The other way to set `this` is to set it manually with `call`:
```javascript
var myArray = [0, 1, 2];
printFirst.call(myArray);
```
This call sets `this` to `myArray` here.

A feature of our `printFirst()` function is that it's not specific to arrays. We meant it to work with arrays, but it will work with anything that "looks enough like" a string.
```javascript
> printFirst.call(12345);
undefined
```
This is because numbers aren't like arrays. `3242[0]` has no meaning. In many ways, the type of something is defined by what methods it knows and can respond to. This is called **duck typing**: "if it looks like a duck, walks like a duck, and quacks like a duck, it's a duck".

What if we just run `printFirst();` alone? We get `undefined`. But, if we run in strict mode, we should get an error. This is one important reason to use strict mode: without it, `this` just refers to the global object. When you declare variables outside of a function, they're global, and the interpreter (Node) will look in the global namespace for something that matches that name.

You can also apply parameters through `call()`:
```javascript
function printFirstAndOther(other) {
  console.log(this[0] + other);
}

> printFirstAndOther.call(myArray, 'hello');
'0hello'
```
Everything in `call()` after the first argument is treated as a parameter for the called function.

## Buffers in Node
### What is a buffer?
[Node's documentation for buffers](https://nodejs.org/api/buffer.html)

Several things behave and look an awful lot like an array, but they're not actually arrays. However, they're implemented similarly enough to arrays that duck typing helps us use some array methods on them. An example is `arguments`, which is not an array, but can be treated as one for many purposes.

Buffers, however, have fixed size, unlike arrays which have unlimited size:
```javascript
> var myBuff = new Buffer(1); // create a new buffer of size 1 byte
> myBuff.write('hello world');
> myBuff.toString();
'h'
> var otherBuff = new Buffer('hello'); // create a new buffer of the appropriate size
> otherBuff.toString();
'hello'
```
Buffers are array-like:
```javascript
> myBuff[0]; // returns the Unicode value of the content of that buffer space
104
> myBuff[0] = 105;
> myBuff.toString();
'i'
```
A more complicated example, showing the Unicode output in hex:
```javascript
> var helloBuffer = new Buffer('hello');
> helloBuffer
<Buffer 68 65 6c 6c 6f>
> helloBuffer[2] = 104;
> helloBuffer.toString();
'hehlo'
>
```
Buffers can also use `call()` to change `this` to the buffer object:
```javascript
> var helloBuffer = new Buffer('hello');
> Array.prototype.join.call(helloBuffer);
'104,101,108,108,111'
```
### File reading
Buffers are largely used under the hood for lots of Node operations, but you interact with them when you read a file into Node; it doesn't return a string of that file but instead a buffer of that file.

On the built-in `fs` module, the `readFile()` method reads in a file (asynchronously), and takes a callback function to do something:
```javascript
var fs = require('fs');
fs.readFile('./file.txt', function(err, data) {
  console.log(data);
});
console.log('hello');
```
This outputs a bunch of buffer gibberish in hex to our console (assuming we have a `file.txt` file in our working directory), because `readFile()` returns a buffer rather than a string. `hello` get printed to the screen first, because the `readFile()` function is asynchronous, and runs its callback after the data has been read into the buffer.
```javascript
fs.readFile('./file.txt', function(err, data) {
  console.log(data.toString('utf8'));
});
```
Well, check it out, we have some readable stuff on our console.

`fs` provides a synchronous method (warning: don't use this on giant files!):
```javascript
var myFile = readFileSync('./file.txt');
myFile.toString('utf8');
```
Node wants us to default to the asynchronous version, because otherwise it could crap out when we give it a large file. This is important when we're doing backend programming and stuff, because we don't know what exactly could be passed to what.

## Bitmaps
### Endianness

Bitmaps are chunks of binary data: ones and zeroes. The biggest concern while working with binary data is **endianness**: which byte gets stored first in memory. Because we are working with Node, we don't have to worry about memory, but all computers are different so we have to worry about hard disk space.

In **big-endianness**, the "most significant byte" gets stored first, and in little-endianness the "least significant byte" gets stored first. Take `0xDEADBEEF`. On a **little-endian** machine, it will store as `[0xEF, 0xBE, 0xAD, 0xDE]`. (On a big-endian machine, it will store the other way.)

Node provides an easy built-in way to check what the endianness of a given machine:
```javascript
var os = require('os');
os.endianness(); // returns 'LE' or 'BE'
```
In the buffer methods in Node, there are two major different ways to read an integer: `buf.readUIntLE()` and `buf.readUintLE()`. (The U stands for "unsigned", i.e. all integers are postive. A "signed" integer uses the first bit to determine whether the integer is positive or negative.) There are also methods `buf.readUInt16LE()` and `buf.readUInt32BE()` which read in 16-bit (2 bytes) and 32-bit (4 bytes) integers. We also have `buf.readInt8()` which is simply 1 byte (i.e. 8 bits).

### BMP spec

[Wikipedia on the BMP file spec](https://en.wikipedia.org/wiki/BMP_file_format)

Every bitmap has three parts:
- Metadata (the size of the bitmap, what compression it uses, what style of bitmap it is, etc. is stored in a series of headers)
- Palette data (depending on the color depth, a collection of colors that the image data will be referring back to, so that you don't have to save the unique color for every individual pixel)
- Image data (a two-dimensional matrix of pixels, which is basically an array of arrays, starting at the upper left, going over *width* number of data points, then going to the next row, down to *height* number of rows)

The [Wikipedia page](https://en.wikipedia.org/wiki/BMP_file_format#Bitmap_file_header) is useful because it describes the offset size the BMP file header in both hex and decimal.
```javascript
> var fs = require('fs');
> var buf = fs.readFileSync('./<some bitmap>.bmp');
```
Sanity check to make sure we're dealing with a bitmap file:
```
> buf.toString('ascii', 0, 2); // encoding of BMP is ASCII, offset going from 0 to 2
'BM'
```
The next thing is the size of the BMP file in bytes (4 bytes of data):
```javascript
> buf.readUInt32LE(2); // we know we're going to read a 32-bit integer
11078
```
The image data actually starts at some offset (i.e. starting address). The location of the offset is set in the header as well, as a 4-byte number.
```javascript
> buf.readUInt32LE(10);
1078
```
By the specification, we can infer that there is no palette if the image offset, i.e. `buf.readUInt32LE(10)`, is equals 54.

In a bitmap with a palette, each chunk of palette data will be 4 bytes long, for one palette color (red, green, blue, alpha). Each pixel of image data will be 1 byte long, pointing to some palette color. At decimal offset 46, we have a 4-byte number representing the number of colors in our palette.
```javascript
> buf.readUInt32LE(46);
256
```
We can run a sanity check on this:
```javascript
> (1078 - 54) / 256
4
```
In a non-palette-based bitmap, the image data just starts at offset 54, and every pixel stores its own color data, sized to whatever the color depth is (which in this example is a 4-bit number).
