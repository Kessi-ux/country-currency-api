const express = require('express');
const router = express.Router();
const countryController = require('../controllers/countryControllers');

router.post('/refresh', countryController.refreshCountries);
router.get('/', countryController.getAllCountries);
router.get('/status', countryController.getStatus);
router.get('/image', countryController.getCountriesImage);
router.get('/:name', countryController.getCountryByName);
router.delete('/:name', countryController.deleteCountryByName);

module.exports = router;
