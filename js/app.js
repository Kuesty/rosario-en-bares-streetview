
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
  this.map = null;
  this.marker = null;

  this.getMap = function() {
    if(self.map == null) {
      var myLatLng = new google.maps.LatLng(self.myPosition.lat, self.myPosition.lng);
      var mapOptions = { zoom: 13, center: myLatLng };
      self.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
      
      var marker = new google.maps.Marker({
        position: myLatLng,
        map: self.map,
        title:"Usted esta aqui!",
        icon: 'img/icon.png'
      });
      marker.setMap(self.map);
      self.marker = marker;
    }
    return self.map;
  }
  
  // Hyperlapse.js instance
  this.hyperlapse = {};

  this.getDirections = function(origin, dest) {
    
    if(dest == null || origin == null) return;
    
    var w = $q("#pano").width();
    var h = $q("#pano").height();
    
    self.hyperlapse = new Hyperlapse(document.getElementById('pano'), {
      lookat: new google.maps.LatLng(origin.lat, origin.lng),
      zoom: 3,
      use_lookat: false,
      elevation: 50,
      width: w,
      height: h
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
 
    self.hyperlapse.onFrame = function(e) {
     
      var map = self.getMap();

      var point = e.point.location;
      var latLng = new google.maps.LatLng(point.lat(), point.lng());
      
      self.marker.setMap(null);
      map.panTo(latLng);
      var marker = new google.maps.Marker({
        position: latLng,
        map: self.map,
        title:"Usted esta aqui!",
        icon: 'img/icon.png'
      });
      marker.setMap(map);
      self.marker = marker;
    }

    self.hyperlapse.onRouteFinishingLine = function(e) {
      var newOrigin = {
        lat: e.point.location.lat(),
        lng: e.point.location.lng()
      }
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
    self.getDirections(self.myPosition, self.getRestoByIndex(i));
  }
  
  this.init = function(){
    // create google maps instance
    var map = self.getMap();

    // move to first position
    self.moveTo(0);
  }

});

function controller(){
  return angular.element(document.getElementById('controller')).scope().controller;
}

$q = jQuery.noConflict();
$q(document).ready(function(){
  controller().init();
});

