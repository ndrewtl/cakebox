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

    items() {
      return this.get('files').map(function(filename) {
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
      items = this.items();
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
      var current, filename, i, interval, j, k, len, len1, len2, results, sameContents, sleep, updated;
      //  sleep function
      sleep = function(ms) {
        return new Promise(function(resolve) {
          return setTimeout(resolve, ms);
        });
      };
      interval = 5 * 1000; // time to wait, in ms --> this loop is used to detect new files / removal of old ones
      // utility to check if two arrays have the same contents, not necessarily in the same order
      sameContents = function(arr1, arr2) {
        var elt, i, len;
        if (arr1.length !== arr2.length) {
          return false;
        }
        for (i = 0, len = arr1.length; i < len; i++) {
          elt = arr1[i];
          if (!arr2.includes(elt)) {
            return false;
          }
        }
        return true;
      };
      // Init files to use
      current = this.get('files');
      // Watch all those files
      for (i = 0, len = current.length; i < len; i++) {
        filename = current[i];
        fs.watchFile(filename, (curr, prev) => {
          return this.run(); // this loop runs every interval ms and watches for new/removed files
        });
      }
      results = [];
      while (true) {
        await sleep(interval);
        updated = this.get('files'); // update our file listing
        // If the listing isn't the same...
        if (!sameContents(updated, current)) {
          this.run(); // rebuild
          // remove all our listeners
          for (j = 0, len1 = current.length; j < len1; j++) {
            filename = current[j];
            fs.unwatchFile(filename);
          }
          // re-add new listeners
          for (k = 0, len2 = updated.length; k < len2; k++) {
            filename = updated[k];
            fs.watchFile(filename, () => {
              return this.run();
            });
          }
          results.push(current = updated);
        } else {
          results.push(void 0);
        }
      }
      return results;
    }

  };

}).call(this);
