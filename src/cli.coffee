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
    # parse args
    argv = yargs(args).argv

    # load config
    config = null
    for name in ['cakebox','config','config.cakebox']
      if exists "#{name}.coffee"
        config = require "../#{name}"
        break
    throw "No config file found" unless config?

    # Get task listing
    tasks = cakebox(config)
    # Convert all command-names into tasks to run
    torun = argv._[2..].map (cmd) ->
      task = tasks[cmd]
      throw "Task #{cmd} not found!" unless task? and task.constructor is cakebox.Task
      task
    log argv
    # Run tasks
    task.run() for task in torun # run all

    # If the watch options are set...
    if argv.watch or argv.w
      #  sleep function
      sleep = (ms) -> new Promise((resolve) -> setTimeout(resolve, ms))

      interval = 250 # time to wait, in ms
      loop # this loop runs every interval ms and watches
        1
        await sleep interval
