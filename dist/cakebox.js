(function() {
  var Task, cakebox, log;

  Task = require('./Task');

  log = console.log;

  cakebox = {
    tasks: {},
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
