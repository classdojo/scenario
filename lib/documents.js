// Generated by CoffeeScript 1.6.3
(function() {
  var Document, Documents, Factory, FactoryWrapper, utils,
    __slice = [].slice;

  utils = require("../utils");

  FactoryWrapper = (function() {
    function FactoryWrapper(__raw, __chain) {
      this.__raw = __raw;
      this.__chain = __chain;
      this.__transformed = {};
    }

    FactoryWrapper.prototype.modify = function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.__transformed = this.__chain.modify(this.__raw);
    };

    return FactoryWrapper;

  })();

  Factory = (function() {
    function Factory(__name, __raw) {
      this.__name = __name;
      this.__raw = __raw;
    }

    Factory.prototype.get = function() {
      return new this.__wrapper(this.__raw);
    };

    return Factory;

  })();

  Document = (function() {
    function Document() {
      var args, opts;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      this.__raw = args[0];
      this.__transformed = this.__raw;
      opts = args[1];
      this.__type = opts.type;
      this.__resolver = opts.resolver;
    }

    Document.prototype.__defineGetter__('type', function() {
      return this.__type;
    });

    Document.prototype.toJSON = function() {
      return this.__transformed;
    };

    Document.prototype.resolve = function() {
      return this.__resolver.resolve(this.__raw);
    };

    return Document;

  })();

  Documents = (function() {
    function Documents(__fixturesDir) {
      this.__fixturesDir = __fixturesDir;
      this.__factories = {};
      this.__documents = {};
    }

    Documents.prototype.load = function(callback) {
      var _this = this;
      return utils.walk(this._fullPath(dir)).map('name', function(n) {
        return n.split('/').pop().split('.').shift();
      }).load(function(err, fixtures) {
        if (err != null) {
          return callback(err);
        }
        _this.__fixtures = fixtures;
        _this.__docs = {};
        _this.__factories = {};
        return callback(null, {
          fixtures: _this.__fixtures,
          documents: _this.__docs,
          factories: _this.__factories
        });
      });
    };

    Documents.prototype.getFactory = function(name) {
      return this.__fixtures[name];
    };

    Documents.prototype.getDocument = function(name) {
      return this.__docs[name];
    };

    return Documents;

  })();

  module.exports = Documents;

}).call(this);