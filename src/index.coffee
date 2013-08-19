utils     = require("../utils")
Directory = utils.directory
MongoDb   = require('mongodb')
ObjectID  = require('mongodb').ObjectID
_         = require("underscore")

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



class Scenario

  configure: (@config) ->
    @__db = new DB(@config.dbSettings)
    # load fixtures
    @__fixtures = @_loadFiles(@config.fixtures)
    # load scenarios
    @__scenarios = require(@config.scenarios) #@_loadFiles(@config.scenarios)
    @__connected = false
    return @

  ##loader params
  load: (scenario, callback) ->
    @_loadScenario  @__scenarios[scenario], callback
    return @

  unload: () ->

  connect: (callback) ->
    callback = callback.bind(@)
    if @__connected
      callback null
    else
      @__db.connect (err) =>
        if not err?
          @__connected = true
        callback err

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
    for k, fixtures of scenario
      if not _.isArray(fixtures)
        fixtures = fixtures.split(',')
      for fixture in fixtures
        data = @__fixtures[k][fixture]
        if data._id?
          data._id = ObjectID(data._id)
    callback null

  _fullPath: (dir) ->
    if dir.match(/^\./)
      return __dirname + "/" + dir
    else
      return dir


module.exports = Scenario
