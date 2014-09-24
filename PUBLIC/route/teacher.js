/**
 * Created by samcom on 22/9/14.
 */
var connect = require('mongojs');
var database = 'vlc';
var collection = ['teacher'];
var db = connect(database, collection);

exports.login = function(req, res) {
    res.sendfile('teacher_login.html');
}

exports.logincheck = function(req, res) {
    db.teacher.findOne({
        username: req.body.username,
        password: req.body.password
    }, function(err, data) {
        if (!err) {
            if (data) {
                console.log(data);
                req.session.username = req.body.username;
                return res.send({
                    indata: '0'
                });
            } else {
                return res.send({
                    indata: '0'
                });
            }
        }
    });
}

//Agent home
exports.teacherhome = function(req, res) {
    if (req.session.username) {
        res.sendfile('teacher_home.html');
    } else {
        res.redirect('/teacher_login');
    }
}

//Teacher information
exports.teacherInfo = function(req, res) {
    db.teacher.findOne({
        username: req.session.username
    }, function(err, data) {
        if (!err) {
            res.send(data);
        }
    });
}