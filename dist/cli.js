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
      var argv, cmd, config, i, j, len, len1, name, ref, ref1, results, task, tasks;
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
      ref1 = argv._.slice(2);
      // For each command specified...
      results = [];
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        cmd = ref1[j];
        task = tasks[cmd];
        if (!((task != null) && task.constructor === cakebox.Task)) {
          // Make sure the task exists
          throw `Task ${cmd} not found!`;
        }
        // Run it
        results.push(tasks[cmd].run());
      }
      return results;
    }
  };

}).call(this);
