exports.scenario1 = {
  users: "user1",
  cars: "car1"
}

exports.scenario2 = {
  users: "user1,user2",
  cars: "car1,car2"
}

exports.scenario3 = {
  users: "user2",
  cars: "car2"
}

exports.otherScenarios = {
  $scenarios: ["scenario2", "scenario3"]
}

exports.carFactoryScenario = {
  $type: "factory",
  name: "car",
  options: {
    required: ["user1"]
  }
}

exports.factoryScenarioMultiple = {
  $type: "factory",
  name: "car",
  options: {
    required: ["user1"],
    num: 2
  }
}
