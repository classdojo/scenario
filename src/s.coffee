oWrap = require("owrap")

class Scenario

  constructor: (@__documents) ->
    @__resolver = oWrap()

    @__resolver.on "control:$type", (obj) =>
      #right now only handles $type "factory"
      if obj.$type isnt "factory"
        return obj
      #find given factory
      factory = @__documents.getFactory obj.name
      document = factory.create()
      required = obj.options.required
      for r in required by 1
        d = @__documents.getDocument r
        document.modify d
      return document.get()


  resolve: (scenarioObject) ->
    @__resolver.resolve scenarioObject

module.exports = Scenario
