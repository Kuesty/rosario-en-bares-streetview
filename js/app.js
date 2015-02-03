function _app(){
  
  var self = this;

  this.restos = [
    { lat:-32.935518, lng:-60.651356, n:"Rock & Feller's" }
  ];

  // TODO - change with navigator geolocation
  this.myPosition = {lat:-32.94346,lng:-60.67042000000001}

  this.hyperlapse = new Hyperlapse(document.getElementById('pano'), {
    lookat: new google.maps.LatLng(self.myPosition.lat, self.myPosition.lng),
    zoom: 1,
    use_lookat: true,
    elevation: 50
  });

  this.hyperlapse.onError = function(e) {
    console.log(e);
  };

  this.hyperlapse.onRouteComplete = function(e) {
    self.hyperlapse.load();
  };

  this.hyperlapse.onLoadComplete = function(e) {
    self.hyperlapse.play();
  };

  this.directions_service = new google.maps.DirectionsService();
  this.route = {
    request:{
      origin: new google.maps.LatLng(self.myPosition.lat, self.myPosition.lng),
      destination: new google.maps.LatLng(self.restos[0].lat, self.restos[0].lng),
      travelMode: google.maps.DirectionsTravelMode.DRIVING
    }
  };

  this.directions_service.route(self.route.request, function(response, status) {
    console.log(self);
    if (status == google.maps.DirectionsStatus.OK) {
      self.hyperlapse.generate( {route:response, loop:false} );
    } else {
      console.log(status);
    }
  });

};

function init() {
  var app = new _app();
}
