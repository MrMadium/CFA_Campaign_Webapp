exports = module.exports = function(io) {
    let applianceLock = []

    io
    .of('/index')
    .on('connection', (socket) => {
        console.log("hello index page.");

        socket.on("activeCast", () => {
            // Add appliance to lock list
            console.log("Server detected a broadcast event.");
        })

        socket.on("terminateCast", () => {
            // Remove appliance from appliance lock.
            console.log("Server detected a broadcast termincation event.");
        })

        socket.on('disconnect', function () {
            // Remove appliance from appliance lock.
            console.log("Server detected a disconnect event.");
        });
    })

    io
    .of('/route')
    .on('connection', (socket) => {
        console.log("hello route page");
    })
}