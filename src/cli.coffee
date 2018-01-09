cs    = require 'coffeescript'
cs.register()
path  = require 'path'
cakebox  = require './cakebox'
yargs = require 'yargs'
fs    = require 'fs'

log    = console.log # aliases

module.exports = yargs
  .usage '$0 [-w|watch] [tasks]'
  .command '$0', 'Run build tasks',
    ((yargs) => yargs.boolean('watch').alias('watch','w')),
    ((argv) ->
      # load config
      cakebox.init()
      # Convert all command-names into tasks to run
      tasks = argv._.map (cmd) ->
        task = cakebox.tasks[cmd]
        throw "Task #{cmd} not found!" unless task? and task.constructor is cakebox.Task
        task
      tasks = [cakebox.tasks['default']] unless tasks.length > 0

      # Run tasks
      task.run() for task in tasks # run all

      # If the watch options are set...
      if argv.watch
        for task in tasks
          task.watch()
    )
  .help()
  .alias 'help', 'h'
