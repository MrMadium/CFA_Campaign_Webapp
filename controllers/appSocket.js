const { applianceArray } = require("../util/applianceArray")
const { sequelize } = require("../models");

exports = module.exports = function(io) {
    const route = io.of('/route')
    const aList = io.of('/aList')
    
    route.on('connection', (socket) => {
        console.info(`Server has detected a connection from ${socket.id}.`);

        socket.on("activeCast", (appliance) => {
            // Add appliance to lock list
            applianceArray.push({
                socketId: socket.id,
                applianceID: appliance
            })
            socket.emit("castAccepted")
            console.info("Server has recieved a broadcast from client.")

            aList.emit("activateAppliance", appliance)

            //console.log(`\n Server applianceLock: ${JSON.stringify(applianceArray)}`);

        })

        socket.on("terminateCast", () => {
            // Remove appliance from appliance lock.
            console.info("Server has recieved a stop broadcast from client.")
            const i = applianceArray.findIndex((o) =>{
                return o.socketId === socket.id;
            })
            const appliance = applianceArray[i].applianceID
            if (i !== -1) applianceArray.splice(i, 1);
            socket.emit("castTerminated")

            aList.emit("deactivateAppliance", appliance)

            //console.log(`\n Server applianceLock: ${JSON.stringify(applianceArray)}`);
        })

        socket.on("geoData", async (data) => {
            // Remove appliance from appliance lock.
            console.info("Server has recieved a location data.: " + JSON.stringify(data))
            try {
                await sequelize.query(`CALL setLatLong(${data.lat}, ${data.long}, ${data.route}, ${data.campaign}, '${socket.id}', ${data.user}, ${data.appliance}, @geom)`)
            }
            catch (e) {
                console.log(e)
            }
        })

        socket.on('disconnect', function () {
            // Remove appliance from appliance lock.
            const i = applianceArray.findIndex((o) =>{
                return o.socketId === socket.id;
            })
            if (i !== -1) applianceArray.splice(i, 1);
            console.info(`Server has detected ${socket.id} has disconnected.`);

            //console.log(`\n Server applianceLock: ${JSON.stringify(applianceArray)}`);
        });
    })
}