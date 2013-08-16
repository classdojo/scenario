exports.dbString = function(obj) {
  return 'mongodb://' + obj.host + ":" + obj.port + "/" + obj.name;
}