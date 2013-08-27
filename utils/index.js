var _ = require("underscore"),
fs = require("fs"),
walk = require("walk");

function identity() {
  return Array.prototype.slice.call(arguments, 0).shift();
}


function Walk(directory) {
  if (!(this instanceof Walk)) {
    return new Walk(directory);
  }
  this.__dir = directory;
  this.__fns = {};
}

Walk.prototype.load = function(callback) {
  var walker = walk.walk(this.__dir);
  var me = this;
  var results = {};
  walker.on('file', function(root, filestats, next) {
    var r = require(root + "/" + filestats.name);
    var name = filestats.name;
    if(me.__fns['name']) {
      name = me.__fns['name'](filestats.name)
    }
    results[name] = r;
    next();
  });

  walker.on('errors', function() {
    me.__errors = true;
  });

  walker.on('end', function() {
    if(me.__errors) {
      callback(new Error("Problem reading files."))
    } else {
      callback(null, results);
    }
  });
}

Walk.prototype.map = function(name, fn) {
  this.__fns[name] = fn;
  return this;
}

exports.walk = Walk;

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
