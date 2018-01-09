fs     = require 'fs'
colors = require 'colors'

# Helper methods to read and write from files
read  = (filename) -> fs.readFileSync(filename).toString()
write = (filename,data) -> fs.writeFileSync(filename,data)

module.exports = class Task
  constructor: (options) ->
    @options  = options
    @name = options.name
    @cakebox = options.cakebox
    @output = null
    @updated = null

  # function to get the value of the specified key
  # if the key is undefined or null, return null
  # if it's a function, invoke it. If not, return it as-is
  get: (key) ->
    obj = @options[key]
    return null unless obj?
    if obj.constructor is Function then obj() else obj

  select: ->
    @get('select').map (filename) -> filename: filename, source: read filename

  run: ->

    # Run all pre-tasks
    tasks = @get 'tasks'
    if tasks?
      for taskname in tasks
        @cakebox.tasks[taskname].run()

    @cakebox.log "Run task: #{@name.green}"

    items = @select()
    return if items is null

    pipeline = @get 'pipeline'
    throw "Function pipeline expected for Task #{@name}" unless pipeline?
    # pipeline each item through the pipeline
    for fn in pipeline
      items = items.map( (item) -> Object.assign(item, fn.call(item)) )


    # Update data on this task
    @output = items
    @updated = new Date()

    @save()


  save: ->
    for item in @output
      for name, dest of item.destination
        @cakebox.log "#{@name.green}: Writing to #{dest.yellow}"
        write dest, item[name]
    this

  watch: ->
    #  sleep function
    sleep = (ms) -> new Promise((resolve) -> setTimeout(resolve, ms))
    interval = 5 * 1000 # time to wait, in ms --> this loop is used to detect new files / removal of old ones
    loop # this loop runs every interval ms and watches
      items = @select()
      for item in items
        fs.watchFile item.filename, (curr,prev) =>
          @run()
      await sleep interval
      for item in items
        fs.unwatchFile item.filename
