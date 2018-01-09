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
    }
  };

  cakebox.Task = Task;

  module.exports = cakebox;

}).call(this);
