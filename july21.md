# 20 July 2015
## Stacks and Queues

The basic operations of a **stack** are `push` and `pop`, and those of a **queue** are `shift` and `unshift`. We can simulate stacks and queues in JavaScript with arrays. More generally, we could simulate them with **linked lists**. To simulate a queue, we could treat the head of a linked list with a `prepend` operation, and not have an `append` operation for it, and vice versa for simulating a stack.
