var path = require('path'),
    http = require('http'),
    express = require('express'),
    favicon = require('serve-favicon'),
    socketio = require('socket.io'),

    app = express(),
    server = http.Server(app),
    io = socketio(server),

    publicDir = path.resolve('public'),
    viewsDir = path.resolve('views'),

    production = Boolean(process.env.PRODUCTION);

app.set('views', viewsDir);
app.set('view engine', 'jade');

app.use(favicon(publicDir + '/favicon.ico', { maxAge: 0 }));
app.use(express.static(publicDir));

app.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Solar Crusaders',
    description: 'A multiplayer strategy game featuring 4X gameplay, sandbox universe, and simulated virtual economy.'
  });
});

io.on('connection', function(socket) {
  socket.on('ping', function(data) {
    socket.emit('pong');
  });
});

server.listen(4567);
