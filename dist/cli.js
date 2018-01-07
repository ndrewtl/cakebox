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

  module.exports = {
    run: function(args) {
      var argv, config, i, j, len, len1, name, ref, results, task, tasks, torun;
      argv = yargs(args).argv; // parse args
      
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
      // Get task listing
      tasks = cakebox(config);
      // Convert all command-names into tasks to run
      torun = argv._.slice(2).map(function(cmd) {
        var task;
        task = tasks[cmd];
        if (!((task != null) && task.constructor === cakebox.Task)) {
          throw `Task ${cmd} not found!`;
        }
        return task;
      });
      results = [];
      // run all
      for (j = 0, len1 = torun.length; j < len1; j++) {
        task = torun[j];
        results.push(task.run());
      }
      return results;
    }
  };

}).call(this);
