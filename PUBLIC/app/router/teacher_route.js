/**
 * Created by samcom on 22/9/14.
 */
console.log("Teacher Route");
teacherRacer=angular.module('teacherRoute', ['racer.js']).config(['$routeProvider',
    function ($routeProvider)
    {
        $routeProvider
            .when('/',{
                templateUrl:'/teacher_home.html',
                controller:'videoController',
                resolve:teacherRacer.resolve
            })
    }]);
teacherRacer.resolve = {
model: function (racer) {
        return racer;
    }
};
console.log(teacherRacer);
teacherRacer.resolve.model.$inject = ['racer'];

teacherRacer.$inject = ['$scope', 'model'];