const routes = require('express').Router();
const app_controller = require('../controllers/appController')
const { authorize } = require("../middlewares/auth")

const db = require("../models")

/**
 * Index route.
 */
 routes.get('/', authorize(['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.index)

 routes.get('/:campaign([0-9]+)/:appliance([0-9]+)/:route([0-9]+)', authorize(['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.getRoute)

 routes.get('/:campaign([0-9]+)/:appliance([0-9]+)', authorize(['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.getCampaignRoutes)
 
 routes.get('/:campaign([0-9]+)', authorize(['ROLE_USER', 'ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.getCampaignAppliances)

/**
 * Authentication Routes
 */
routes.get('/login', app_controller.getLogin)

routes.post('/login', app_controller.doLogin)

routes.get('/logout', app_controller.doLogout)

/**
 * Admin Dashboard page.
 */
routes.get('/dashboard', authorize(['ROLE_ADMIN']), app_controller.getDashboard)

/**
 * Account Routes with api requesting.
 */
routes.get('/accounts', authorize(['ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.getAccounts)

routes.post('/accounts/new', authorize(['ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.createUser)

routes.post('/accounts/remove/:id', authorize(['ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.removeUser)

routes.post('/accounts/edit/:id', authorize(['ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.editUser)

/**
 * Brigade Routes with api requesting.
 */
routes.get('/brigades', authorize(['ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.getBrigades)

routes.post('/brigades/new', authorize(['ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.createBrigade)

routes.post('/brigades/remove/:id', authorize(['ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.removeBrigade)

routes.post('/brigades/edit/:id', authorize(['ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.editBrigade)

/**
 * Campaign Routes with api requesting.
 */
routes.get('/campaigns', authorize(['ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.getCampaigns)

routes.post('/campaigns/new', authorize(['ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.createCampaign)

routes.post('/campaigns/remove/:id', authorize(['ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.removeCampaign)

routes.post('/campaigns/edit/:id', authorize(['ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.editCampaign)

/**
 * Route endpoints with api requesting.
 */
routes.get('/routes', authorize(['ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.getRoutes)

routes.post('/routes/new', authorize(['ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.createRoute)

routes.post('/routes/remove/:id', authorize(['ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.removeRoute)

routes.post('/routes/edit/:id', authorize(['ROLE_ADMIN', 'ROLE_SUPERVISOR']), app_controller.editRoute)


routes.get('*', (req, res) => {
    res.send("404")
})

module.exports = routes