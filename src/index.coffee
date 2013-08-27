utils     = require("../utils")
Directory = utils.directory
Walk      = utils.walk
MongoDb   = require('mongodb')
ObjectID  = require('mongodb').ObjectID
_         = require("underscore")
oWrap     = require("owrap")
Documents = require("./documents")
Resolver  = require("./resolver")

class DB

  constructor: (@__settings) ->
    @__client = MongoDb.MongoClient

  connect: (callback) ->
    @__client.connect utils.connectionString(@__settings), (err, db) =>
      if err?
        callback err
      else
        @__db = db
        callback null

  save: (collection, docs, callback) ->
    @__db.collection(collection).insert docs, {safe: true}, callback

  remove: (collection, callback) ->
    @__db.collection collection, (err, c) =>
      if err?
        callback err
      else
        c.remove {_id: {$exists: true}}, callback

class Scenario

  constructor: () ->
    @__owrap = {}
    @_configDocumentResolver()
    @_configScenarioResolver()
    @__fixtureSteps = {}
    @__connected = false
    return @

  configure: (@__config, callback) ->
    @__db = new DB(@__config.dbSettings)
    @__scenarios = require(@__config.scenarios)
    @_loadFiles @__config.fixtures, (err, @__fixtures) =>
      if err?
        callback(err)
      else
        @_separateFixturesAndDocuments()
        @_configScenarioResolver()
        callback null, {
          documents: @__documents,
          factories: @__factories
        }



  ##loader params
  load: (scenario, callback) ->
    #load fixtures
    @__resolver.resolve scenario
    # @_loadScenario  @__scenarios[scenario], callback

  unload: (collection, callback) ->
    @__db.remove collection, callback #need to actually unload scenario

  registerFixtureStep: (fixtureName, fn) ->
    @__factoryDecorators[fixtureName] = 
        @__factoryDecorators[fixtureName] || []
    @__factoryDecorators[fixtureName].push fn

  connect: (callback) ->
    callback = callback.bind(@)
    if @__connected
      callback null
    else
      @__db.connect (err) =>
        if not err?
          @__connected = true
        callback err

  _configScenarioResolver: () ->
    @__resolver = new Resolver(@__scenarios, @__documents, @__factories, @__factoryDecorators)
    @__resolver.on 'data', (data) ->
      #load into database
      consol.log "Got data from resolver ---", data


  _configDocumentResolver: () ->
    @__owrap.document = oWrap()
    @__owrap.document.on "field:_id", (val) ->
      if _.isString(val)
        val = ObjectID(val)
      return val
    @__owrap.document.on "control:$type", (obj) ->
      if obj.$type.match(/ObjectID/) #only transform ObjectIds for now
        obj = ObjectID(obj.data)
      return obj

  _configScenarioResolver: () ->


  ###
    Separates an object like
    {
      users: {
        user1: {},
        user2: {},
        factory: {
          factory1: {},
          factory2: {}
        }
      }
    }

    into a documents and factories object.
  ###
  _separateFixturesAndDocuments: () ->
    @__factories = {}
    @__documents = {}
    for k,fixtureObj of @__fixtures
      factories = fixtureObj.factory
      documents = _.omit fixtureObj, 'factory'
      _.extend @__factories, factories
      _.extend @__documents, documents

  _resolve: (obj) ->
    @__owrap.resolve(obj)

  _loadFiles: (dir, callback) ->
    @__documents = new Documents(dir)
        .load callback

  _fullPath: (dir) ->
    if dir.match(/^\./)
      return __dirname + "/" + dir
    else
      return dir


module.exports = () ->
  return new Scenario()
