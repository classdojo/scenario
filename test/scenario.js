var Scenario = require("..")
mocha = require("mocha"),
expect = require("expect.js"),
dbSettings = require("./settings.js"),
utils = require("./utils"),
scenario = Scenario().configure({  //default scenario instance
  dbSettings: dbSettings.good,
  fixtures: "./fixtures",
  scenarios: "./fake_scenarios"
}),
connectionString = utils.dbString(dbSettings.good);

var MongoClient = require("mongodb").MongoClient; //setup mongodb driver for data inspection

describe(".connect", function() {
  //setup scenario

  it("should properly connect given a valid db configuration file.", function(next) {
    var tscenario = Scenario().configure({
      dbSettings: dbSettings.good,
      fixtures: "./fixtures",
      scenarios: "./fake_scenarios"
    });
    tscenario.connect(function(err) {
      expect(err).to.be(undefined);
      next()
    });
  });

  it("should throw an error given an invalid db configuration file.", function(next) {
    var tscenario = Scenario().configure({
      dbSettings: dbSettings.bad,
      fixtures: "./fixtures",
      scenarios: "./fake_scenarios"
    });
    tscenario.connect(function(err) {
      expect(err).to.be.ok();
      next();
    });
  });

  it("should do nothing if connect is called twice", function(next) {
    var tscenario = Scenario().configure({
      dbSettings: dbSettings.bad,
      fixtures: "./fixtures",
      scenarios: "./fake_scenarios"
    });
    tscenario.connect(function(err) {
      tscenario.connect(function(err) {
        expect(err).to.be(undefined);
      });
    });
  });

});

describe(".load/unload", function() {
  //put MongoClient and scenario initialization in beforeEach hook.
  it("should load a scenario", function(next) {
    MongoClient.connect(connectionString, function(err, db) {
      scenario.connect(function(err) {
        this.load('users', function(err) {
          expect(err).should.be(undefined);
          db.collection('users').count(function(err, count) {
            expect(count).to.be(2);
            next();
          });
        });
      });
    });
  });

  it("should cleanup that scenario", function(next) {
    MongoClient.connect(connectionString, function(err, db) {
      scenario.connect(function(err) {
        this.unload('users', function(err) {
          expect(err).should.be(undefined);
          db.collection('users').count(function(err, count) {
            expect(count).to.be(0);
            next();
          });
        });
      });
    });
  });

});

describe("scenario loading", function() {
  it("should load a scenario of only fixtures");

  it("should load a scenario of fixtures and other scenarios");

  it("should load a scenario of other scenarios");

  it("should load a scenario and properly cleanup all data");

});
