const routes = require('express').Router();
const app_controller = require('../controllers/appController')
const { isAuth } = require("../middlewares/auth")

const db = require("../models")

/**
 * Index route.
 */
 routes.get('/', isAuth, app_controller.index)

/**
 * Authentication Routes
 */
routes.get('/login', app_controller.getLogin)

routes.post('/login', app_controller.doLogin)

routes.get('/logout', app_controller.doLogout)

/**
 * Admin Dashboard page.
 */
routes.get('/dashboard', isAuth, app_controller.getDashboard)

/**
 * Account Routes with api requesting.
 */
routes.get('/accounts', isAuth, app_controller.getAccounts)

routes.post('/accounts/new', isAuth, app_controller.createUser)

routes.post('/accounts/remove/:id', isAuth, app_controller.removeUser)

routes.post('/accounts/edit/:id', isAuth, app_controller.editUser)

/**
 * Brigade Routes with api requesting.
 */
routes.get('/brigades', isAuth, app_controller.getBrigades)

routes.post('/brigades/new', isAuth, app_controller.createBrigade)

routes.post('/brigades/remove/:id', isAuth, app_controller.removeBrigade)

routes.post('/brigades/edit/:id', isAuth, app_controller.editBrigade)

/**
 * Campaign Routes with api requesting.
 */
routes.get('/campaigns', isAuth, app_controller.getCampaigns)

routes.post('/campaigns/new', isAuth, app_controller.createCampaign)

routes.post('/campaigns/remove/:id', isAuth, app_controller.removeCampaign)

routes.post('/campaigns/edit/:id', isAuth, app_controller.editCampaign)

/**
 * Route endpoints with api requesting.
 */
routes.get('/routes', isAuth, app_controller.getRoutes)

routes.post('/routes/new', isAuth, app_controller.createRoute)

routes.post('/routes/remove/:id', isAuth, app_controller.removeRoute)

routes.post('/routes/edit/:id', isAuth, app_controller.editRoute)

/**
 * Index endpoints with api requesting.
 */
routes.get('/:appliance([0-9]+)/:campaign([0-9]+)/:route([0-9]+)', isAuth, app_controller.getRoute)

routes.get('/:appliance([0-9]+)/:campaign([0-9]+)', isAuth, app_controller.getCampaignRoutes)

routes.get('/:appliance([0-9]+)', isAuth, app_controller.getApplianceCampaigns)

routes.get('*', (req, res) => {
    res.send("404")
})

module.exports = routes