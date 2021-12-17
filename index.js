/**
 * Required External Modules
 */
const express = require("express");
const path = require("path");
const appRoutes = require("./routes/appRoutes")
const apiRoutes = require("./routes/apiRoutes")
const cors = require('cors')

/**
 * App Variables
 */
const app = express()
const db = require("./models");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || "8000";
const http = require('http').createServer(app)
const io = require('socket.io')(http)
require('./controllers/appSocket')(io)
require('@google-cloud/debug-agent').start({ serviceContext: { enableCanary: true } });

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
            'http://localhost:8000'
        ],
        credidentials: true
    })
)
app.use(cookieParser())

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
        console.log(`App listening at http://localhost:${port}\n`);
    })
}).catch(err => {
    console.log("Database Sync Failed: " + err.stack); // Catch error if related to Sequelize.
})