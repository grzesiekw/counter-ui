var app = angular.module("counter", []);

app.controller("CounterCtrl", ["$scope", "$http", function ($scope, $http) {

  $scope.counters = [];

  $scope.start = start;
  $scope.stop = stop;

  function start(name, limit) {
    $http.post("/api/counter/" + name + "/limit/" + limit).then(function () {
      $scope.counters.push({name: name, limit: limit, usage: 0});
    });
  }

  function stop(name) {
    $http.delete("/api/counter/" + name).then(function () {
      $scope.counters = $scope.counters.filter(function (e) {
        return e.name != name;
      });
    });
  }

}]);
