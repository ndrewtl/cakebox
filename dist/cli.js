(function() {
  var cakebox, cs, fs, log, path, yargs;

  cs = require('coffeescript');

  cs.register();

  path = require('path');

  cakebox = require('./cakebox');

  yargs = require('yargs');

  fs = require('fs');

  log = console.log; // aliases

  module.exports = yargs.usage('$0 [-w|watch] [tasks]').command('$0', 'Run build tasks', ((yargs) => {
    return yargs.boolean('watch').alias('watch', 'w');
  }), (function(argv) {
    var i, j, len, len1, results, task, tasks;
    // load config
    cakebox.init();
    // Convert all command-names into tasks to run
    tasks = argv._.map(function(cmd) {
      var task;
      task = cakebox.tasks[cmd];
      if (!((task != null) && task.constructor === cakebox.Task)) {
        throw `Task ${cmd} not found!`;
      }
      return task;
    });
    if (!(tasks.length > 0)) {
      tasks = [cakebox.tasks['default']];
    }
    // run all
    for (i = 0, len = tasks.length; i < len; i++) {
      task = tasks[i];
      // Run tasks
      task.run();
    }
    
    // If the watch options are set...
    if (argv.watch) {
      results = [];
      for (j = 0, len1 = tasks.length; j < len1; j++) {
        task = tasks[j];
        results.push(task.watch());
      }
      return results;
    }
  })).help().alias('help', 'h');

}).call(this);
