fs   = require 'fs'
path = require 'path'
Task = require './Task'

exists = (filename) -> fs.existsSync path.resolve filename

cakebox =
  tasks: {}
  init: (dir = process.cwd()) ->
    config = null
    filenames = ['cakebox','config','config.cakebox']
    for name in filenames
      if exists "#{name}.coffee" or exists "#{name}.js"
        config = require path.join(dir,name)
        break
    throw "No config file found for directory #{dir}" unless config?
    @load(config)
    this
  load: (config) ->
    for name, obj of config
      obj = Object.assign {name: name, cakebox: this }, obj
      @tasks[name] = new Task(obj)
    this
  log: (str) ->
    console.log("[#{(new Date()).toLocaleTimeString()}] #{str}")

cakebox.Task = Task
module.exports = cakebox
