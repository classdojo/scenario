exports.dbString = function(obj) {
  return 'mongodb://' + obj.host + ":" + obj.port + "/" + obj.name;
}

exports.fullPath = function(dir) {
  if(dir.match(/^\./)) {
    return __dirname + dir.slice(1);
  } else {
    return __dirname + dir;
  }
}
