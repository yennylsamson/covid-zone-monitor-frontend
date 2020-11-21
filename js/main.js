var pName;
var cPositionLong;
var cPositionLat;

function loadMap() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(showPosition, error, options);
    } else {
      x.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
}



options = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 0
};
  
function showPosition(position) {
    if (position.coords.longitude !== cPositionLong || position.coords.latitude !== cPositionLat) {
        cPositionLong = position.coords.longitude;
        cPositionLat = position.coords.latitude;
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
            listPlace(date, time, name);
            pName = name;
        }
    }
    };
    xmlhttp.open("GET", "https://api.mapbox.com/geocoding/v5/mapbox.places/"+coords+".json?types=poi.landmark&limit=1&access_token=pk.eyJ1IjoicnBobG1uYnQiLCJhIjoiY2tnYnl3bXM5MDBscTM0cnpwbGwwZmNneCJ9.HjYTuuq_Cx8OwDsz31ZGsg", true);
    xmlhttp.send();
    var date = getDate();
    var time = getTime();
}

function saveData(){
    const last_name = document.getElementById('lastName').value;
    const first_name = document.getElementById('firstName').value;
    const email_address = document.getElementById('emailAdd').value;
    const phone_number = document.getElementById('phoneNumber').value;
    const user_address = document.getElementById('address').value;
    const user_password = document.getElementById('password').value;
    const repeat_password = document.getElementById('repeatPass').value;

    const dataList = new FormData();
    dataList.append("json", JSON.stringify({
        dataLastName: last_name,
        dataFirstName: first_name,
        dataEmailAdd: email_address,
        dataPhoneNumber: phone_number,
        dataAddress: user_address,
        dataPassword: user_password
    }));
    if (repeat_password === user_password) {
        if(user_password.length <= 6){
            window.alert('Password must be longer than 6 characters.');
        }
        else{
            fetch('http://localhost:4040/users/new', {
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
                window.location.href ="http://localhost:8080/covid-zone-monitor-frontend/login.html"
                });
            window.alert('Successfully Registered!');
        }
    }
    else{
        window.alert("Repeat Password is not the same");
    }
    

    
}

function getUsers() {
    fetch('http://localhost:4040/users/list', {
        method: 'get'
    }
    
    ).then(function(response) {
      return response.json();
    }).then(function(dataList) {
        console.log(dataList);
        console.log(dataList.data[1]);
    });
}

// first_name, last_name, date_Time, place_Name

