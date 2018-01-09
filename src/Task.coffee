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

  items: ->
    @get('files').map (filename) -> filename: filename, source: read filename

  run: ->

    # Run all pre-tasks
    tasks = @get 'tasks'
    if tasks?
      for taskname in tasks
        @cakebox.tasks[taskname].run()

    @cakebox.log "Run task: #{@name.green}"

    items = @items()
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
    # utility to check if two arrays have the same contents, not necessarily in the same order
    sameContents = (arr1,arr2) ->
      return false unless arr1.length == arr2.length
      for elt in arr1
        return false unless arr2.includes elt
      true
    # Init files to use
    current = @get 'files'

    # Watch all those files
    for filename in current
      fs.watchFile filename, (curr,prev) => @run()

    loop # this loop runs every interval ms and watches for new/removed files
      await sleep interval
      updated = @get 'files' # update our file listing
      # If the listing isn't the same...
      unless sameContents updated, current
        @run() # rebuild
        for filename in current # remove all our listeners
          fs.unwatchFile filename
        for filename in updated # re-add new listeners
          fs.watchFile filename, => @run()
        current = updated
