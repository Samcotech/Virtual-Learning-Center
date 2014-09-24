/**
 * Created by samcom on 22/9/14.
 */
var racer=require('racer'),

    http = require('http'),
    express = require('express'),
    app = express(),
    teacher = require('./PUBLIC/route/teacher.js'),
    student = require('./PUBLIC/route/student.js'),
    session = require('express-session'),
    server = http.createServer(app);
    redis = require('redis'),
    client = redis.createClient(),
    redisStore = require('connect-redis')(session);

io = require('socket.io').listen(server);
server.listen(8085);

var store = racer.createStore({
    server: server,
    db: require('livedb-mongo')(process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'localhost:27017/vlc', {
        safe: true
    }),
    redis: require('redis-url').connect(process.env.REDISCLOUD_URL)
});

app.configure(function () {

    app.use(express.cookieParser());
    app.use(session({
        store: new redisStore({
            host: 'localhost',
            port: 6379
        }),
        secret: '40709104313'
    }));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(require('racer-browserchannel')(store));
    app.use(express.static(__dirname + '/PUBLIC'));
});

app.get('/teacher_login', teacher.login);
app.post('/teacher_login', teacher.logincheck);
app.get('/teacher_home', teacher.teacherhome);
app.get('/teacher_info',teacher.teacherInfo);

app.get('/model', function (req, res) {
    var model = store.createModel();
    model.subscribe('attendme', function (err, entries) {
        if (err) {
            res.status(500);
            res.send(err);
        } else {
            model.bundle(function (err, bundle) {
                res.send(JSON.stringify(bundle));
            });
        }
    });
});

store.bundle(__dirname + '/PUBLIC/client.js', function (err, js) {
    app.get('/script.js', function (req, res) {
        res.type('js');
        res.send(js);
    });
});
console.log('server listening on port 8085');

