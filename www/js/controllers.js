angular.module('manimap.controllers', [])

.controller('rootCtrl', ['$state', function($state) {
  $state.go('home');
}])

.controller('homeCtrl', ['$scope', '$state', function($scope, $state) {
  $scope.logout = function() {
    console.log('Logout');
    /*
    facebookConnectPlugin.logout(
      function (success) {
        $state.go('login');
      },
      function (failure) { console.log(failure) }
    );
    */
    Parse.User.logOut();
    $state.go('login');
  };
}])

.controller('profileCtrl', ['$scope', '$state','Profile', function($scope, $state, Profile) {
  $scope.profile = {};
  $scope.save = function() {
    console.log('saved', $scope.profile);

    Profile.create($scope.profile)
    .success(function(data){
      $state.go('home');
    })
    .error(function(data, status, headers, config) {
      console.log(data);
    });
  };
}])

.controller('loginCtrl', ['$scope', '$state', function($scope, $state) {
  var fbLogged = new Parse.Promise();

  var fbLoginSuccess = function(response) {
    if (!response.authResponse){
      fbLoginError("Cannot find the authResponse");
      return;
    }
    var expDate = new Date(
      new Date().getTime() + response.authResponse.expiresIn * 1000
    ).toISOString();

    var authData = {
      id: String(response.authResponse.userID),
      access_token: response.authResponse.accessToken,
      expiration_date: expDate
    }
    fbLogged.resolve(authData);
    console.log(response);
  };

  var fbLoginError = function(error){
    fbLogged.reject(error);
  };

  $scope.login = function() {
    console.log('Login');
    if (!window.cordova) {
      facebookConnectPlugin.browserInit('966206550077543');
    }
    facebookConnectPlugin.login(['email'], fbLoginSuccess, fbLoginError);

    fbLogged.then( function(authData) {
      console.log('Promised');
      return Parse.FacebookUtils.logIn(authData);
    })
    .then( function(userObject) {
      facebookConnectPlugin.api('/me', null,
        function(response) {
          console.log(response);
          userObject.set('name', response.name);
          userObject.set('email', response.email);
          userObject.save();
        },
        function(error) {
          console.log(error);
        }
      );
      $state.go('profile');
    }, function(error) {
      console.log(error);
    });
  };
}]);
