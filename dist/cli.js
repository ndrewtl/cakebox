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
    run: async function(args) {
      var argv, config, i, interval, j, len, len1, name, ref, results, sleep, task, tasks, torun;
      // parse args
      argv = yargs(args).argv;
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
      log(argv);
      // run all
      for (j = 0, len1 = torun.length; j < len1; j++) {
        task = torun[j];
        // Run tasks
        task.run();
      }
      
      // If the watch options are set...
      if (argv.watch || argv.w) {
        //  sleep function
        sleep = function(ms) {
          return new Promise(function(resolve) {
            return setTimeout(resolve, ms);
          });
        };
        interval = 250; // time to wait, in ms
        // this loop runs every interval ms and watches
        results = [];
        while (true) {
          1;
          results.push((await sleep(interval)));
        }
        return results;
      }
    }
  };

}).call(this);
