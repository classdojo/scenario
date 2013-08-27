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
  _id: "mongoId1",
  name: "John",
  state: "California"
}

exports.user2 = {
  _id: "mongoId2",
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


### Factory
You can also export factory fixtures that are templates and use
```javascript
exports.factory.car = {
  type: "Ford",
  owner: {
    $ref: "user",
    field: "_id",
  }
}
```
or if a car has multiple owners in an array

exports.factory.car = {
  type: "Ford",
  owner: {
    $ref: "user",
    field: "_id",
    options: {
      fieldType: Array
    }
  }
}
```

Factories are very flexible and allow you to register any number of transformations a document goes through.  Say for instance we wanted to add a "model" field to each car.

```javascript
scenario.registerTransformation("car", function(car, callback) {
  car.model = "Mustang";
  callback(null, car);
});
```
Now when the car factory will produce "Mustangs".

If you want to specify a factory in your scenario:

```javascript
exports.fordMustangs = {
  $type: "factory",
  name: "car", //the name of the specific factory
  options: {
    required: ["user1"] //an array of fixture document names required to build the object.
  }
}
```

We can also produce multiple cars for this user by including a "num" option.

```javascript
exports.fordMustangs = {
  $type: "factory",
  name: "car", //the name of the specific factory
  options: {
    required: ["user1"], //an array of fixture document names required to build the object.
    num: 2
  }
}
```
Great. Now the user has two ford mustangs. But what if we wanted to make this more interesting and give
the user two different kind of Ford cars?  We can do this by registering a transformer that assigns each
car a random Ford model..

```javascript
scenario.registerTransformation("car", function(car, callback) {
  var models = [
    "Mustang",
    "GT500"
  ];
  car.name = models[Math.floor(Math.random() * 100) % 2];
  callback(null, car);
});
```
Now user1 will likely have a Mustang and GT500.

If you register multiple transformations against a particular factory, they're run in the order you register them.
