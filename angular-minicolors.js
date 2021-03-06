'format cjs';
'use strict';

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['angular', 'jquery-minicolors'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('angular'), require('jquery-minicolors'));
    module.exports = 'minicolors';
  } else {
    root.angularMinicolors = factory(root.angular, root.jqueryMinicolors);
  }
})(this, function(angular) {

  angular.module('minicolors', []);

  angular.module('minicolors').provider('minicolors', function() {
    this.defaults = {
      theme: 'bootstrap',
      position: 'top left',
      defaultValue: '',
      animationSpeed: 50,
      animationEasing: 'swing',
      change: null,
      changeDelay: 0,
      control: 'hue',
      hide: null,
      hideSpeed: 100,
      inline: false,
      letterCase: 'lowercase',
      opacity: false,
      show: null,
      showSpeed: 100,
      swatches: ["#ef9a9a","#90caf9","#a5d6a7","#fff59d","#ffcc80","#bcaaa4","#eeeeee","#f44336","#2196f3","#4caf50","#ffeb3b","#ff9800","#795548","#9e9e9e"]
    };

    this.$get = function() {
      return this;
    };

  });

  angular.module('minicolors').directive('minicolors', ['minicolors', '$timeout', function(minicolors, $timeout) {
    return {
      require: '?ngModel',
      restrict: 'A',
      priority: 1, //since we bind on an input element, we have to set a higher priority than angular-default input
      link: function(scope, element, attrs, ngModel) {

        var inititalized = false;

        //gets the settings object
        var getSettings = function() {
          var config = angular.extend({}, minicolors.defaults, scope.$eval(attrs.minicolors));
          return config;
        };

        //what to do if the value changed
        ngModel.$render = function() {

          //we are in digest or apply, and therefore call a timeout function
          $timeout(function() {
            var color = ngModel.$viewValue;
            element.minicolors('value', color);
          }, 0, false);
        };

        //init method
        var initMinicolors = function() {

          if (!ngModel) {
            return;
          }
          debugger
          var settings = getSettings();
          settings.change = function(hex) {
            scope.$apply(function() {
              ngModel.$setViewValue(hex);
            });
          };

          //destroy the old colorpicker if one already exists
          if (element.hasClass('minicolors-input')) {
            element.minicolors('destroy');
            element.off('blur', onBlur);
          }

          // Create the new minicolors widget
          element.minicolors(settings);

          // hook up into the jquery-minicolors onBlur event.
          element.on('blur', onBlur);

          // are we inititalized yet ?
          //needs to be wrapped in $timeout, to prevent $apply / $digest errors
          //$scope.$apply will be called by $timeout, so we don't have to handle that case
          if (!inititalized) {
            $timeout(function() {
              var color = ngModel.$viewValue;
              element.minicolors('value', color);
            }, 0);
            inititalized = true;
            return;
          }

          function onBlur(e) {
            scope.$apply(function() {
                var color = element.minicolors('value');
                ngModel.$setViewValue(color);
            });              
          }
        };

        initMinicolors();
        //initital call

        // Watch for changes to the directives options and then call init method again
        scope.$watch(getSettings, initMinicolors, true);
      }
    };
  }]);
});