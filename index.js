/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
const appRoutes = require("./routes/appRoutes")
const apiRoutes = require("./routes/apiRoutes")
const ioListener = require('./controllers/appSocket')
const cors = require('cors')
const cookieParse = require('cookie-parser')

/**
 * App Variables
 */
const app = express()
const db = require("./models");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || "8000";
const http = require('http').createServer(app)
const io = require('socket.io')(http)

/**
 *  App Configuration
 */
app.set("socketio", io)
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "pug")
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({extended: true}))
app.use(
    cors({
        origin: [
            'http:localhost:8000'
        ],
        credidentials: true
    })
)
app.use(cookieParser())
require('trace-unhandled/register')

let routeList = io
    .of('/index')
    .on('connection', (socket) => {
        ioListener.respond(routeList, socket)
    })

/**
 * Routes Definitions
 */
app.use("/api", apiRoutes)
app.use("/", appRoutes)

/**
 * Server Activation
 */
db.sequelize.sync().then(() => {
    console.log('Application has synced with the database successfully.');
    http.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
    })
}).catch(err => {
    console.error(err); // Catch error if related to Sequelize.
})