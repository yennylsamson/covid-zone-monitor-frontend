function loadMap() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      x.innerHTML = "Geolocation is not supported by this browser.";
    }
}
  
function showPosition(position) {
    console.log(position.coords.latitude);
    console.log(position.coords.longitude);

    mapboxgl.accessToken = 'pk.eyJ1IjoicnBobG1uYnQiLCJhIjoiY2tnYnl3bXM5MDBscTM0cnpwbGwwZmNneCJ9.HjYTuuq_Cx8OwDsz31ZGsg';
            var map = new mapboxgl.Map({
                container: 'map', // Container ID
                style: 'mapbox://styles/mapbox/streets-v11', // Map style to use
                center: [position.coords.longitude, position.coords.latitude], // Starting position [lng, lat]
                zoom: 15, // Starting zoom level
            });

            var marker = new mapboxgl.Marker() // initialize a new marker
                .setLngLat([position.coords.longitude, position.coords.latitude]) // Marker [lng, lat] coordinates
                .addTo(map); // Add the marker to the map
            
            var geocoder = new MapboxGeocoder({ // Initialize the geocoder
                accessToken: mapboxgl.accessToken, // Set the access token
                mapboxgl: mapboxgl, // Set the mapbox-gl instance
                marker: false, // Do not use the default marker style
                // bbox: [-122.30937, 37.84214, -122.23715, 37.89838], // Boundary for Berkeley
                proximity: {
                    longitude: -122.25948,
                    latitude: 37.87221
                } // Coordinates of UC Berkeley
            });

            map.on('load', function() {
            map.addSource('single-point', {
                type: 'geojson',
                data: {
                type: 'FeatureCollection',
                features: []
                }
            });

            map.addLayer({
                id: 'point',
                source: 'single-point',
                type: 'circle',
                paint: {
                'circle-radius': 10,
                'circle-color': '#448ee4'
                }
            });

            // Listen for the `result` event from the Geocoder
            // `result` event is triggered when a user makes a selection
            //  Add a marker at the result's coordinates
            geocoder.on('result', function(e) {
                map.getSource('single-point').setData(e.result.geometry);
            });
            });
    var coords = position.coords.longitude + ',' + position.coords.latitude;
    displayPOI(coords);
}

function displayPOI(coords) {
    console.log(coords);
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        var myObj = JSON.parse(this.responseText);
        var name = myObj.features[0].place_name;
        document.getElementById("placename").innerText = name;
        console.log(myObj.features[0].place_name);
    }
    };
    xmlhttp.open("GET", "https://api.mapbox.com/geocoding/v5/mapbox.places/"+coords+".json?types=poi.landmark&limit=1&access_token=pk.eyJ1IjoicnBobG1uYnQiLCJhIjoiY2tnYnl3bXM5MDBscTM0cnpwbGwwZmNneCJ9.HjYTuuq_Cx8OwDsz31ZGsg", true);
    xmlhttp.send();
}

