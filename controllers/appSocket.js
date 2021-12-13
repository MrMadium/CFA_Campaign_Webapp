exports.respond = (endpoint, socket) => {
    
    socket.on('activateAppliance', () => {

        endpoint.emit("applianceStatus")

    })

}