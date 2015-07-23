# 22 July 2015
## Beyond CRUD - Assignment

One thing that databases aren't very good at storing is things that are binary blobs of data, like photos, videos, documents, etc. Because of this, we need a filesystem-based storage system to do this. You integrate this with your database by having your database store a reference to the filesystem location of a given document. One thing that people do today because it's easy and cheap is store things to Amazon S3, which has its own API and SDKs, including [one for NodeJS](http://aws.amazon.com/sdk-for-node-js).

The assigmment:

(1) Write an app that supports multiple users, who can each have multiple files, with routes like so:
`GET /users/:user/files/:file`
`POST /users/:user/files`
etc. to be fully RESTful

(2) POST a JSON object that contains some data, like `{ fileName: <favorite ice creams>, content: <chocolate, strawberry, etc.> }` to Amazon S3.

Formal specification for this assignment will be on Canvas.

**DO NOT COMMIT YOUR AMAZON AWS KEYS TO GITHUB**