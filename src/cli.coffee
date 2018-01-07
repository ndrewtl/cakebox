cs    = require 'coffeescript'
cs.register()
path  = require 'path'
cakebox  = require './cakebox'
yargs = require 'yargs'
fs    = require 'fs'

log    = console.log # aliases
exists = (filename) -> fs.existsSync path.resolve filename

module.exports =
  run: (args) ->
    argv = yargs(args).argv # parse args

    # load config
    config = null
    for name in ['cakebox','config','config.cakebox']
      if exists "#{name}.coffee"
        config = require "../#{name}"
        break
    throw "No config file found" unless config?

    # Get task listing
    tasks = cakebox(config)
    # For each command specified...
    for cmd in argv._[2..]
      task = tasks[cmd]
      # Make sure the task exists
      throw "Task #{cmd} not found!" unless task? and task.constructor is cakebox.Task
      # Run it
      tasks[cmd].run()
