## Scenario

Loads scenarios in a database to make testing complex user data scenarios easier.


### Tests
```bash
npm test
```

### Usage
First define a collection of data fixtures.
```javascript

// fixtures/users.js
exports.user1 = {
  _id: "520e934078e3cdd593e4c209",
  name: "John",
  state: "California"
}

exports.user2 = {
  _id: "520e934578e3cdd593e4c20a",
  name: "Sarah",
  state: "Texas"
}

//fixtures/cars.js
exports.car1 = {
  type: "Honda",
  owner: {
    $type: "ObjectID",
    data: "520e934078e3cdd593e4c209"
  }
}

exports.car2 = {
  type: "Ford",
  owner: {
    $type: "ObjectID",
    data: "520e934578e3cdd593e4c20a"
  }
}

```


then define a scenario definition file

```javascript
//scenarios.js

//load one user and car
exports.scenario1 = {
  users: "user1",
  cars:  "car1"
}

//load both users and cars
exports.scenario2 = {
  users: "user1,user2",
  cars: "car1,car2"
}

//compose a scenario of other scenarios
exports.scenario2 = {
  $scenarios: ["scenario1"],
  users: "user2"
}

//load both users and cars, but give user1 a Ferrari.
exports.scenario3 = {
  users: "user1,user2",
  cars: {
    data: "car1,car2",
    $pre: {
      load: function(name, obj, callback) {
        if(name == car1) {
          obj.type = "Ferrari";
        }
        callback(null, obj);
      }
    }
  }
}
```

```javascript
var Scenario = require("scenario");
var scenario = Scenario().configure({
  dbSettings: "./settings.js",
  fixtures: "./fixtures",
  scenarios: "./scenarios.js"
})

scenario.connect(function(err){
  this.load("scenario1");
});
```
