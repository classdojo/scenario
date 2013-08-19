var _ = require("underscore");
var fs = require("fs");

function identity() {
  return Array.prototype.slice.call(arguments, 0).shift();
}

exports.directory = function() {
  var dirs = Array.prototype.slice.call(arguments, 0),
  __procs = {},
  me = this;

  this.map = function(k,fn) {
    __procs[k] = fn;
    return this;
  }

  this.load = function() {
    var results = []
    dirs.forEach(function(f) {
      results.push(__process(f));
    });
    return _.extend.apply(_, results);
  }

  this.name = function(name) {
    return (__procs['name'] || identity)(name);
  }

  var __process = function(f) {
    var o = {}
    if(fs.statSync(f).isFile()){
      if(f.split(".").pop() == 'js'){
        o = {}
        o[me.name(f)] = require(f); //only require js files
        return o;
      }
    } else {
      var files = fs.readdirSync(f);
      for (n in files) {
        if(!(files[n][0] === '.')) {
          _.extend(o, __process(f + "/" + files[n])); //collect results in o
        }
      }
      return o;
    }
  }

  return this;
}

exports.connectionString = function(settings) {
  return "mongodb://" + settings.host + ":" + settings.port + "/" + settings.name;
}
