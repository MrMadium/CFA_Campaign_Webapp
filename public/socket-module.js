var Socket = {
    init: (io, url) => {
        Socket.io = io(url)
        Socket.casting = false

        Socket._setup()
    },

    _setup: () => {
        Socket._createListeners()
        Socket._bindClickEvents()
    },

    _createListeners: () => {
        //Socket.io.on("")
    },

    _toggleButton: () => {
        $('#broadcast-btn').toggleClass("btn-danger")
        $('#broadcast-btn').text((i, text) => {
            return text === "Begin Broadcasting" ? "Stop Broadcast" : "Begin Broadcasting";
        })
        Socket._beginBroadcast() 
    },

    _beginBroadcast: () => {
        if (Socket.casting == false) {
            Socket.casting = true
        } else { Socket.casting = false }
        Socket.casting == true ? Socket.io.emit("activeCast") : Socket.io.emit("terminateCast")

        // loop here
    },

    _bindClickEvents: () => {
        $('button').on("click", () => {
            Socket._toggleButton()
        })
    }
};