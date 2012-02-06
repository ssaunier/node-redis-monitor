var redis = require("redis");
var _ = require("underscore");
_.str = require("underscore.string");

var client = redis.createClient();
var server_time = 0, total_commands_processed = 0;

function parse_info(str) {
  str = str.split("\r\n").map(function(v, k, l){
    var kv = v.split(":");
    return _.str.sprintf("\"%s\":\"%s\"", kv[0], kv[1]);
  }).join(",");
  str = "{" + str + "}";
  return JSON.parse(str);
}


var express = require("express");
var app = express.createServer();
var io = require("socket.io").listen(app);

app.listen(8000);

app.configure(function(){
  app.use(app.router);
  app.use(express.static(__dirname + "/public"));
});

var sockets = [];
io.sockets.on('connection', function (socket) {
  sockets.push(socket);
  socket.on("disconnect", function(){
    var i = sockets.indexOf(socket);
    if (i != -1){
      sockets.splice(i, 1);
    }
  });
});

function bcast_update(sockets, info){
  sockets.forEach(function(socket, i, l){
    socket.emit("update", info);
  });
}

function start_bcast(client, socket) {
  setInterval(function(){
    client.info(function(err, reply) {
      var info = parse_info(reply);
      bcast_update(sockets, info);
    });
  }, 1000);
}
process.on('SIGINT', function () {
  client.quit();
  process.exit(0);
});

start_bcast(client, sockets);