function listPlace(date, time, place_Name) { 
    last_name = sessionStorage.getItem('userLastName');
    first_name = sessionStorage.getItem('userFirstName');


    fetch('http://localhost:4040/users/log', {
        method: 'post', body: JSON.stringify({
            // dataLastName: last_name,
            // dataFirstName: first_name,
            dataTime: time,
            dataDate: date,
            placeName: place_Name,
            dataLastName: last_name,
            dataFirstName: first_name,
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
    var date = "Date: " + months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();

    return date;
}

function getTime() {
    var d = new Date();
    var min = (d.getMinutes()<10?("0"+d.getMinutes()):(d.getMinutes()));
    var time = "Time: " + d.getHours() + ":" + min;

    return time;
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
        if (dataList.data[0].dataPassword === pass && dataList.data[0].dataEmailAdd === emailAdd) {

            // User last name stored in session storage
            sessionStorage.setItem('userLastName', dataList.data[0].dataLastName);
            sessionStorage.setItem('userFirstName', dataList.data[0].dataFirstName);
            window.location.href ="http://localhost:8080/covid-zone-monitor-frontend/notification.html"
            // window.location.href ="http://localhost/covid-zone-monitor-frontend/notification.html"
            
            
        } else{
            window.alert("Wrong Email or Password");
        }
    });
}

//add users location to positive table
function addPostiveLocation() {
    lastName = sessionStorage.getItem('userLastName');
    console.log(lastName);
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
            console.log("Date: "+e.dataDate);
            // add to the database
            fetch('http://localhost:4040/users/pos', {
            method: 'post', body: JSON.stringify({

                dataDate: e.dataDate,
                placeName: e.placeName,
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


function showLocationHistory() {
    lastName = sessionStorage.getItem('userLastName');
    // lastName = "last_name";
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
             console.log("Date: "+e.dataDate);
             var table = document.getElementById("historyTable");
             var row = table.insertRow(-1);
             var cell1 = row.insertCell(0);
             var cell2 = row.insertCell(1);
             cell1.innerHTML = e.dataDate;
             cell2.innerHTML = e.placeName;

        });
    });
}

//get locations with covid positive
function getPositiveLocation() {

    var positive = false;
    var positiveLastPlace = "";
    var positiveLastDate = "";
    var negativeLastPlace = "";
    var negativeLastDate = "";

    fetch('http://localhost:4040/users/getpos', {
        method: 'get'
    }
    
    ).then(function(response) {
      return response.json();
    }).then(function(positiveLocations) {
        var comparedLocations = {
            "locations":[
          ]
        }

        lastName = sessionStorage.getItem('userLastName');
        fetch('http://localhost:4040/users/loc', {
            method: 'post', body: JSON.stringify({
                dataLastName : lastName,
            }),
                headers:{"Content-Type": "application/json"}
        }).then(function(response) {
        return response.json();
        }).then(function(dataList) {
            
            dataList.data.forEach(function (e) {
                console.log("date-"+e.placeName);
                 positiveLocations.data.forEach(function (f) {
                    if (e.placeName === f.placeName && e.dataDate === f.dataDate) {
                        var newPlaceName = f.placeName;
                        var newDataDate = f.dataDate;
                        comparedLocations['locations'].push({"placeName":newPlaceName,"dataDate":newDataDate});
                        console.log("same location");
                        console.log(comparedLocations);

                        positive = true;
                        // save latest location and date
                        console.log("date-"+e.dataFirstName+"place-"+f.placeName)

                        // var newSpanLoc = document.createElement('span');
                        // var newSpanDate = document.createElement('span');
                        // var newLine = "\r\n";
                        // newSpanLoc.setAttribute('id', 'positivePlace');
                        // newSpanDate.setAttribute('id', 'positiveDate');
                        // document.getElementById('infoPos').appendChild(newSpanLoc);
                        // document.getElementById('infoPos').appendChild(newSpanDate);

                        // newSpanLoc.innerHTML = positiveLastPlace+ "<br />";

                        // newSpanDate.innerHTML = positiveLastDate+ "<br />"+ "<br />";

                        var place = newPlaceName;
                        var date =newDataDate+ "<br />"+ "<br />";
                        var table = document.getElementById("infoTable");
                        var row = table.insertRow(-1);
                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2);

                        var mapSign = document.createElement('span');
                        mapSign.setAttribute('class','fa fa-map-marker location-symbol symb');
                        var warnSign = document.createElement('span');
                        warnSign.setAttribute('class','fa fa-exclamation-circle warning-symbol symb');
                        cell1.appendChild(warnSign);
                        cell2.innerHTML =place;
                        cell3.appendChild(mapSign);

                        var row1 = table.insertRow(-1);
                        var cell11 = row1.insertCell(0);
                        var cell21 = row1.insertCell(1);
                        var cell31 = row1.insertCell(2);
                        cell11.innerHTML = "";
                        cell21.innerHTML =date;
                        cell31.innerHTML ="";
                    }
                    
                 })
                negativeLastPlace= e.placeName;
                negativeLastDate = e.dataDate;
            });

            console.log(positive);
            var postiveDiv = document.getElementById("postiveCard");
            var negativeDiv = document.getElementById("negativeCard");
            if(positive == true){
                negativeDiv.style.display = "none";
            }else {
                postiveDiv.style.display = "none";
            }
        });
    });
    
   
}




//reset localstorage
function temporaryReset() {
   localStorage.clear();
}