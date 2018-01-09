fs     = require 'fs'
colors = require 'colors'

# Helper methods to read and write from files
read  = (filename) -> fs.readFileSync(filename).toString()
write = (filename,data) -> fs.writeFileSync(filename,data)
log = console.log

class Task
  constructor: (name,options) ->
    @name     = name
    @options  = options
    @output = null
    @updated = null

  items: ->
    @options.select().map (filename) ->
      filename: filename
      source: read filename

  pipeline: ->
    @options.transform()

  run: ->
    items = @items()
    log "Running Task: #{@name.green}"
    # Transform each item through the pipeline
    for fn in @pipeline()
      items = items.map( (item) -> Object.assign(item, fn.call(item)) )


    # Update data on this task
    @output = items
    @updated = new Date()

    @save()


  save: ->
    for item in @output
      for name, dest of item.destination
        write dest, item[name]
    this


cakebox = (config) ->
  result = {}
  for name, obj of config
    result[name] = new Task(name, obj)
  result

cakebox.Task = Task
module.exports = cakebox
