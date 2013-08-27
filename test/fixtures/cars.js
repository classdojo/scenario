exports.car1 = {
  _id: "5211de95e8716642a0000001",
  type: "Honda",
  owner: {
    $type: "ObjectID",
    data: "520e934078e3cdd593e4c209"
  }
}

exports.car2 = {
  _id: "5211de9de8716642a0000003",
  type: "Ford",
  owner: "520e934578e3cdd593e4c20a"
}

exports.factory.car = {
  _id: "5211de95e8716642a0000001",
  type: "Ford",
  owner: {
    $ref: "teacher",
    field: "_id"
  }
}
