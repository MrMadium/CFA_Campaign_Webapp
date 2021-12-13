const api = require('express').Router();
const api_controller = require('../controllers/apiController');
const { apiSecured } = require('../middlewares/auth');

api.get('/', api_controller.index);

api.post('/login', api_controller.authUser)

api.get('/users', apiSecured, api_controller.getUsers)

api.post('/users/new', apiSecured, api_controller.newUser)

api.get('/users/:id', apiSecured, api_controller.getUser)

api.post('/users/:id', apiSecured, api_controller.updateUser)

api.delete('/users/:id', apiSecured, api_controller.removeUser)

api.get('/roles', apiSecured, api_controller.getRoles)

api.get('/roles/:id', apiSecured, api_controller.getRole)

api.put('/roles/:id', apiSecured, api_controller.updateRole)

api.post('/roles/new', apiSecured, api_controller.newRole)

api.delete('/roles/:id', apiSecured, api_controller.removeRole)

api.get('/appliances', apiSecured, api_controller.getAppliances)

api.get('/appliances/brigade/:brigadeId', apiSecured, api_controller.getAppliancesByBrigade)

api.get('/appliances/:id', apiSecured, api_controller.getAppliance)

api.put('/appliances/:id', apiSecured, api_controller.updateAppliance)

api.post('/appliances/new', apiSecured, api_controller.newAppliance)

api.delete('/appliances/:id', apiSecured, api_controller.removeAppliance)

api.get('/applianceClasses', apiSecured, api_controller.getApplianceClasses)

api.get('/applianceClasses/:id', apiSecured, api_controller.getApplianceClass)

api.put('/applianceClasses/:id', apiSecured, api_controller.updateApplianceClass)

api.post('/applianceClasses/new', apiSecured, api_controller.newApplianceClass)

api.delete('/applianceClasses/:id', apiSecured, api_controller.removeApplianceClass)

api.get('/brigades', apiSecured, apiSecured, api_controller.getBrigades)

api.post('/brigades/new', apiSecured, apiSecured, api_controller.newBrigade)

api.get('/brigades/:id', apiSecured, apiSecured, api_controller.getBrigade)

api.post('/brigades/:id', apiSecured, apiSecured, api_controller.updateBrigade)

api.delete('/brigades/:id', apiSecured, apiSecured, api_controller.removeBrigade)

api.get('/campaigns', apiSecured, apiSecured, api_controller.getCampaigns)

api.get('/campaigns/brigade/:id', apiSecured, api_controller.getCampaignsByBrigade)

api.get('/campaigns/:id', apiSecured, apiSecured, api_controller.getCampaign)

api.put('/campaigns/:id', apiSecured, apiSecured, api_controller.updateCampaign)

api.post('/campaigns/new', apiSecured, apiSecured, api_controller.newCampaign)

api.delete('/campaigns/:id', apiSecured, apiSecured, api_controller.removeCampaign)

api.get('/routes', apiSecured, apiSecured, api_controller.getRoutes)

api.get('/routes/campaign/:campaignId', apiSecured, api_controller.getRoutesByCampaign)

api.get('/routes/:id', apiSecured, apiSecured, api_controller.getRoute)

api.put('/routes/:id', apiSecured, apiSecured, api_controller.updateRoute)

api.post('/routes/new', apiSecured, apiSecured, api_controller.newRoute)

api.delete('/routes/:id', apiSecured, apiSecured, api_controller.removeRoute)

module.exports = api