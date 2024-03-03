var proxyUrl = "https://cors-anywhere.herokuapp.com/";
var token = "?key=6pAh8tTMx7TBtdEV5hpEbZTWb&format=json";
var apiRoot = "http://www.ctabustracker.com/bustime/api/v2/"
var getRoutesEnpoint = apiRoot + "getroutes" + token;
var getVehiclesEndpoint = apiRoot + "getvehicles" + token;

var BusTrackerVM = can.DefineMap.extend({
  title: {
   value:"Chicago CTA Bus Tracker By Illia Val"
  },
  routesPromise: {
    value() {
      return fetch(proxyUrl + getRoutesEnpoint , {
  method: "GET",
  headers: {"Content-type": "application/json;charset=UTF-8"}
}).then(response => response.json())
     .then(data => data["bustime-response"].routes);
  }
 },
 route: 'any',
 vehiclesPromise: 'any',
 pickRoute(route) {
   this.route = route;
   this.vehiclesPromise = fetch(proxyUrl + getVehiclesEndpoint + "&rt=" + route.rt)
     .then(response => response.json())
     .then(data => {
       if (data["bustime-response"].error) {
         return Promise.reject(data["bustime-response"].error[0]);
       } else {
         return data["bustime-response"].vehicle;
       }
     });
  }
});

can.Component.extend({
  tag: "google-map-view",
  view: can.stache(`<div class='gmap'></div>`),
  ViewModel: {
    map: 'any',
    vehicles: 'any',
    markers: 'any'
  },
  events: {
    "{viewModel} vehicles": function(vm, ev, newVehicles) {
      if (Array.isArray(this.markers)) {
        this.markers.forEach(marker => {
          marker.setMap(null);
        });
        this.markers = null;
      }
      if ( newVehicles ) {
        this.markers = newVehicles.map(vehicle => {
           return new google.maps.Marker({
             position: {
               lat: parseFloat(vehicle.lat),
               lng: parseFloat(vehicle.lon)
             },
             map: this.viewModel.map
           });
         });
       }
     },
    "{element} inserted": function() {
      googleAPI.then(() => {
        this.viewModel.map = new google.maps.Map(this.element.firstChild, {
         zoom: 11,
         center: {
           lat: 41.881,
           lng: -87.623
         }
       });
     });
  }
 }
});

var viewModel = new BusTrackerVM();

var view = can.stache.from("app-view");
var frag = view(viewModel);
document.body.appendChild(frag);