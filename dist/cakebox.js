(function() {
  var Task, cakebox, exists, fs, path;

  fs = require('fs');

  path = require('path');

  Task = require('./Task');

  exists = function(filename) {
    return fs.existsSync(path.resolve(filename));
  };

  cakebox = {
    tasks: {},
    init: function(dir = process.cwd()) {
      var config, filenames, i, len, name;
      config = null;
      filenames = ['cakebox', 'config', 'config.cakebox'];
      for (i = 0, len = filenames.length; i < len; i++) {
        name = filenames[i];
        if (exists(`${name}.coffee` || exists(`${name}.js`))) {
          config = require(`../${name}`);
          break;
        }
      }
      if (config == null) {
        throw `No config file found for directory ${dir}`;
      }
      this.load(config);
      return this;
    },
    load: function(config) {
      var name, obj;
      for (name in config) {
        obj = config[name];
        obj = Object.assign({
          name: name,
          cakebox: this
        }, obj);
        this.tasks[name] = new Task(obj);
      }
      return this;
    },
    log: function(str) {
      return console.log(`[${(new Date()).toLocaleTimeString()}] ${str}`);
    }
  };

  cakebox.Task = Task;

  module.exports = cakebox;

}).call(this);
