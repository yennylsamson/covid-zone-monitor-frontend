var pName;

function loadMap() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(showPosition);
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
        if (name !== pName) {
            document.getElementById("placename").innerText = name;
            console.log(myObj.features[0].place_name);
            listPlace(dateTime, name);
            pName = name;
        }
    }
    };
    xmlhttp.open("GET", "https://api.mapbox.com/geocoding/v5/mapbox.places/"+coords+".json?types=poi.landmark&limit=1&access_token=pk.eyJ1IjoicnBobG1uYnQiLCJhIjoiY2tnYnl3bXM5MDBscTM0cnpwbGwwZmNneCJ9.HjYTuuq_Cx8OwDsz31ZGsg", true);
    xmlhttp.send();
    var dateTime = getDate();
}

function saveData(){
    const last_name = document.getElementById('lastName').value;
    const first_name = document.getElementById('firstName').value;
    const email_address = document.getElementById('emailAdd').value;
    const phone_number = document.getElementById('phoneNumber').value;
    const user_address = document.getElementById('address').value;
    const user_password = document.getElementById('password').value;

    const dataList = new FormData();
    dataList.append("json", JSON.stringify({
        dataLastName: last_name,
        dataFirstName: first_name,
        dataEmailAdd: email_address,
        dataPhoneNumber: phone_number,
        dataAddress: user_address,
        dataPassword: user_password
    }));
    fetch('http://localhost:4040/users/register', {
        method: 'post', body: JSON.stringify({
            dataLastName: last_name,
            dataFirstName: first_name,
            dataEmailAdd: email_address,
            dataPhoneNumber: phone_number,
            dataAddress: user_address,
            dataPassword: user_password
        }), 
            headers:{"Content-Type": "application/json"}
    }).then(function(response) {
        return response.json();
    }).then(function(dataList) {
        console.log(dataList);
        getUsers();
    });

    
}

function getUsers() {
    fetch('http://localhost:4040/users/list', {
        method: 'get'
    }
    
    ).then(function(response) {
      return response.json();
    }).then(function(dataList) {
        console.log(dataList);
        console.log("BREAL");
        console.log(dataList.data[1]);
    });
}

// first_name, last_name, date_Time, place_Name

function listPlace(date_Time, place_Name) { 
    const dataList = new FormData();
    dataList.append("json", JSON.stringify({
        dataLastName: "last_name",
        dataFirstName: "first_name",
        dateTime: "date_Time",
        placeName: "place_Name",
    }));

    fetch('http://localhost:4040/users/log', {
        method: 'post', body: JSON.stringify({
            // dataLastName: last_name,
            // dataFirstName: first_name,
            dateTime: date_Time,
            placeName: place_Name,
            dataLastName: "last_name",
            dataFirstName: "first_name",
            // dateTime: "date_Time",
            // placeName: "place_Name",
        }), 
            headers:{"Content-Type": "application/json"}
    }).then(function(response) {
        return response.json();
    }).then(function(dataList) {
        console.log(dataList);
        getUsers();
    });
}

function getDate() {
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var d = new Date();
    var min = (d.getMinutes()<10?("0"+d.getMinutes()):(d.getMinutes()));
    var dateTime = "Date: " + months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear() + " " + "Time: " + d.getHours() + ":" + min;

    return dateTime;
}


function checkCreds() {
    emailAdd = document.getElementById('emailLogin').value;
    pass = document.getElementById('passLogin').value;
    fetch('http://localhost:4040/users/auth', {
        method: 'post', body: JSON.stringify({
            dataEmailAdd : emailAdd,
        }),
            headers:{"Content-Type": "application/json"}
    }).then(function(response) {
      return response.json();
    }).then(function(dataList) {
        if (dataList.data[0].dataPassword === pass) {

            // User last name stored in localstorage
            //localStorage.setItem('userLastName', dataList.data[0].dataLastName);
            // window.location.href ="http://localhost:8080/covid-zone-monitor-frontend/notification.html"
            window.location.href ="http://localhost/covid-zone-monitor-frontend/notification.html"
            
        }
    });
}


function getPostiveLocation() {
    // lastName = localStorage.getItem('userLastName');
    lastName = "last_name";
    fetch('http://localhost:4040/users/loc', {
        method: 'post', body: JSON.stringify({
            dataLastName : lastName,
        }),
            headers:{"Content-Type": "application/json"}
    }).then(function(response) {
      return response.json();
    }).then(function(dataList) {
        dataList.data.forEach(function (e) {
            // console.log("Placename: "+e.placeName);
            // console.log("date: "+e.dateTime);
            // add to the database
            fetch('http://localhost:4040/users/pos', {
            method: 'post', body: JSON.stringify({

                dateTime: e.dateTime,
                location: e.placeName,
            }), 
                headers:{"Content-Type": "application/json"}
            }).then(function(response) {
                return response.json();
            }).then(function(dataList) {
                console.log(dataList);
            });
        });
    });
}


function showPostiveLocation() {
    // lastName = localStorage.getItem('userLastName');
    lastName = "last_name";
    fetch('http://localhost:4040/users/loc', {
        method: 'post', body: JSON.stringify({
            dataLastName : lastName,
        }),
            headers:{"Content-Type": "application/json"}
    }).then(function(response) {
    return response.json();
    }).then(function(dataList) {
        dataList.data.forEach(function (e) {
             console.log("Placename: "+e.placeName);
             console.log("date: "+e.dateTime);
             var table = document.getElementById("historyTable");
             var row = table.insertRow(-1);
             var cell1 = row.insertCell(0);
             var cell2 = row.insertCell(1);
             cell1.innerHTML = e.dateTime;
             cell2.innerHTML = e.placeName;

        });
    });

}

//reset localstorage
function temporaryReset() {
   localStorage.clear();
}