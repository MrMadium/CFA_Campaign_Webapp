/**
 * Required modules for Api Routes.
 */
const api = require('express').Router();
const api_controller = require('../controllers/apiController');
const { apiSecured } = require('../middlewares/auth');

/**
 * Index of our api.
 */
api.get('/', api_controller.index);

/**
 * Authentication Route Handler
 */
api.post('/auth/login', api_controller.authUser)


/**
 * Users Route Handler
 */
api.get('/users/all', api_controller.getUsers)

api.post('/users/new', api_controller.newUser)

api.get('/users/brigade/:id', apiSecured, api_controller.getUsersByBrigade)

api.get('/users/:id', apiSecured, api_controller.getUser)

api.post('/users/:id', apiSecured, api_controller.updateUser)

api.delete('/users/:id', apiSecured, api_controller.removeUser)


/**
 * Role Route Handler
 */
api.get('/roles/all', apiSecured, api_controller.getRoles)

api.get('/roles/:id', apiSecured, api_controller.getRole)

api.post('/roles/new', apiSecured, api_controller.newRole)

api.post('/roles/:id', apiSecured, api_controller.updateRole)

api.delete('/roles/:id', apiSecured, api_controller.removeRole)


/**
 * Appliances Route Handler
 */
api.get('/appliances', apiSecured, api_controller.getAppliances)


api.get('/appliances/:id', apiSecured, api_controller.getAppliance)

api.get('/appliances/campaign/:id', apiSecured, api_controller.getApplianceByCampaign)

api.put('/appliances/:id', apiSecured, api_controller.updateAppliance)

api.post('/appliances/new', apiSecured, api_controller.newAppliance)

api.delete('/appliances/:id', apiSecured, api_controller.removeAppliance)


/**
 * ApplianceClass Route Handler
 */
api.get('/applianceclasses', apiSecured, api_controller.getApplianceClasses)

api.get('/applianceclasses/:id', apiSecured, api_controller.getApplianceClass)

api.put('/applianceclasses/:id', apiSecured, api_controller.updateApplianceClass)

api.post('/applianceclasses/new', apiSecured, api_controller.newApplianceClass)

api.delete('/applianceclasses/:id', apiSecured, api_controller.removeApplianceClass)


/**
 * Brigade Route Handler
 */
api.get('/brigades/all', apiSecured, api_controller.getBrigades)

api.post('/brigades/new', apiSecured, api_controller.newBrigade)

api.get('/brigades/:id', apiSecured, api_controller.getBrigade)

api.post('/brigades/:id', apiSecured, api_controller.updateBrigade)

api.delete('/brigades/:id', apiSecured, api_controller.removeBrigade)


/**
 * Campaign Route Handler
 */
api.get('/campaigns', apiSecured, api_controller.getCampaigns)

api.get('/campaigns/status/:status', apiSecured, api_controller.getCampaignsByStatus)

api.get('/campaigns/:id', apiSecured, api_controller.getCampaign)

api.post('/campaigns/new', apiSecured, api_controller.newCampaign)

api.post('/campaigns/:id', apiSecured, api_controller.updateCampaign)

api.delete('/campaigns/:id', apiSecured, api_controller.removeCampaign)


/**
 * Routes Route Handler
 */
api.get('/routes', apiSecured, api_controller.getRoutes)

api.get('/routes/campaign/:campaignId', apiSecured, api_controller.getRoutesByCampaign)

api.get('/routes/:id', apiSecured, api_controller.getRoute)

api.post('/routes/new', apiSecured, api_controller.newRoute)

api.post('/routes/:id', apiSecured, api_controller.updateRoute)

api.delete('/routes/:id', apiSecured, api_controller.removeRoute)

/**
 * Export our api module.
 */
module.exports = api