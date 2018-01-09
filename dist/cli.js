(function() {
  var cakebox, cs, exists, fs, log, path, yargs;

  cs = require('coffeescript');

  cs.register();

  path = require('path');

  cakebox = require('./cakebox');

  yargs = require('yargs');

  fs = require('fs');

  log = console.log; // aliases

  exists = function(filename) {
    return fs.existsSync(path.resolve(filename));
  };

  module.exports = yargs.usage('$0 [-w|watch] [tasks]').command('$0', 'Run build tasks', ((yargs) => {
    return yargs.boolean('watch').alias('watch', 'w');
  }), (function(argv) {
    var config, i, j, k, len, len1, len2, name, ref, results, task, tasks;
    // load config
    config = null;
    ref = ['cakebox', 'config', 'config.cakebox'];
    for (i = 0, len = ref.length; i < len; i++) {
      name = ref[i];
      if (exists(`${name}.coffee`)) {
        config = require(`../${name}`);
        break;
      }
    }
    if (config == null) {
      throw "No config file found";
    }
    // load all tasks
    cakebox.load(config);
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
    for (j = 0, len1 = tasks.length; j < len1; j++) {
      task = tasks[j];
      // Run tasks
      task.run();
    }
    
    // If the watch options are set...
    if (argv.watch) {
      results = [];
      for (k = 0, len2 = tasks.length; k < len2; k++) {
        task = tasks[k];
        results.push(task.watch());
      }
      return results;
    }
  })).help().alias('help', 'h');

}).call(this);
