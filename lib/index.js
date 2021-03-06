// Generated by CoffeeScript 1.6.3
(function() {
  var DB, Directory, MongoDb, ObjectID, Scenario, oWrap, utils, _;

  utils = require("../utils");

  Directory = utils.directory;

  MongoDb = require('mongodb');

  ObjectID = require('mongodb').ObjectID;

  _ = require("underscore");

  oWrap = require("owrap");

  DB = (function() {
    function DB(__settings) {
      this.__settings = __settings;
      this.__client = MongoDb.MongoClient;
    }

    DB.prototype.connect = function(callback) {
      var _this = this;
      return this.__client.connect(utils.connectionString(this.__settings), function(err, db) {
        if (err != null) {
          return callback(err);
        } else {
          _this.__db = db;
          return callback(null);
        }
      });
    };

    DB.prototype.save = function(collection, docs, callback) {
      return this.__db.collection(collection).insert(docs, {
        safe: true
      }, callback);
    };

    DB.prototype.remove = function(collection, callback) {
      var _this = this;
      return this.__db.collection(collection, function(err, c) {
        if (err != null) {
          return callback(err);
        } else {
          return c.remove({
            _id: {
              $exists: true
            }
          }, callback);
        }
      });
    };

    return DB;

  })();

  Scenario = (function() {
    function Scenario() {
      this._config();
      return this;
    }

    Scenario.prototype.configure = function(config) {
      this.config = config;
      this.__db = new DB(this.config.dbSettings);
      this.__fixtures = this._loadFiles(this.config.fixtures);
      this.__scenarios = require(this.config.scenarios);
      return this;
    };

    Scenario.prototype.load = function(scenario, callback) {
      return this._loadScenario(this.__scenarios[scenario], callback);
    };

    Scenario.prototype.unload = function(collection, callback) {
      return this.__db.remove(collection, callback);
    };

    Scenario.prototype.connect = function(callback) {
      var _this = this;
      callback = callback.bind(this);
      if (this.__connected) {
        return callback(null);
      } else {
        return this.__db.connect(function(err) {
          if (err == null) {
            _this.__connected = true;
          }
          return callback(err);
        });
      }
    };

    Scenario.prototype._config = function() {
      this.__owrap = oWrap();
      this.__owrap.on("field:_id", function(val) {
        if (_.isString(val)) {
          val = ObjectID(val);
        }
        return val;
      });
      this.__owrap.on("control:$type", function(obj) {
        if (obj.$type.match(/ObjectID/)) {
          obj = ObjectID(obj.data);
        }
        return obj;
      });
      return this.__connected = false;
    };

    Scenario.prototype._resolve = function(obj) {
      return this.__owrap.resolve(obj);
    };

    Scenario.prototype._loadFiles = function(dir) {
      return Directory(this._fullPath(dir)).map('name', function(n) {
        n = n.split('/').pop();
        return n.split('.').shift();
      }).load();
    };

    Scenario.prototype._loadScenario = function(scenario, callback) {
      var data, docs, done, fixture, fixtures, k, s, _i, _j, _len, _len1, _results,
        _this = this;
      if (scenario.$scenarios != null) {
        for (_i = 0, _len = scenario.length; _i < _len; _i++) {
          s = scenario[_i];
          this._loadScenario(s);
        }
      }
      done = _.after(Object.keys(_.omit(scenario, '$scenarios')).length, function() {
        return callback(null);
      });
      _results = [];
      for (k in scenario) {
        fixtures = scenario[k];
        if (!_.isArray(fixtures)) {
          fixtures = fixtures.split(',');
        }
        docs = [];
        for (_j = 0, _len1 = fixtures.length; _j < _len1; _j++) {
          fixture = fixtures[_j];
          data = this.__fixtures[k][fixture];
          docs.push(this.__owrap.resolve(data));
        }
        _results.push(this.__db.save(k, docs, function(err, docs) {
          return done();
        }));
      }
      return _results;
    };

    Scenario.prototype._fullPath = function(dir) {
      if (dir.match(/^\./)) {
        return __dirname + "/" + dir;
      } else {
        return dir;
      }
    };

    return Scenario;

  })();

  module.exports = function() {
    return new Scenario();
  };

}).call(this);
