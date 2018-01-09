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

  items: ->
    if @options.select?
      @options.select().map (filename) ->
        filename: filename
        source: read filename
    else
      null

  pipeline: ->
    if @options.pipeline?
      @options.pipeline()
    else
      null

  tasks: ->
    if @options.tasks? and @options.tasks.constructor is Function
      @options.tasks()
    else
      null

  run: ->
    tasks = @tasks()
    if tasks?
      for taskname in tasks
        @cakebox.tasks[taskname].run()
    items = @items()
    return unless items?
    @cakebox.log "Run task: #{@name.green}"
    # pipeline each item through the pipeline
    for fn in @pipeline()
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
      items = @items()
      for item in items
        fs.watchFile item.filename, (curr,prev) =>
          @run()
      await sleep interval
      for item in items
        fs.unwatchFile item.filename
