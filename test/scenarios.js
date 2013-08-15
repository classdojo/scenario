var Scenario = require("..")
mocha = require("mocha"),
expect = require("expect.js");

describe("Scenario", function() {
  //setup scenario
  var scenario = Scenario.configure({
    dbSettings: "./settings.js",
    fixtures: "./fixtures"
    scenarios: "./fake_scenarios.js"
  });

})
