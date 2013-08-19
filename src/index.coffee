utils     = require("../utils")
Directory = utils.directory
MongoDb   = require('mongodb')
ObjectID  = require('mongodb').ObjectID
_         = require("underscore")
oWrap     = require("owrap")

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
    @_config()
    return @

  configure: (@config) ->
    @__db = new DB(@config.dbSettings)
    # load fixtures
    @__fixtures = @_loadFiles(@config.fixtures)
    # load scenarios
    @__scenarios = require(@config.scenarios) #@_loadFiles(@config.scenarios)

    return @

  ##loader params
  load: (scenario, callback) ->
    @_loadScenario  @__scenarios[scenario], callback

  unload: (collection, callback) ->
    @__db.remove collection, callback #need to actually unload scenario

  connect: (callback) ->
    callback = callback.bind(@)
    if @__connected
      callback null
    else
      @__db.connect (err) =>
        if not err?
          @__connected = true
        callback err

  _config: () ->
    @__owrap = oWrap()
    @__owrap.on "field:_id", (val) ->
      if _.isString(val)
        val = ObjectID(val)
      return val
    @__owrap.on "control:$type", (obj) ->
      if obj.$type.match(/ObjectID/) #only transform ObjectIds for now
        obj = ObjectID(obj.data)
      return obj
    @__connected = false


  _resolve: (obj) ->
    @__owrap.resolve(obj)

  _loadFiles: (dir) ->
    Directory(@_fullPath(dir))
        .map('name', (n) ->
          n = n.split('/').pop()
          return n.split('.').shift()
        )
        .load()

  _loadScenario: (scenario, callback) ->
    #find scenarios
    if scenario.$scenarios?
      for s in scenario
        @_loadScenario s #load each scenario
    done = _.after Object.keys(_.omit(scenario, '$scenarios')).length, () =>
      callback null #add error handling
    for k, fixtures of scenario
      if not _.isArray(fixtures)
        fixtures = fixtures.split(',')
      docs = []
      for fixture in fixtures
        data = @__fixtures[k][fixture]
        docs.push @__owrap.resolve(data)
      @__db.save k, docs, (err, docs) =>
        done()

  _fullPath: (dir) ->
    if dir.match(/^\./)
      return __dirname + "/" + dir
    else
      return dir


module.exports = () ->
  return new Scenario()
