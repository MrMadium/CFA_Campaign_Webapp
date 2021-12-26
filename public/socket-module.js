var LiveMap = {
    init: (io, url, data) => {
        LiveMap.io = io(url)
        LiveMap.map = null
        LiveMap.marker = null
        LiveMap.casting = false
        LiveMap.data = data
        LiveMap.xmin;
        LiveMap.xmax;
        LiveMap.ymin;
        LiveMap.ymax;
        
        let x = [];
        let y = [];
        LiveMap.data.r.geom.coordinates.forEach(c => {
            x.push(c[0])
            y.push(c[1])
        })
        LiveMap.xmin = Math.min(...x);
        LiveMap.xmax = Math.max(...x);
        LiveMap.ymin = Math.min(...y);
        LiveMap.ymax = Math.max(...y);

        LiveMap._setup()
    },

    _setup: () => {
        LiveMap._createListeners()
        LiveMap._bindClickEvents()
        LiveMap._setupMap()
    },

    _setupMap: () => {
        LiveMap.map = new google.maps.Map(document.getElementById("map"), {
            center: { lat: LiveMap.ymin + ((LiveMap.ymax - LiveMap.ymin) / 2), lng: LiveMap.xmin + ((LiveMap.xmax - LiveMap.xmin) / 2) },
            /*restriction: {
                latLngBounds: {
                    north: LiveMap.ymax + 0.01,
                    south: LiveMap.ymin - 0.01,
                    west: LiveMap.xmin - 0.01,
                    east: LiveMap.xmax + 0.01
                }
            },*/
            zoom: 15
        });
        LiveMap.map.data.setStyle({
            strokeWeight: 6,
            strokeColor: '#006FFF'
        })
        LiveMap.map.data.addGeoJson(
            { "type": "Feature", "geometry": LiveMap.data.r.geom}
        );
        LiveMap.marker = new google.maps.Marker({
            map: LiveMap.map
        });
    },

    _createListeners: () => {
        LiveMap.io.on("castAccepted", () => {
            LiveMap.casting = true
            LiveMap._toggleButton()
        })

        LiveMap.io.on("castTerminated", () => {
            LiveMap.casting = false
            LiveMap._toggleButton()
            console.log("Broadcast has been terminated.");
        })
    },

    _toggleButton: () => {
        if (LiveMap.casting) {
            $('#broadcast-btn').toggleClass("btn-danger")
            $('#broadcast-btn').text("Stop Broadcast")
            LiveMap._beginBroadcast()
        } else {
            $('#broadcast-btn').toggleClass("btn-danger")
            $('#broadcast-btn').text("Begin Broadcasting")
        }
    },

    _startLoop: async () => {
        const castLoop = setInterval(async () => {
            if (LiveMap.casting) {
                const loc = await LiveMap._getCoords()
                const data = {
                    lat: loc.lat,
                    long: loc.long,
                    route: LiveMap.data.r.id,
                    campaign: LiveMap.data.c,
                    user: LiveMap.data.u,
                    appliance: LiveMap.data.a,
                }
                LiveMap.io.emit("geoData", data)
                LiveMap._drawToMap(loc)
            } else {
                clearInterval(castLoop)
            }
        }, 5000);
    },

    _drawToMap: (data) => {
        latLng = new google.maps.LatLng(data.lat, data.long)
        LiveMap.marker.setPosition(latLng)
    },

    _getCoords: async () => {
        const pos = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    
        return {
          long: pos.coords.longitude,
          lat: pos.coords.latitude,
        };
    },

    _beginBroadcast: () => {
        console.log("Broadcast has been started.");
        console.log("Loop will start here.");
        LiveMap._startLoop()
    },

    _bindClickEvents: () => {
        $('button').on("click", () => {
            if (LiveMap.casting) {
                LiveMap.io.emit("terminateCast")
            } else {
                LiveMap.io.emit("activeCast", $('#broadcast-btn').attr('data-item'))
            }
        })
    }
};