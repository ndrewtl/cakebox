(function() {
  var Task, colors, fs, read, write;

  fs = require('fs');

  colors = require('colors');

  // Helper methods to read and write from files
  read = function(filename) {
    return fs.readFileSync(filename).toString();
  };

  write = function(filename, data) {
    return fs.writeFileSync(filename, data);
  };

  module.exports = Task = class Task {
    constructor(options) {
      this.options = options;
      this.name = options.name;
      this.cakebox = options.cakebox;
      this.output = null;
      this.updated = null;
    }

    // function to get the value of the specified key
    // if the key is undefined or null, return null
    // if it's a function, invoke it. If not, return it as-is
    get(key) {
      var obj;
      obj = this.options[key];
      if (obj == null) {
        return null;
      }
      if (obj.constructor === Function) {
        return obj();
      } else {
        return obj;
      }
    }

    select() {
      return this.get('select').map(function(filename) {
        return {
          filename: filename,
          source: read(filename)
        };
      });
    }

    run() {
      var fn, i, items, j, len, len1, pipeline, taskname, tasks;
      // Run all pre-tasks
      tasks = this.get('tasks');
      if (tasks != null) {
        for (i = 0, len = tasks.length; i < len; i++) {
          taskname = tasks[i];
          this.cakebox.tasks[taskname].run();
        }
      }
      this.cakebox.log(`Run task: ${this.name.green}`);
      items = this.select();
      if (items === null) {
        return;
      }
      pipeline = this.get('pipeline');
      if (pipeline == null) {
        throw `Function pipeline expected for Task ${this.name}`;
      }
      // pipeline each item through the pipeline
      for (j = 0, len1 = pipeline.length; j < len1; j++) {
        fn = pipeline[j];
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
          this.cakebox.log(`${this.name.green}: Writing to ${dest.yellow}`);
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
        items = this.select();
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
