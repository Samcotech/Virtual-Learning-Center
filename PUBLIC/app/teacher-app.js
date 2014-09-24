/**
 * Created by samcom on 22/9/14.
 */
var teacher = angular.module('teacher', ['ngRoute', 'teacherRoute', 'teacherController']);
console.log("Teacher app")

String.prototype.capitalize = function ()
{
    return this.charAt(0).toUpperCase() + this.slice(1);
}
//Main controller
teacher.controller('homeController', function ($scope, $http, $rootScope) {
    $http.get('/teacher_info').success(function (data)
    {
        console.log("teacher info.."+data.username);

        var firstname = data.username.capitalize();
        $rootScope.username = firstname;

        $rootScope.id = data._id;

    });

    $rootScope.chatHome=function()
    {
        location.href='#';
    }

});

teacher.factory('socket', function ($rootScope) {

    var socket = io.connect('http://localhost:8085');
    return {
        on: function (eventName, callback) {
            socket.on(eventName, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function (eventName, data, callback) {
            socket.emit(eventName, data, function () {
                var args = arguments;
                $rootScope.$apply(function () {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            })
        }
    };

});

teacher.controller('homeController1', function ($scope, $http, $rootScope, model) {

});

teacher.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
teacher.filter('orderObjectBy', function(){
    return function(input, attribute) {
        if (!angular.isObject(input)) return input;

        var array = [];
        for(var objectKey in input) {
            array.push(input[objectKey]);
        }

        array.sort(function(a, b){
            a = parseInt(a[attribute]);
            b = parseInt(b[attribute]);
            return a - b;
        });
        return array;
    }
});