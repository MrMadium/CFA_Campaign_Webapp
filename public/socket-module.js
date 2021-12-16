var Socket = {
    init: (io, url) => {
        Socket.io = io(url)

        Socket._setup()
    },

    _setup: () => {
        Socket._createListeners()
        Socket._bindClickEvents()
    },

    _createListeners: () => {
        //Socket.io.on("")
    },

    _beginBroadcast: () => {
        Socket.io.emit("activeCast"); // send a appliance id.
    },

    _bindClickEvents: () => {
        $('#broadcast-btn').on("click", () => {
            Socket._beginBroadcast() 
        })
    }
};