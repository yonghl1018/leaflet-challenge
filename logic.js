//URL
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
//get request and feature
d3.json(queryURL).then(function(data){
    createFeatures(data.features);
  });

function createFeatures(earthquakeData, platesData){
    // Describe earthquakes like place, time, magnitude
    function onEachFeature(feature, layer){
        layer.bindPopup(`<h3>Where: ${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Number of "Felt" Reports: ${feature.properties.felt}`);
    }

    // Create layer
    function createCircleMarker(feature, latlng){
       let options = {
        radius:feature.properties.mag*5,
        fillColor: chooseColor(feature.properties.mag),
        color: chooseColor(feature.properties.mag),
        weight: 1,
        opacity: 0.8,
        fillOpacity: 0.35
       } 
       return L.circleMarker(latlng,options);
    }
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });

    createMap(earthquakes);
}

// make marker differ by earthquake magnitude
function chooseColor(mag){
    switch(true){
        case(1.0 <= mag && mag <= 2.5):
            return "#0071BC"; // Strong blue
        case (2.5 <= mag && mag <=4.0):
            return "#35BC00";
        case (4.0 <= mag && mag <=5.5):
            return "#BCBC00";
        case (5.5 <= mag && mag <= 8.0):
            return "#BC3500";
        case (8.0 <= mag && mag <=20.0):
            return "#BC0000";
        default:
            return "#E2FFAE";
    }
}

// map legend
let legend = L.control({position: 'bottomright'});

legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend');
    var grades = [1.0, 2.5, 4.0, 5.5, 8.0];
    var labels = [];
    var legendInfo = "<h4>Magnitude</h4>";

    div.innerHTML = legendInfo

    for (var i = 0; i < grades.length; i++) {
          labels.push('<ul style="background-color:' + chooseColor(grades[i] + 1) + '"> <span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '' : '+') + '</span></ul>');
        }

      div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    
    return div;
  };
//create map
function createMap(earthquakes) {
    // Define outdoors and graymap layers
    let streetstylemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
     attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
     maxZoom: 20,
     id: "outdoors-v12",
     accessToken: API_KEY
   })
 
   let graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
     attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
     maxZoom: 20,
     id: "light-v11",
     accessToken: API_KEY
   });
 
   // Define a baseMaps object to hold our base layers
   let baseMaps = {
     "Outdoors": streetstylemap,
     "Grayscale": graymap
   };
 
   // Create overlay object to hold our overlay layer
   let overlayMaps = {
     Earthquakes: earthquakes
   };
 
   // Create our map, giving it the streetmap and earthquakes layers to display on load
   let myMap = L.map("map", {
     center: [
       39.85, -98.58
     ],
     zoom: 4,
     layers: [streetstylemap, earthquakes]
   });
   // Add the layer control to the map
   L.control.layers(baseMaps, overlayMaps, {
     collapsed: false
   }).addTo(myMap);
   legend.addTo(myMap);
}