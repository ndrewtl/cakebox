coffee = require 'coffeescript'
path   = require 'path'
glob   = require 'glob'

module.exports =
  'coffee':
    select: -> glob.sync './src/**/*.coffee'
    pipeline: -> [
      -> # Get dir and name values to use later
        {dir, name} = path.parse @filename
         # All the output goes in the dist directory
        dir: dir.replace('./src', './dist'), name: name
      -> # Coffeescript
        source: coffee.compile @source
      -> # Where to send each file
        destination:
          source: path.join(@dir,@name) + '.js'
    ]
  'default':
    tasks: -> ['coffee']
