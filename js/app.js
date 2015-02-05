
angular.module('baresApp', [])

.factory("Utils", function(){
  return {
    baseURL: "http://kuesty.com/api"   
  }
})

.factory("Bares", function($http, Utils){
  var destacados = [];
  return {
    getDestacados: function(){
      var promise = new Promise(function(resolve, reject){
        if(destacados.length) {
          resolve(destacados);
          return;
        }
        var url = Utils.baseURL + "/gethighlights"; 
        $http({ method: 'GET', url: url})
  			.success(function(data, status, headers, config){
				  destacados = data.highlights;
  				resolve(destacados);
	  		})
        .error(function(data, status, headers, config){
	  			reject({error: "Ha ocurrido un error al intentar conectar con el servidor, por favor intente nuevamente en unos segundos!"});
			  });
      });
      return promise;  
    }  
  }
})

.filter('encode', function(){
  return function(value){
    return $q('<div/>').html(value).text();
  }  
})

.filter('prettyurl', function(){
  return function(value){
    return $q('<div/>').html(value).text().replace(/\s+/g, "-").replace(/-{2,}/g, "-");
  }  
})

.controller('BaresCtrl', ['$scope', 'Bares', function($scope, Bares){
  
  var self = this;
  
  self.id = Math.random();
  
  this.restos = [];
  this.percent = 100;
  /*
  this.restos = [
    { id:354,lat:-32.945877, lng:-60.647904, nombre:"Queens" },
    { id:118,lat:-32.935518, lng:-60.651356, nombre:"Rock & Feller's" }
  ];
  */
  
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
    
    var w = $q(window).width();
    var h = $q(window).height()-40;
    
    self.hyperlapse = new Hyperlapse(document.getElementById('pano'), {
      lookat: new google.maps.LatLng(origin.lat, origin.lng),
      zoom: 1,
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
      self.percent = 100;
      $scope.$apply();
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
       self.myPosition = {
        lat: e.point.location.lat(),
        lng: e.point.location.lng()
      }
    }

    self.directions_service = 
      self.directions_service || new google.maps.DirectionsService();
    
    self.route = {
      request:{
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(dest.lat, dest.lng),
        travelMode: google.maps.DirectionsTravelMode.DRIVING
      }
    };
    
    self.directions_service.route(self.route.request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        self.percent = 0;
        self.hyperlapse.generate( {route:response, loop:false} );
        $scope.$apply();
      } else {
        console.log(status);
      }
    });
  }

  this.init = function(){
    // create google maps instance
    var map = self.getMap();
    self.percent = 0;
    Bares.getDestacados().then(function(destacados){
      self.restos = destacados;
      self.percent = 100;
      $scope.$apply();
    });
  }

  this.selectResto = function(id) {
    var resto = self.getResto(id);
    self.getDirections(
      self.myPosition, 
      {lat:resto.latitud, lng:resto.longitud}
    );
  }

  this.updateHyperlapseSize = function(w, h){
    if(self.hyperlapse) self.hyperlapse.setSize(w,h);
  }

}]);

function controller(){
  return angular.element(document.getElementById('controller')).scope().controller;
}

$q = jQuery.noConflict();
$q(document).ready(function(){

  controller().init();

  $q('.menu-link').bigSlide();
  $q(window).resize(function() {
    controller().updateHyperlapseSize(
      $q(window).width(),
      $q(window).height()
    );
  });
  
});


