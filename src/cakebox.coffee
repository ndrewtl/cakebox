Task   = require './Task'

log = console.log

cakebox =
  tasks: {}
  load: (config) ->
    for name, obj of config
      obj = Object.assign {name: name, cakebox: this }, obj
      @tasks[name] = new Task(obj)
    this
  log: (str) ->
    console.log("[#{(new Date()).toLocaleTimeString()}] #{str}")

cakebox.Task = Task
module.exports = cakebox
