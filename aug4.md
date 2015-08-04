4 August 2015
# Angular, Day 2

## Organizing Angular apps
It's good practice to organize an Angular app by resources, with a single file per resource to require in all the other files for each particular resource. For our note-taking app, we will be doing this by example, even though it doesn't really apply to an app of this size, but it scales well. (The other popular structure is to have all the different constructs at your root level, so you have a `/services` directory, a `/controllers` directory, etc.)

## Dependency Injection
`$http` is the way to do low-level Ajax calls in Angular dependency injection.
