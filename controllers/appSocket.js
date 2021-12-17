exports = module.exports = function(io) {
    let applianceLock = []

    io
    .of('/index')
    .on('connection', (socket) => {
        console.info(`Server has detected a connection from ${socket.id}.`);

        socket.on("activeCast", () => {
            // Add appliance to lock list
            applianceLock.push(socket.id)
            console.info("Server has recieved a broadcast from client.")

        })

        socket.on("terminateCast", () => {
            // Remove appliance from appliance lock.
            applianceLock.splice(socket.id)
            console.info("Server has recieved a stop broadcast from client.")
        })

        socket.on("locData", () => {
            // Remove appliance from appliance lock.
            console.info("Server has recieved a location data.")
        })

        socket.on('disconnect', function () {
            // Remove appliance from appliance lock.
            console.info(`Server has detected ${socket.id} has disconnected.`);
        });
    })

    io
    .of('/route')
    .on('connection', (socket) => {
        
    })
}