(function() {
  var Task, cakebox, fs, read, write;

  fs = require('fs');

  // Helper methods to read and write from files
  read = function(filename) {
    return fs.readFileSync(filename).toString();
  };

  write = function(filename, data) {
    return fs.writeFileSync(filename, data);
  };

  Task = class Task {
    constructor(name, options) {
      this.name = name;
      this.options = options;
      this.output = null;
      this.updated = null;
    }

    items() {
      return this.options.select().map(function(filename) {
        return {
          filename: filename,
          source: read(filename)
        };
      });
    }

    pipeline() {
      return this.options.transform();
    }

    run() {
      var fn, i, items, len, ref;
      items = this.items();
      ref = this.pipeline();
      // Transform each item through the pipeline
      for (i = 0, len = ref.length; i < len; i++) {
        fn = ref[i];
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

  };

  cakebox = function(config) {
    var name, obj, result;
    result = {};
    for (name in config) {
      obj = config[name];
      result[name] = new Task(name, obj);
    }
    return result;
  };

  cakebox.Task = Task;

  module.exports = cakebox;

}).call(this);
