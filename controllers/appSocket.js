exports = module.exports = function(io) {
    let applianceLock = []

    io
    .of('/index')
    .on('connection', (socket) => {

        socket.on("activeCast", () => {
            // Add appliance to lock list
        })

        socket.on("terminateCast", () => {
            // Remove appliance from appliance lock.
        })

        socket.on('disconnect', function () {
            // Remove appliance from appliance lock.
        });
    })

    io
    .of('/route')
    .on('connection', (socket) => {
        
    })
}