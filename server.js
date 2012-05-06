var redis = require("redis")
  , url = require("url")
  , _ = require("underscore")
  , express = require("express");
_.str = require("underscore.string")

var client = null;
if (process.env.REDISTOGO_URL) {
  // Heroku
  var rtg = url.parse(process.env.REDISTOGO_URL);
  client = redis.createClient(rtg.port, rtg.hostname);
  client.auth(rtg.auth.split(":")[1]);
} else {
  // Localhost (development)
  client = redis.createClient();
}

function parse_info(str) {
  str = str.split("\r\n").map(function(v, k, l){
    var kv = v.split(":");
    return _.str.sprintf("\"%s\":\"%s\"", kv[0], kv[1]);
  }).join(",");
  str = "{" + str + "}";
  return JSON.parse(str);
}

var app = express.createServer();
var io = require("socket.io").listen(app);

io.configure('production', function(){
  io.enable('browser client etag');
  io.set('log level', 1);

  // Heroku :(  https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
  io.set("transports", ["xhr-polling"]);
  io.set("polling duration", 10);
});

io.configure('development', function(){
  io.set('transports', ['websocket']);
});

app.listen(process.env.PORT || 8000);

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

console.log("Redis monitor listening on port %d", app.address().port);
