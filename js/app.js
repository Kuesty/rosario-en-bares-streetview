
var app = angular.module('baresApp', [])
.controller('BaresCtrl', function($scope){
  
  var self = this;
  this.restos = [
    { id:354,lat:-32.945877, lng:-60.647904, n:"Queens" },
    { id:118,lat:-32.935518, lng:-60.651356, n:"Rock & Feller's" }
  ];
  
  this.getResto = function(id) {
    for(var i=0;i<self.restos.length;i++){
      if(self.restos[i].id == id) return self.restos[i];
    }
    return null;
  }

  this.getRestoByIndex = function(i) {
    return self.restos[i];  
  }

  // dafault origin is Rosario airport -32.918255,-60.778975 (?)
  this.myPosition = {lat:-32.918255,lng:-60.67042000000001}
  
  // Hyperlapse.js instance
  this.hyperlapse = {};

  this.getDirections = function(origin, dest) {
    
    if(dest == null || origin == null) return;
     self.hyperlapse = new Hyperlapse(document.getElementById('pano'), {
      lookat: new google.maps.LatLng(origin.lat, origin.lng),
      zoom: 1,
      use_lookat: true,
      elevation: 50
    });

    self.hyperlapse.onError = function(e) {
      console.log(e);
    };

    self.hyperlapse.onRouteComplete = function(e) {
      self.hyperlapse.load();
    };

    self.hyperlapse.onLoadComplete = function(e) {
      self.hyperlapse.play();
    };
 
    self.hyperlapse.onRouteFinishingLine = function(e) {
      var newOrigin = {
        lat: e.point.location.lat(),
        lng: e.point.location.lng()
      }
      self.getDirections(newOrigin, self.getNextResto());
    }

    self.directions_service = self.directions_service || new google.maps.DirectionsService();
    self.route = {
      request:{
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(dest.lat, dest.lng),
        travelMode: google.maps.DirectionsTravelMode.DRIVING
      }
    };
    self.directions_service.route(self.route.request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        self.hyperlapse.generate( {route:response, loop:false} );
      } else {
      console.log(status);
      }
    });
  }

  this.moveTo = function(i) {
    console.log(i);
    self.getDirections(self.myPosition, self.getRestoByIndex(i));
  }
  
});

function controller(){
  return angular.element(document.getElementById('controller')).scope().controller;
}

$q = jQuery.noConflict();
$q(document).ready(function(){
  controller().moveTo(0);
});

