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
        Socket.io.on("castAccepted", () => {
            Socket.casting = true
            Socket._toggleButton()
        })

        Socket.io.on("castTerminated", () => {
            Socket.casting = false
            Socket._toggleButton()
            console.log("Broadcast has been terminated.");
        })
    },

    _toggleButton: () => {
        if (Socket.casting) {
            $('#broadcast-btn').toggleClass("btn-danger")
            $('#broadcast-btn').text("Stop Broadcast")
            Socket._beginBroadcast()
        } else {
            $('#broadcast-btn').toggleClass("btn-danger")
            $('#broadcast-btn').text("Begin Broadcasting")
        }
    },

    _beginBroadcast: () => {
        console.log("Broadcast has been started.");
        console.log("Loop will start here.");
        // loop here
    },

    _bindClickEvents: () => {
        $('button').on("click", () => {
            if (Socket.casting) {
                Socket.io.emit("terminateCast")
            } else {
                Socket.io.emit("activeCast", $('#broadcast-btn').attr('data-item'))
            }
        })
    }
};