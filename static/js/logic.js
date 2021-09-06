// Store our API endpoint as queryUrl for earthquake API and addURL for techtonic plates.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var addURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

let earthquakes = new L.LayerGroup();
let techtonic = new L.LayerGroup();

// Create the base layers.
var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

// Code to generate Satellite Map 
var satellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
  maxZoom: 20,
  subdomains:['mt0','mt1','mt2','mt3']
});
// Code to generate Satellite Map 

// Code to generate Greyscale Map  
var host = 'https://maps.omniscale.net/v2/{id}/style.grayscale/{z}/{x}/{y}.png';

var attribution = '&copy; 2021 &middot; <a href="https://maps.omniscale.com/">Omniscale</a> ' +
    '&middot; Map data: <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

var grayscale = L.tileLayer(host, {
  id: API_KEY,
  attribution: attribution
})
// Greyscale code ends

// Create a baseMaps object.
var baseMaps = {
  "Street Map": street,
  "Topographic Map": topo,
  "Satellite": satellite,
  "Grayscale": grayscale
};

// Create an overlay object to hold our overlay.
var overlayMaps = {
  "Earthquakes": earthquakes,
  "Techtonic": techtonic
};

// Create our map, giving it the streetmap and earthquakes layers to display on load.
var myMap = L.map("map", {
  center: [
    37.09, -95.71
  ],
  zoom: 5,
  layers: [street, earthquakes]
});

// Create a layer control.
// Pass it our baseMaps and overlayMaps.
// Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (earthquakeData) {
//*   console.log(data.features[0].geometry)
  // Once we get a response, send the data.features object to the createFeatures function.
  console.log(earthquakeData);
  // Function to determine the magnitude size
  function marker(mag) {
    if (mag === 0) {
      return 2;
    }
    return mag * 4;
  }

  // Function to determine the color of earthquake (Green = Mild and Red = Strong)
  function color(mag) {
    if (mag > 5) {
      return "#eb4f34";
    }
    else if (mag > 4) {
      return "#eb9334";
    } 
    else if (mag > 3) {
      return "#ebc034";
    } 
    else if (mag > 2) {
      return "#dceb34";
    } 
    else if (mag > 1) {
      return "#37eb34";
    } 
    else {
      return "#34ebbd"; 
    }
  }

  // Function to Determine Style of Marker Based on the Magnitude of the Earthquake
  function style(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: color(feature.properties.mag),
      color: "#000000",
      radius: marker(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

    // Create a GeoJSON Layer Containing the Features Array on the earthquakeData Object
  L.geoJSON(earthquakeData, {
    pointToLayer: function(feature, latlng) {
      
        return L.circleMarker(latlng);
    },
    style: style,
    // Function to Run Once For Each feature in the features Array
    // Give Each feature a Popup Describing the Place & Time of the Earthquake
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h4>Location: " + feature.properties.place + 
      "</h4><hr><p>Date & Time: " + new Date(feature.properties.time) + 
      "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
    }      
  // Add earthquakeData to earthquakes LayerGroups 
  }).addTo(earthquakes);
  // Add earthquakes Layer to the Map
  earthquakes.addTo(myMap);

  // Set Up Legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "info legend"),
        levels = [0, 1, 2, 3, 4, 5],
        labels = [];

    div.innerHTML += "<h3>Magnitude</h3>"

    for (var i = 0; i < levels.length; i++) {
        div.innerHTML +=
            '<i style="background: ' + color(levels[i] + 1) + '"></i> ' +
            levels[i] + (levels[i + 1] ? '&ndash;' + levels[i + 1] + '<br>' : '+');
    }
    return div;
  };
  // Add Legend to the Map
  legend.addTo(myMap);

});

d3.json(addURL).then(function(techtonicData) {
  console.log(techtonicData)
  L.geoJSON(techtonicData, {
    color: "blue",
    weight: 5  
}).addTo(techtonic);
techtonic.addTo(myMap);
});








