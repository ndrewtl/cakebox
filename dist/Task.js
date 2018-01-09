(function() {
  var Task, colors, fs, log, read, write;

  fs = require('fs');

  colors = require('colors');

  // Helper methods to read and write from files
  read = function(filename) {
    return fs.readFileSync(filename).toString();
  };

  write = function(filename, data) {
    return fs.writeFileSync(filename, data);
  };

  log = console.log;

  module.exports = Task = class Task {
    constructor(options) {
      this.options = options;
      this.name = options.name;
      this.output = null;
      this.updated = null;
    }

    items() {
      if (this.options.select != null) {
        return this.options.select().map(function(filename) {
          return {
            filename: filename,
            source: read(filename)
          };
        });
      } else {
        return null;
      }
    }

    pipeline() {
      if (this.options.pipeline != null) {
        return this.options.pipeline();
      } else {
        return null;
      }
    }

    tasks() {
      if ((this.options.tasks != null) && this.options.tasks.constructor === Function) {
        return this.options.tasks();
      } else {
        return null;
      }
    }

    run() {
      var fn, i, items, j, len, len1, ref, taskname, tasks;
      tasks = this.tasks();
      if (tasks != null) {
        for (i = 0, len = tasks.length; i < len; i++) {
          taskname = tasks[i];
          this.options.cakebox.tasks[taskname].run();
        }
      }
      items = this.items();
      if (items == null) {
        return;
      }
      log(`[${(new Date()).toTimeString()}] Run task: ${this.name.green}`);
      ref = this.pipeline();
      // pipeline each item through the pipeline
      for (j = 0, len1 = ref.length; j < len1; j++) {
        fn = ref[j];
        items = items.map(function(item) {
          return Object.assign(item, fn.call(item));
        });
      }
      // Update data on this task
      this.output = items;
      this.updated = new Date();
      return this.save();
    }

    save() {
      var dest, i, item, len, name, ref, ref1;
      ref = this.output;
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        ref1 = item.destination;
        for (name in ref1) {
          dest = ref1[name];
          write(dest, item[name]);
        }
      }
      return this;
    }

    async watch() {
      var i, interval, item, items, len, results, sleep;
      //  sleep function
      sleep = function(ms) {
        return new Promise(function(resolve) {
          return setTimeout(resolve, ms);
        });
      };
      interval = 5 * 1000; // time to wait, in ms --> this loop is used to detect new files / removal of old ones
      // this loop runs every interval ms and watches
      results = [];
      while (true) {
        items = this.items();
        for (i = 0, len = items.length; i < len; i++) {
          item = items[i];
          fs.watchFile(item.filename, (curr, prev) => {
            return this.run();
          });
        }
        await sleep(interval);
        results.push((function() {
          var j, len1, results1;
          results1 = [];
          for (j = 0, len1 = items.length; j < len1; j++) {
            item = items[j];
            results1.push(fs.unwatchFile(item.filename));
          }
          return results1;
        })());
      }
      return results;
    }

  };

}).call(this);
