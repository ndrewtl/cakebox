# Cakebox

A DIY build system for javascript et. al

## Why?
Grunt and Gulp are great build systems, but sometimes depend on plugins that aren't frequently updated.
Sometimes building a project with Webpack feels like cocking a bazooka at an ant.

This project is designed to obviate plugins by putting configuration entirely in the developer's hands.
Bring your own modules and build your project how you'd like.

## Installation
```zsh
$ yarn add cakebox --dev
```

## Use

## Run a task:
Run one or more tasks with the command `$ npx cakebox [tasknames...]`, for instance
```zsh
$ npx cakebox coffee sass html
```

### Build:
Often, you can run the `default` command simply:
```zsh
$ npx cakebox
```

### Watch:
Watch one or more tasks, in this case the default task:
```zsh
$ npx cakebox --watch
```
or
```zsh
$ npx cakebox -w
```

### With node:
Add to your `package.json`
```json
...
scripts: {
  "build": "cakebox",
  "watch": "cakebox --watch"
}
...
```
And then run:
```zsh
$ npm run watch
```
to automatically compile your project.

## Example
Put a file called `cakebox.coffee` or `cakebox.js` in your project folder.
The following is an annotated example, taken from this project's own cakebox.coffee:
```coffee
# You can bring your own modules, required in your project.
# Here we require the CoffeeScript object, so we can use it to
# transform source code
coffee = require 'coffeescript'
path   = require 'path'
glob   = require 'glob'

module.exports =
  # The config object is a list of tasks. The task name is the
  # key for each entry, while the value is the task itself.
  'coffee':
    # All config values in Cakebox can be either values or functions.
    # Here, we specify the the files as all the ones that match
    # the glob './src/**/*.coffee'. Because this is a function, it is
    # reevaluated periodically to add any new coffeescript files you add.
    files: -> glob.sync './src/**/*.coffee'

    # The list of function transformations. Like any other property, this
    # can be a function.
    pipe: [
      # Each function operates on one file that is being built.
      # The filename is passed as this.filename
      # The source code of the file is passed as this.source, here
      # abbreviated as @source.
      # The function returns an object that is merged into the this
      # object for the next function
      -> # Get dir and name values to use later
        {dir, name} = path.parse @filename
         # All the output goes in the dist directory
        dir: dir.replace('./src', './dist'), name: name
      # CoffeeScript
      # In this function, we replace the existing @source parameter with a new
      # source object
      -> # Coffeescript
        source: coffee.compile @source
      # source: [path] will cause the program to write the this.source
      # variable to path. This allows you to send multiple files to multiple
      # paths, if necessary
      -> # Where to send each file
        destination:
          source: path.join(@dir,@name) + '.js'
    ]
  'build' :
    # tasks can have a 'tasks' parameter that lists all the tasks
    # to be run before this task is run. Sometimes, these tasks can just be
    # amalgamations of other tasks, meaning that having no 'files' or 'pipe'
    # properties is fine.
    tasks: ['coffee']
  'default': # The 'default' command is what is run by the `cakebox` command
    tasks: ['build']
```
