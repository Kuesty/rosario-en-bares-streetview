function _app(){
  
  var self = this;

  this.restos = [
    { lat:-32.945877, lng:-60.647904, n:"Queens" },
    { lat:-32.935518, lng:-60.651356, n:"Rock & Feller's" }
  ];

  this.getNextResto = function() {
    for(var i in self.restos) {
      if(self.restos[i].visited == undefined) {
        self.restos[i].visited == true;
        return self.restos[i];
      }
    }
    return null;
  }

  // TODO - change with navigator geolocation
  this.myPosition = {lat:-32.94346,lng:-60.67042000000001}
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

  self.getDirections(self.myPosition, self.getNextResto());

};

function init() {
  var app = new _app();
}
