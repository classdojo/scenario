## Scenario

Loads scenarios in a database to make testing complex user data scenarios easier.

### Usage
First define a collection of data fixtures.
```javascript

// fixtures/users.js
id = require('pow-mongodb-fixtures').createObjectId;
exports.user1 = {
  _id: id("mongoId1"),
  name: "John",
  state: "California"
}

exports.user2 = {
  _id: id("mongoId2"),
  name: "Sarah",
  state: "Texas"
}

//fixtures/cars.js
exports.car1 = {
  type: "Honda",
  owner: id("mongoId1")
}

exports.car2 = {
  type: "Ford",
  owner: id("mongoId2")
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

//load both users and cars, but give user1 a Ferrari.
exports.scenario3 = {
  users: "user1,user2",
  cars: {
    data: "car1,car2",
    pre: {
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
var scenario = Scenario.configure({
  dbSettings: "./settings.js",
  fixtures: "./fixtures",
  scenarios: "./scenarios.js"
});
scenario.connect({db: "settings"}, function(err){
  this.load("scenario1");
});
```
