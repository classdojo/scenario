EventEmitter = require("events").EventEmitter
_            = require("underscore")
oWrap        = require("owrap")

class Resolver extends EventEmitter

  constructor: (@__scenarios, @__documents, @__factories, @__factoryDecorators) ->
    @_configureOWrapResolvers()

  resolve: (scenarioName) ->
    scenario = @__scenarios[scenarioName]
    return unless scenario?
    #resolve scenario
    if scenario.$type?  #this is a factory. a bit hacky...
      #get data by simply resolving
      @emit 'data', @__owrap.scenario.resolve(scenario)
    else
      loadFixtures = () =>
        for k, fixtures of scenario
          if not _.isArray fixtures
            fixtures = fixtures.split(',') #need better filtering
          data = _.map fixtures, (e) => @__documents[e]
          @emit 'data', data
      if scenario.$scenarios? and not _.isEmpty(scenario.$scenarios)
        cont = _.after scenario.$scenarios.length, () ->
          finish()
        for s in scenario.$scenarios by 1
          if @__scenarios[s]?
            @resolve s, cont
          else
            loadFixtures()
      else
        loadFixtures()

  _configureOWrapResolvers: () ->
    @__owrap = {}
    @__owrap.document = oWrap()
    @__owrap.document.on "field:_id", (val) ->
      if _.isString(val)
        val = ObjectID(val)
      return val
    @__owrap.document.on "control:$type", (obj) ->
      if obj.$type.match(/ObjectID/) #only transform ObjectIds for now
        obj = ObjectID(obj.data)
      return obj

    @__owrap.scenario = oWrap()

    @__owrap.scenario.on "control:$type", (obj) ->
      if obj.$type.match(/factory/) #only handle factory types for now
        #resolve scenario
        console.log "Resolving scenario...", obj
        return obj
      else
        return obj


  # _loadScenario: (scenario, callback) ->
  #   #find scenarios

  #   finish = () =>
  #     done = _.after Object.keys(_.omit(scenario, '$scenarios')).length, () =>
  #       callback null #add error handling
  #     for k, fixtures of scenario
  #       #resolve fixture if needed by using a new instance of owrap

  #       data = @_getDataArray k, fixtures
  #       @__db.save k, data, (err, docs) =>
  #         done()
  #   if scenario.$scenarios? and not _.isEmpty(scenario.$scenarios)
  #     cont = _.after scenario.$scenarios.length, () ->
  #       finish()
  #     for s in scenario.$scenarios
  #       if @__scenarios[s]?
  #         @_loadScenario @__scenarios[s], cont #load each scenario
  #       else
  #         cont()
  #   else
  #     finish()




module.exports = Resolver
