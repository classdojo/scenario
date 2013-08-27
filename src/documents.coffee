utils = require("../utils")

class FactoryWrapper
  constructor: (@__raw, @__chain) ->
    @__transformed = {}

  modify: (args...) ->
    @__transformed = @__chain.modify @__raw,

class Factory

  constructor: (@__name, @__raw) ->

  get: () ->
    new @__wrapper @__raw

class Document

  constructor: (args...) ->
    @__raw = args[0]
    @__transformed = @__raw
    opts = args[1]
    @__type = opts.type
    @__resolver = opts.resolver

  #type
  @::__defineGetter__ 'type', () ->
    @__type

  toJSON: () ->
    @__transformed

  resolve: () ->
    @__resolver.resolve(@__raw)

class Documents

  constructor: (@__fixturesDir) ->
    @__factories = {}
    @__documents = {}

  load: (callback) ->
    #callback here
    utils.walk(@_fullPath(dir))
        .map('name', (n) ->
          n.split('/').pop().split('.').shift()
        )
        .load (err, fixtures) =>
          if err?
            return callback err
          @__fixtures = fixtures
          @__docs = {}
          @__factories = {}
          #let's key a "factories" hash
          callback(null, {
            fixtures: @__fixtures
            documents: @__docs
            factories: @__factories
          })


  getFactory: (name) ->
    #create new instance with properly registered decorator pattern
    @__fixtures[name]

  getDocument: (name) ->
    @__docs[name]

module.exports = Documents
