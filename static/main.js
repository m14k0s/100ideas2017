       $(document).ready(function() {
           function normalise(temperature) {
               var temp = parseInt(temperature);
               return (temp - 30) / (40 - 30);
           }

           function geoJson2heat(geojson, intensity) {
               return geojson.rows.map(function(feature) {

                   return {
                       'latitude': feature.geometry.coordinates[1],
                       'longitude': feature.geometry.coordinates[0],
                       'temperature': normalise(feature.properties['temperature'])
                   };
               });
           }


           var cfg = {
               // radius should be small ONLY if scaleRadius is true (or small radius is intended)
               // if scaleRadius is false it will be the constant radius used in pixels
               "radius": .00175,
               "maxOpacity": .6,
               // scales the radius based on map zoom
               "scaleRadius": true,
               // if set to false the heatmap uses the global maximum for colorization
               // if activated: uses the data maximum within the current map boundaries
               //   (there will always be a red spot with useLocalExtremas true)
               "useLocalExtrema": true,
               // which field name in your data represents the latitude - default "lat"
               latField: 'latitude',
               // which field name in your data represents the longitude - default "lng"
               lngField: 'longitude',
               // which field name in your data represents the data value - default "value"
               valueField: 'temperature'
           };

           var heatmapLayer = new HeatmapOverlay(cfg);

           var taxiIcon = L.icon({
               iconUrl: 'http://www.zaragoza.es/contenidos/iconos/paradasdeTaxi.png',
               iconSize: [22, 20], // size of the icon
               iconAnchor: [11, 10], // point of the icon which will correspond to marker's location
               popupAnchor: [0, -10] // point from which the popup should open relative to the iconAnchor
           });

           var bikeIcon = L.icon({
               iconUrl: 'https://www.zaragoza.es/contenidos/iconos/bizi/conbicis.png',
               iconSize: [22, 20], // size of the icon
               iconAnchor: [11, 10], // point of the icon which will correspond to marker's location
               popupAnchor: [0, -10] // point from which the popup should open relative to the iconAnchor
           });

           var redMarker = {
               radius: 8,
               fillColor: "#00ff00"
           }
           //var stations = L.geoJSON();
           //var accidents = L.geoJSON();

           var map = L.map('map', {
               center: [41.67045402508031, -0.9047149146440716],
               zoom: 13,
               minZoom: 12,
               maxZoom: 18
               //layers: [stations, accidents]
           });
           L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {}).addTo(map);

           var overlayMaps = {
               "Stations": stations
           };

           //L.control.layers(overlayMaps).addTo(map);
           L.control.scale().addTo(map);
           $("#stations").click(function() {
               $.getJSON("http://www.zaragoza.es/sede/servicio/urbanismo-infraestructuras/estacion-bicicleta.geojson?rows=1000", function(data, status) {
                   L.geoJson(data, {
                       pointToLayer: function(feature, latlng) {
                           return L.marker(latlng, {
                               icon: bikeIcon
                           });
                       },
                       onEachFeature: function(feature, layer) {
                           layer.bindPopup('<strong>' + feature.properties.title + '</strong>' +
                               '<p>Estado: ' + feature.properties.estado + '</p>' +
                               '<p>Bicis Disponibles: ' + feature.properties.bicisDisponibles + '</p>' +
                               '<p>Anclajes Disponibles: ' + feature.properties.anclajesDisponibles + '</p>');
                       }
                   }).addTo(map);
               });
           });
           $("#accidents").click(function() {
               $.getJSON("http://www.zaragoza.es/sede/servicio/transporte/accidentalidad-trafico/accidente.geojson?srsname=wgs84&rows=1000&fl=id,type&q=vehiculo.type%3D%3Dbicis;year%3D%3D2016", function(data, status) {
                   L.geoJson(data, {
                       pointToLayer: function(feature, latlng) {
                           return L.circleMarker(latlng, redMarker);
                       },
                       onEachFeature: function(feature, layer) {
                           layer.bindPopup('<strong>' + feature.properties.type + '</strong>');
                       }
                   }).addTo(map);
               });
           });
           $("#taxis").click(function() {
               $.getJSON("http://www.zaragoza.es/sede/servicio/urbanismo-infraestructuras/equipamiento/parada-taxi.geojson", function(data, status) {
                   L.geoJson(data, {
                       pointToLayer: function(feature, latlng) {
                           return L.marker(latlng, {
                               icon: taxiIcon
                           });
                       },
                       onEachFeature: function(feature, layer) {
                           layer.bindPopup('<strong>' + feature.properties.title + '</strong>');
                       }
                   }).addTo(map);
               });
           });
           $("#temperatures").click(function() {
               $.getJSON("temperatures_proxy", function(data, status) {
                   var testData = {
                       max: 1,
                       data: geoJson2heat(data)
                   };
                   console.log('temperaturas')
                   heatmapLayer.setData(testData);
                   heatmapLayer.addTo(map);
               });
           });
           $("#remove").click(function() {
              map.remove();
              map = L.map('map', {
               center: [41.67045402508031, -0.9047149146440716],
               zoom: 15 //,
               //layers: [stations, accidents]
            });
                L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {}).addTo(map);
           });
       });
